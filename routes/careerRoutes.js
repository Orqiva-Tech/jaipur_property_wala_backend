const express = require('express');
const router = express.Router();
const {
  getCareers,
  getCareerBySlug,
  createJobApplication,
  getAllCareers,
  createCareer,
  updateCareer,
  deleteCareer,
  getJobApplications,
  downloadResume,
  updateApplicationStatus
} = require('../controllers/careerController');
const { protectAdmin } = require('../middleware/auth');
const { uploadResume } = require('../middleware/upload');

// Public routes
router.get('/', getCareers);
router.get('/:slug', getCareerBySlug);
router.post('/apply', uploadResume.single('resume'), createJobApplication);

// Admin routes
router.get('/admin/all', protectAdmin, getAllCareers);
router.post('/admin/create', protectAdmin, createCareer);
router.put('/admin/:id', protectAdmin, updateCareer);
router.delete('/admin/:id', protectAdmin, deleteCareer);

router.get('/admin/applications', protectAdmin, getJobApplications);
router.get('/admin/applications/:id/resume', protectAdmin, downloadResume);
router.put('/admin/applications/:id', protectAdmin, updateApplicationStatus);

module.exports = router;
