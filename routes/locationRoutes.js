const express = require('express');
const router = express.Router();
const {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation
} = require('../controllers/locationController');
const { protectAdmin } = require('../middleware/auth');

// Public route to get locations
router.get('/', getLocations);

// Admin protected routes
router.post('/', protectAdmin, createLocation);
router.put('/:id', protectAdmin, updateLocation);
router.delete('/:id', protectAdmin, deleteLocation);

module.exports = router;
