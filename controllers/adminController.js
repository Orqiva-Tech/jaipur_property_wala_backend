const Admin = require('../models/Admin');
const Property = require('../models/Property');
const Enquiry = require('../models/Enquiry');
const JobApplication = require('../models/JobApplication');
const Career = require('../models/Career');
const Blog = require('../models/Blog');
const Settings = require('../models/Settings');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'jaipur_property_wala_super_secret_jwt_key_2026', {
    expiresIn: '7d'
  });
};

// @desc    Admin login
// @route   POST /api/admin/auth/login
// @access  Public
const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Access denied.'
      });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Access denied.'
      });
    }

    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: generateToken(admin._id),
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get authenticated admin profile
// @route   GET /api/admin/auth/me
// @access  Protected (Admin)
const getAdminProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    admin: req.admin
  });
};

// @desc    Get dashboard metrics & stats
// @route   GET /api/admin/stats
// @access  Protected (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalProperties,
      totalEnquiries,
      newEnquiries,
      totalApplications,
      activeJobs,
      publishedBlogs,
      recentEnquiries,
      recentApplications
    ] = await Promise.all([
      Property.countDocuments(),
      Enquiry.countDocuments(),
      Enquiry.countDocuments({ status: 'New' }),
      JobApplication.countDocuments(),
      Career.countDocuments({ isActive: true }),
      Blog.countDocuments({ isPublished: true }),
      Enquiry.find().sort({ createdAt: -1 }).limit(6),
      JobApplication.find().sort({ createdAt: -1 }).limit(6)
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalProperties,
        totalEnquiries,
        newEnquiries,
        totalApplications,
        activeJobs,
        publishedBlogs
      },
      recentEnquiries,
      recentApplications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get website settings (public or admin)
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update website settings
// @route   PUT /api/admin/settings
// @access  Protected (Admin)
const updateSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      settings = await Settings.findByIdAndUpdate(settings._id, req.body, {
        new: true,
        runValidators: true
      });
    }

    res.status(200).json({
      success: true,
      message: 'Website settings updated successfully',
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminLogin,
  getAdminProfile,
  getDashboardStats,
  getSettings,
  updateSettings
};
