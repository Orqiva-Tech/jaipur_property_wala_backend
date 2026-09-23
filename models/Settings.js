const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  companyName: {
    type: String,
    default: 'JAIPUR PROPERTY WALA'
  },
  tagline: {
    type: String,
    default: 'Premier JDA Approved Residential & Commercial Plots in Jaipur'
  },
  phone: {
    type: String,
    default: '09828226566'
  },
  alternatePhone: {
    type: String,
    default: '+91 98282 26566'
  },
  whatsapp: {
    type: String,
    default: '919828226566'
  },
  email: {
    type: String,
    default: 'info@jaipurpropertywala.in'
  },
  address: {
    type: String,
    default: 'Livasha Flat No.301, Mahal Yojna, Mahal Road Scheme, Jagatpura, Jaipur - 302017, Rajasthan'
  },
  mapEmbedUrl: {
    type: String,
    default: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d113941.51733246473!2d75.76839352932943!3d26.818814524458826!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396dc9e208b0beab%3A0xe542fe882433e387!2sJagatpura%2C%20Jaipur%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin'
  },
  officeTimings: {
    type: String,
    default: 'Monday - Sunday: 9:00 AM - 8:00 PM'
  },
  stats: {
    yearsExperience: { type: String, default: '20+' },
    satisfiedClients: { type: String, default: '4500+' },
    jdaPlotsSold: { type: String, default: '3200+' },
    bankLoanApproval: { type: String, default: '80% All Banks' }
  },
  socialLinks: {
    facebook: { type: String, default: 'https://facebook.com/' },
    instagram: { type: String, default: 'https://instagram.com/' },
    youtube: { type: String, default: 'https://youtube.com/' },
    linkedin: { type: String, default: 'https://linkedin.com/' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
