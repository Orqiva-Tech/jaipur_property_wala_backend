const Property = require('../models/Property');

// @desc    Get all properties with filtering, search & pagination
// @route   GET /api/properties
// @access  Public
const getProperties = async (req, res, next) => {
  try {
    const {
      search,
      city,
      location,
      category,
      type,
      status,
      minPrice,
      maxPrice,
      jdaApproved,
      sort,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.area': { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } }
      ];
    }

    if (city && city !== 'All') {
      query['location.city'] = { $regex: `^${city}`, $options: 'i' };
    }

    if (location && location !== 'All') {
      // If query already has an $or, combine with $and
      const locationCondition = [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.area': { $regex: location, $options: 'i' } }
      ];

      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: locationCondition }];
        delete query.$or;
      } else {
        query.$or = locationCondition;
      }
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (type && type !== 'All') {
      query.type = type;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (jdaApproved === 'true') {
      query.jdaApproved = true;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') sortOption = { price: 1 };
    if (sort === 'price-high') sortOption = { price: -1 };
    if (sort === 'featured') sortOption = { featured: -1, createdAt: -1 };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Property.countDocuments(query);
    const properties = await Property.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: properties
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured properties for homepage
// @route   GET /api/properties/featured
// @access  Public
const getFeaturedProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ featured: true })
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single property by slug
// @route   GET /api/properties/:slug
// @access  Public
const getPropertyBySlug = async (req, res, next) => {
  try {
    const property = await Property.findOne({ slug: req.params.slug });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Increment view count
    property.views = (property.views || 0) + 1;
    await property.save({ validateBeforeSave: false });

    // Fetch related properties in same city or area or category
    const related = await Property.find({
      _id: { $ne: property._id },
      $or: [
        { 'location.city': property.location.city },
        { 'location.area': property.location.area },
        { category: property.category }
      ]
    }).limit(3);

    res.status(200).json({
      success: true,
      data: property,
      related
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to safely sanitize incoming property data
const sanitizePropertyData = (rawData, files = []) => {
  const data = { ...rawData };

  // Parse plotSizes
  if (typeof data.plotSizes === 'string') {
    try {
      data.plotSizes = JSON.parse(data.plotSizes);
    } catch (e) {
      data.plotSizes = data.plotSizes.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
    }
  }

  // Parse amenities
  if (typeof data.amenities === 'string') {
    try {
      data.amenities = JSON.parse(data.amenities);
    } catch (e) {
      data.amenities = data.amenities.split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  // Parse location
  if (typeof data.location === 'string') {
    try {
      data.location = JSON.parse(data.location);
    } catch (e) {
      data.location = { area: data.location, city: 'Jaipur' };
    }
  }

  // Ensure location has defaults
  if (!data.location || typeof data.location !== 'object') {
    data.location = { area: 'Main Scheme', city: 'Jaipur' };
  }
  if (!data.location.city) {
    data.location.city = 'Jaipur';
  }
  if (!data.location.area) {
    data.location.area = data.title || 'Jaipur Prime';
  }

  // Sanitize numeric fields - completely optional
  if (data.price !== undefined && data.price !== '' && data.price !== null) {
    data.price = Number(data.price) || 0;
  } else {
    data.price = 0;
    data.priceOnRequest = true;
  }
  if (!data.priceDisplay || String(data.priceDisplay).trim() === '') {
    data.priceDisplay = data.price > 0 ? `₹${data.price.toLocaleString('en-IN')}` : 'Price on Request';
  }
  if (data.pricePerSqYd !== undefined && data.pricePerSqYd !== '' && data.pricePerSqYd !== null) {
    data.pricePerSqYd = Number(data.pricePerSqYd) || 0;
  } else {
    data.pricePerSqYd = 0;
  }

  // Sanitize boolean fields
  if (data.jdaApproved !== undefined) {
    data.jdaApproved = data.jdaApproved === 'true' || data.jdaApproved === true;
  }
  if (data.reraApproved !== undefined) {
    data.reraApproved = data.reraApproved === 'true' || data.reraApproved === true;
  }
  if (data.bankLoanAvailable !== undefined) {
    data.bankLoanAvailable = data.bankLoanAvailable === 'true' || data.bankLoanAvailable === true;
  }
  if (data.featured !== undefined) {
    data.featured = data.featured === 'true' || data.featured === true;
  }
  if (data.priceOnRequest !== undefined) {
    data.priceOnRequest = data.priceOnRequest === 'true' || data.priceOnRequest === true;
  }

  // Attach uploaded files if present
  if (files && files.length > 0) {
    const filePaths = files.map(file => `/uploads/properties/${file.filename}`);
    data.images = data.images
      ? (Array.isArray(data.images) ? [...data.images, ...filePaths] : [data.images, ...filePaths])
      : filePaths;
  }

  // If no images provided at all, give a high quality default
  if (!data.images || data.images.length === 0) {
    data.images = ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'];
  }

  return data;
};

// @desc    Create new property
// @route   POST /api/properties or /api/admin/properties
// @access  Protected (Admin)
const createProperty = async (req, res, next) => {
  try {
    const data = sanitizePropertyData(req.body, req.files);
    const property = await Property.create(data);

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: property
    });
  } catch (error) {
    console.error('[createProperty Error]', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error saving property'
    });
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id or /api/admin/properties/:id
// @access  Protected (Admin)
const updateProperty = async (req, res, next) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    const data = sanitizePropertyData(req.body, req.files);

    // Keep existing images if no new ones replaced
    if (!req.files || req.files.length === 0) {
      if (property.images && property.images.length > 0 && (!data.images || data.images.length === 0)) {
        data.images = property.images;
      }
    }

    property = await Property.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      data: property
    });
  } catch (error) {
    console.error('[updateProperty Error]', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error updating property'
    });
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id or /api/admin/properties/:id
// @access  Protected (Admin)
const deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    await property.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProperties,
  getFeaturedProperties,
  getPropertyBySlug,
  createProperty,
  updateProperty,
  deleteProperty
};
