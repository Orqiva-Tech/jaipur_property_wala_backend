const mongoose = require('mongoose');

const EnquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  interestedProperty: {
    type: String,
    default: 'General Consultation'
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  },
  preferredLocation: {
    type: String,
    default: 'Jaipur'
  },
  budget: {
    type: String,
    default: 'Any'
  },
  message: {
    type: String,
    default: ''
  },
  source: {
    type: String,
    default: 'Website'
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Site Visit Scheduled', 'Negotiation', 'Closed', 'Archived'],
    default: 'New'
  },
  internalNotes: [{
    note: String,
    author: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  ipAddress: String
}, { timestamps: true });

module.exports = mongoose.model('Enquiry', EnquirySchema);
