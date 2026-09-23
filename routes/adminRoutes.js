const express = require('express');
const router = express.Router();
const {
  adminLogin,
  getAdminProfile,
  getDashboardStats,
  getSettings,
  updateSettings
} = require('../controllers/adminController');
const { protectAdmin } = require('../middleware/auth');

// Public
router.post('/auth/login', adminLogin);
router.get('/settings', getSettings);

// Protected
router.get('/auth/me', protectAdmin, getAdminProfile);
router.get('/stats', protectAdmin, getDashboardStats);
router.put('/settings', protectAdmin, updateSettings);

module.exports = router;
