const Location = require('../models/Location');
const slugify = require('slugify');

// Initial default locations if DB is empty
const defaultLocations = [
  { name: 'Jaipur', slug: 'jaipur', state: 'Rajasthan', tagline: 'Pink City Corporate HQ', icon: '🏰', displayOrder: 1, status: 'Active' },
  { name: 'Ajmer', slug: 'ajmer', state: 'Rajasthan', tagline: 'Smart City Industrial Corridor', icon: '🕌', displayOrder: 2, status: 'Active' },
  { name: 'Kishangarh', slug: 'kishangarh', state: 'Rajasthan', tagline: 'Marble City NH-8 Expressway', icon: '🏛️', displayOrder: 3, status: 'Active' },
  { name: 'Mumbai', slug: 'mumbai', state: 'Maharashtra', tagline: 'Financial Capital Coastal Hub', icon: '🌊', displayOrder: 4, status: 'Active' }
];

// @desc    Get all locations (auto-seeds defaults if empty)
// @route   GET /api/locations
// @access  Public
const getLocations = async (req, res, next) => {
  try {
    let count = await Location.countDocuments();
    if (count === 0) {
      for (const loc of defaultLocations) {
        await Location.updateOne(
          { name: loc.name },
          { $set: loc },
          { upsert: true }
        );
      }
    }

    const { status, all } = req.query;
    const query = {};
    if (!all && status !== 'all') {
      query.status = 'Active';
    }

    const locations = await Location.find(query).sort({ displayOrder: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      count: locations.length,
      data: locations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new location
// @route   POST /api/locations or /api/admin/locations
// @access  Protected (Admin)
const createLocation = async (req, res, next) => {
  try {
    const { name, state, tagline, icon, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Location / City name is required.'
      });
    }

    const trimmedName = name.trim();
    const existing = await Location.findOne({ name: { $regex: new RegExp(`^${trimmedName}$`, 'i') } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Location "${trimmedName}" already exists.`
      });
    }

    const slug = slugify(trimmedName, { lower: true, strict: true });

    const location = await Location.create({
      name: trimmedName,
      slug,
      state: state ? state.trim() : 'Rajasthan',
      tagline: tagline ? tagline.trim() : 'Prime Growth Corridor',
      icon: icon || '📍',
      status: status || 'Active'
    });

    res.status(201).json({
      success: true,
      message: `Location "${location.name}" added successfully!`,
      data: location
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update location
// @route   PUT /api/locations/:id
// @access  Protected (Admin)
const updateLocation = async (req, res, next) => {
  try {
    const { name, state, tagline, icon, status } = req.body;
    const location = await Location.findById(req.params.id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    if (name) {
      location.name = name.trim();
      location.slug = slugify(location.name, { lower: true, strict: true });
    }
    if (state) location.state = state.trim();
    if (tagline !== undefined) location.tagline = tagline.trim();
    if (icon) location.icon = icon;
    if (status) location.status = status;

    await location.save();

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      data: location
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete location
// @route   DELETE /api/locations/:id
// @access  Protected (Admin)
const deleteLocation = async (req, res, next) => {
  try {
    const location = await Location.findById(req.params.id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    await location.deleteOne();

    res.status(200).json({
      success: true,
      message: `Location "${location.name}" deleted successfully`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation
};
