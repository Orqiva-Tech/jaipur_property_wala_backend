const express = require('express');
const router = express.Router();
const {
  getGalleryItems,
  createGalleryItem,
  deleteGalleryItem
} = require('../controllers/galleryController');
const { protectAdmin } = require('../middleware/auth');
const { uploadMedia } = require('../middleware/upload');

// Public
router.get('/', getGalleryItems);

// Admin
router.post('/', protectAdmin, uploadMedia.single('media'), createGalleryItem);
router.delete('/:id', protectAdmin, deleteGalleryItem);

module.exports = router;
