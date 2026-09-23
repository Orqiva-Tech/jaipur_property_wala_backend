const express = require('express');
const router = express.Router();
const {
  getProperties,
  getFeaturedProperties,
  getPropertyBySlug,
  createProperty,
  updateProperty,
  deleteProperty
} = require('../controllers/propertyController');
const { protectAdmin } = require('../middleware/auth');
const { uploadMedia } = require('../middleware/upload');

// Public routes
router.get('/', getProperties);
router.get('/featured', getFeaturedProperties);
router.get('/:slug', getPropertyBySlug);

// Admin routes
router.post('/', protectAdmin, uploadMedia.array('images', 8), createProperty);
router.put('/:id', protectAdmin, uploadMedia.array('images', 8), updateProperty);
router.delete('/:id', protectAdmin, deleteProperty);

module.exports = router;
