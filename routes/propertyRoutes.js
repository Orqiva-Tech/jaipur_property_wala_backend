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

// Direct file upload endpoints (returns public URLs)
router.post('/upload', protectAdmin, uploadMedia.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file received' });
  }
  const fileUrl = `/uploads/properties/${req.file.filename}`;
  res.status(200).json({
    success: true,
    url: fileUrl,
    filename: req.file.filename
  });
});

router.post('/upload-multiple', protectAdmin, uploadMedia.array('files'), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files received' });
  }
  const urls = req.files.map(f => `/uploads/properties/${f.filename}`);
  res.status(200).json({
    success: true,
    urls,
    count: urls.length
  });
});

// Admin routes (supports unlimited/high-volume image uploads)
router.post('/', protectAdmin, uploadMedia.array('images'), createProperty);
router.put('/:id', protectAdmin, uploadMedia.array('images'), updateProperty);
router.delete('/:id', protectAdmin, deleteProperty);

module.exports = router;
