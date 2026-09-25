const Gallery = require('../models/Gallery');
const {
  isCloudinaryConfigured,
  uploadToCloudinary,
  deleteFromCloudinary
} = require('../config/cloudinary');

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
      const isVideo = req.file.mimetype && req.file.mimetype.startsWith('video');
      data.mediaType = isVideo ? 'video' : 'image';

      try {
        const cloudRes = await uploadToCloudinary(
          req.file.path,
          'jaipur_property_wala/gallery',
          isVideo ? 'video' : 'image'
        );
        data.mediaUrl = cloudRes.url;
      } catch (cloudErr) {
        console.error('[Cloudinary gallery upload error]', cloudErr);
        return res.status(500).json({
          success: false,
          message: `Cloudinary upload failed: ${cloudErr.message}`
        });
      }
    }

    if (!data.mediaUrl) {
      return res.status(400).json({
        success: false,
        message: 'Media URL or file upload is required'
      });
    }

    // Auto-detect YouTube URL
    if (data.mediaUrl && typeof data.mediaUrl === 'string') {
      const ytMatch = data.mediaUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (ytMatch) {
        data.mediaType = 'video';
        if (!data.thumbnailUrl) {
          data.thumbnailUrl = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
        }
      }
    }

    if (!data.thumbnailUrl && data.mediaUrl) {
      if (data.mediaType === 'image') {
        data.thumbnailUrl = data.mediaUrl;
      } else if (data.mediaType === 'video') {
        if (data.mediaUrl.includes('res.cloudinary.com')) {
          data.thumbnailUrl = data.mediaUrl.replace(/\.(mp4|mov|webm|mkv|m4v)$/i, '.jpg');
        } else {
          data.thumbnailUrl = 'https://res.cloudinary.com/ripzq8zx/image/upload/v1790233295/jaipur_property_wala/gallery/srttotuajh6zdgxx91yz.jpg';
        }
      }
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

    if (item.mediaUrl && typeof item.mediaUrl === 'string' && item.mediaUrl.includes('res.cloudinary.com')) {
      const resType = item.mediaType === 'video' ? 'video' : 'image';
      deleteFromCloudinary(item.mediaUrl, resType).catch(() => {});
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
