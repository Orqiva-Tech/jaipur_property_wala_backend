const mongoose = require('mongoose');
const slugify = require('slugify');

const LocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Location / City name is required'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    index: true
  },
  state: {
    type: String,
    default: 'Rajasthan',
    trim: true
  },
  tagline: {
    type: String,
    default: 'Prime Growth Corridor'
  },
  icon: {
    type: String,
    default: '📍'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  isPopular: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

LocationSchema.pre('validate', function (next) {
  if (this.name && (!this.slug || this.isModified('name'))) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Location', LocationSchema);
