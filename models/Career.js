const mongoose = require('mongoose');
const slugify = require('slugify');

const CareerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    index: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  employmentType: {
    type: String,
    enum: ['Full-Time', 'Part-Time', 'Internship', 'Consultant'],
    default: 'Full-Time'
  },
  location: {
    type: String,
    default: 'Jagatpura, Jaipur'
  },
  experience: {
    type: String,
    required: [true, 'Experience requirement is required']
  },
  salaryRange: {
    type: String,
    default: 'Best in Industry'
  },
  openings: {
    type: Number,
    default: 1
  },
  description: {
    type: String,
    default: 'Career opening at Jaipur Property Wala'
  },
  responsibilities: [{
    type: String
  }],
  qualifications: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

CareerSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Math.floor(1000 + Math.random() * 9000);
  }
  next();
});

module.exports = mongoose.model('Career', CareerSchema);
