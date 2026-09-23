const Career = require('../models/Career');
const JobApplication = require('../models/JobApplication');
const path = require('path');
const fs = require('fs');

// @desc    Get all active careers
// @route   GET /api/careers
// @access  Public
const getCareers = async (req, res, next) => {
  try {
    const careers = await Career.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: careers.length,
      data: careers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get career by slug
// @route   GET /api/careers/:slug
// @access  Public
const getCareerBySlug = async (req, res, next) => {
  try {
    const career = await Career.findOne({ slug: req.params.slug, isActive: true });
    if (!career) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }
    res.status(200).json({
      success: true,
      data: career
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply for a job with resume upload
// @route   POST /api/job-applications
// @access  Public
const createJobApplication = async (req, res, next) => {
  try {
    const { careerId, jobTitle, fullName, email, phone, currentLocation, experienceYears, coverLetter } = req.body;

    if (!fullName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Full Name, Email, and Phone number are required.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload your resume in PDF or DOC format.'
      });
    }

    const application = await JobApplication.create({
      careerId: careerId || null,
      jobTitle: jobTitle || 'General Application',
      fullName,
      email,
      phone,
      currentLocation: currentLocation || 'Jaipur',
      experienceYears: experienceYears || 'Fresher',
      coverLetter: coverLetter || '',
      resumePath: `/uploads/resumes/${req.file.filename}`,
      resumeOriginalName: req.file.originalname
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! Our HR team will review your profile.',
      data: {
        id: application._id,
        fullName: application.fullName
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all careers (Admin)
// @route   GET /api/admin/careers
// @access  Protected (Admin)
const getAllCareers = async (req, res, next) => {
  try {
    const careers = await Career.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: careers.length,
      data: careers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create job opening
// @route   POST /api/admin/careers
// @access  Protected (Admin)
const createCareer = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (typeof data.responsibilities === 'string') {
      try { data.responsibilities = JSON.parse(data.responsibilities); } catch (e) {
        data.responsibilities = data.responsibilities.split('\n').map(s => s.trim()).filter(Boolean);
      }
    }
    if (typeof data.qualifications === 'string') {
      try { data.qualifications = JSON.parse(data.qualifications); } catch (e) {
        data.qualifications = data.qualifications.split('\n').map(s => s.trim()).filter(Boolean);
      }
    }

    const career = await Career.create(data);
    res.status(201).json({
      success: true,
      message: 'Job opening posted successfully',
      data: career
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update career opening
// @route   PUT /api/admin/careers/:id
// @access  Protected (Admin)
const updateCareer = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (typeof data.responsibilities === 'string') {
      try { data.responsibilities = JSON.parse(data.responsibilities); } catch (e) {
        data.responsibilities = data.responsibilities.split('\n').map(s => s.trim()).filter(Boolean);
      }
    }
    if (typeof data.qualifications === 'string') {
      try { data.qualifications = JSON.parse(data.qualifications); } catch (e) {
        data.qualifications = data.qualifications.split('\n').map(s => s.trim()).filter(Boolean);
      }
    }

    const career = await Career.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true
    });

    if (!career) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: career
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete career
// @route   DELETE /api/admin/careers/:id
// @access  Protected (Admin)
const deleteCareer = async (req, res, next) => {
  try {
    const career = await Career.findById(req.params.id);
    if (!career) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    await career.deleteOne();
    res.status(200).json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all job applications
// @route   GET /api/admin/job-applications
// @access  Protected (Admin)
const getJobApplications = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { jobTitle: { $regex: search, $options: 'i' } }
      ];
    }

    const applications = await JobApplication.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download resume securely (Admin only)
// @route   GET /api/admin/job-applications/:id/resume
// @access  Protected (Admin)
const downloadResume = async (req, res, next) => {
  try {
    const application = await JobApplication.findById(req.params.id);
    if (!application || !application.resumePath) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    const filename = path.basename(application.resumePath);
    const filePath = path.join(__dirname, '../uploads/resumes', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Resume file missing on server' });
    }

    res.download(filePath, application.resumeOriginalName || filename);
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status & notes
// @route   PUT /api/admin/job-applications/:id
// @access  Protected (Admin)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const application = await JobApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (status) application.status = status;
    if (adminNotes !== undefined) application.adminNotes = adminNotes;

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application updated successfully',
      data: application
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
