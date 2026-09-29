const express = require('express');
const router = express.Router();
const {
  adminLogin,
  getAdminProfile,
  changePassword,
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
router.put('/auth/change-password', protectAdmin, changePassword);
router.post('/auth/change-password', protectAdmin, changePassword);
router.get('/stats', protectAdmin, getDashboardStats);
router.put('/settings', protectAdmin, updateSettings);

module.exports = router;
