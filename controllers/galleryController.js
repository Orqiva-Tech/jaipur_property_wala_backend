const Gallery = require('../models/Gallery');

// @desc    Get gallery items with optional category & location filter
// @route   GET /api/gallery
// @access  Public
const getGalleryItems = async (req, res, next) => {
  try {
    const { category, location } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (location && location !== 'All') {
      query.location = { $regex: location, $options: 'i' };
    }

    const items = await Gallery.find(query).sort({ isFeatured: -1, displayOrder: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create gallery item
// @route   POST /api/gallery or /api/admin/gallery
// @access  Protected (Admin)
const createGalleryItem = async (req, res, next) => {
  try {
    const data = { ...req.body };

    if (req.file) {
      data.mediaUrl = `/uploads/gallery/${req.file.filename}`;
      if (req.file.mimetype.startsWith('video')) {
        data.mediaType = 'video';
      } else {
        data.mediaType = 'image';
      }
    }

    if (!data.mediaUrl) {
      return res.status(400).json({
        success: false,
        message: 'Media URL or file upload is required'
      });
    }

    if (!data.location) {
      data.location = 'Jaipur';
    }

    const item = await Gallery.create(data);

    res.status(201).json({
      success: true,
      message: 'Gallery item added successfully',
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete gallery item
// @route   DELETE /api/gallery/:id or /api/admin/gallery/:id
// @access  Protected (Admin)
const deleteGalleryItem = async (req, res, next) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Gallery item not found' });
    }
    await item.deleteOne();
    res.status(200).json({ success: true, message: 'Gallery item deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGalleryItems,
  createGalleryItem,
  deleteGalleryItem
};
