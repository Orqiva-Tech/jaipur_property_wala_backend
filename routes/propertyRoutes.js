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

const { isCloudinaryConfigured, uploadToCloudinary } = require('../config/cloudinary');

// Public routes
router.get('/', getProperties);
router.get('/featured', getFeaturedProperties);
router.get('/:slug', getPropertyBySlug);

// Direct file upload endpoints (returns public Cloudinary or static URLs)
router.post('/upload', protectAdmin, uploadMedia.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file received' });
  }

  try {
    if (isCloudinaryConfigured()) {
      const isVideo = req.file.mimetype.startsWith('video');
      const cloudRes = await uploadToCloudinary(
        req.file.path,
        'jaipur_property_wala/properties',
        isVideo ? 'video' : 'image'
      );
      return res.status(200).json({
        success: true,
        url: cloudRes.url,
        public_id: cloudRes.public_id,
        filename: req.file.filename
      });
    }
  } catch (cloudErr) {
    console.error('[Cloudinary upload failed, falling back to local path]', cloudErr.message);
  }

  const fileUrl = `/uploads/properties/${req.file.filename}`;
  res.status(200).json({
    success: true,
    url: fileUrl,
    filename: req.file.filename
  });
});

router.post('/upload-multiple', protectAdmin, uploadMedia.array('files'), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files received' });
  }

  try {
    if (isCloudinaryConfigured()) {
      const uploadPromises = req.files.map(file => {
        const isVideo = file.mimetype.startsWith('video');
        return uploadToCloudinary(
          file.path,
          'jaipur_property_wala/properties',
          isVideo ? 'video' : 'image'
        )
          .then(res => res.url)
          .catch(err => {
            console.error('[Cloudinary single file upload error]', err.message);
            return `/uploads/properties/${file.filename}`;
          });
      });
      const urls = await Promise.all(uploadPromises);
      return res.status(200).json({
        success: true,
        urls,
        count: urls.length
      });
    }
  } catch (cloudErr) {
    console.error('[Cloudinary multi-upload failed, falling back to local path]', cloudErr.message);
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
