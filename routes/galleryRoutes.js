const express = require('express');
const router = express.Router();
const {
  getGalleryItems,
  createGalleryItem,
  deleteGalleryItem
} = require('../controllers/galleryController');
const { protectAdmin } = require('../middleware/auth');
const { uploadMedia } = require('../middleware/upload');

// Resilient upload handler accepting 'media', 'file', or any uploaded field without Multer "Unexpected field" errors
const uploadGalleryMedia = (req, res, next) => {
  uploadMedia.any()(req, res, (err) => {
    if (err) return next(err);
    if (req.files && req.files.length > 0) {
      req.file = req.files.find(f => f.fieldname === 'media') ||
                 req.files.find(f => f.fieldname === 'file') ||
                 req.files[0];
    }
    next();
  });
};

// Public
router.get('/', getGalleryItems);

// Admin
router.post('/', protectAdmin, uploadGalleryMedia, createGalleryItem);
router.delete('/:id', protectAdmin, deleteGalleryItem);

module.exports = router;
