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

const { isCloudinaryConfigured, uploadMediaFile } = require('../config/cloudinary');

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
    const isVideo = req.file.mimetype && req.file.mimetype.startsWith('video');
    // Cloudinary Free tier strictly enforces a 100MB maximum limit on video files.
    // If a video is > 80MB, serve it directly from local static storage /uploads/properties/
    if (isCloudinaryConfigured() && (!isVideo || req.file.size < 80 * 1024 * 1024)) {
      const cloudRes = await uploadMediaFile(
        req.file,
        'jaipur_property_wala/properties',
        isVideo ? 'video' : 'image'
      );
      return res.status(200).json({
        success: true,
        url: cloudRes.url,
        public_id: cloudRes.public_id,
        filename: req.file.filename || req.file.originalname
      });
    }
  } catch (cloudErr) {
    console.warn('[Cloudinary upload warning, falling back to local path]', cloudErr.message);
  }

  // Fallback: serve from local static if file was written to disk
  if (req.file.path && req.file.filename) {
    const fileUrl = `/uploads/properties/${req.file.filename}`;
    return res.status(200).json({ success: true, url: fileUrl, filename: req.file.filename });
  }

  return res.status(500).json({ success: false, message: 'Upload failed — no storage available.' });
});

router.post('/upload-multiple', protectAdmin, uploadMedia.array('files'), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files received' });
  }

  try {
    if (isCloudinaryConfigured()) {
      const uploadPromises = req.files.map(file => {
        const isVideo = file.mimetype && file.mimetype.startsWith('video');
        return uploadMediaFile(
          file,
          'jaipur_property_wala/properties',
          isVideo ? 'video' : 'image'
        )
          .then(res => res.url)
          .catch(err => {
            console.warn('[Cloudinary single file upload warning]', err.message);
            return file.path ? `/uploads/properties/${file.filename}` : null;
          });
      });
      const urls = (await Promise.all(uploadPromises)).filter(Boolean);
      return res.status(200).json({
        success: true,
        urls,
        count: urls.length
      });
    }
  } catch (cloudErr) {
    console.warn('[Cloudinary multi-upload warning, falling back to local path]', cloudErr.message);
  }

  const urls = req.files.filter(f => f.path && f.filename).map(f => `/uploads/properties/${f.filename}`);
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
