const mongoose = require('mongoose');

const JobApplicationSchema = new mongoose.Schema({
  careerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Career'
  },
  jobTitle: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  currentLocation: {
    type: String,
    default: 'Jaipur'
  },
  experienceYears: {
    type: String,
    default: 'Fresher'
  },
  coverLetter: {
    type: String,
    default: ''
  },
  resumePath: {
    type: String,
    required: [true, 'Resume file is required']
  },
  resumeOriginalName: {
    type: String,
    default: 'resume.pdf'
  },
  status: {
    type: String,
    enum: ['New', 'Reviewed', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Hired'],
    default: 'New'
  },
  adminNotes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('JobApplication', JobApplicationSchema);
