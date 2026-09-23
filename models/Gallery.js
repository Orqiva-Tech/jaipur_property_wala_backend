const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  category: {
    type: String,
    enum: [
      'Project Photos',
      'Construction Progress',
      'Completed Projects',
      'Property Site Visits',
      'Events',
      'Videos'
    ],
    required: [true, 'Category is required']
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    default: 'image'
  },
  mediaUrl: {
    type: String,
    required: [true, 'Media URL is required']
  },
  thumbnailUrl: {
    type: String,
    default: ''
  },
  caption: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: 'Jaipur'
  },
  projectName: {
    type: String,
    default: ''
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Gallery', GallerySchema);
