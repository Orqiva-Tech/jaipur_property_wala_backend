const express = require('express');
const router = express.Router();
const {
  createEnquiry,
  getEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
  deleteEnquiryNote,
  exportEnquiriesCSV
} = require('../controllers/enquiryController');
const { protectAdmin } = require('../middleware/auth');

// Public route to submit lead
router.post('/', createEnquiry);

// Admin routes
router.get('/', protectAdmin, getEnquiries);
router.get('/export', protectAdmin, exportEnquiriesCSV);
router.put('/:id', protectAdmin, updateEnquiryStatus);
router.delete('/:id', protectAdmin, deleteEnquiry);
router.delete('/:id/notes/:noteId', protectAdmin, deleteEnquiryNote);

module.exports = router;
