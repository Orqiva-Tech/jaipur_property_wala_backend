const mongoose = require('mongoose');
const slugify = require('slugify');

const PropertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Property title is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    index: true
  },
  tagline: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Property description is required']
  },
  category: {
    type: String,
    enum: ['Residential', 'Commercial', 'Industrial', 'Agricultural', 'Mixed-Use'],
    default: 'Residential'
  },
  type: {
    type: String,
    enum: ['Plot', 'Villa', 'Apartment', 'Farmhouse', 'Commercial Plot', 'Shop'],
    default: 'Plot'
  },
  location: {
    area: {
      type: String,
      required: [true, 'Area / Location is required'],
      trim: true
    },
    city: {
      type: String,
      default: 'Jaipur'
    },
    address: {
      type: String,
      trim: true
    },
    landmark: String,
    mapEmbedUrl: String
  },
  price: {
    type: Number,
    default: 0
  },
  priceDisplay: {
    type: String,
    default: 'Price on Request'
  },
  pricePerSqYd: {
    type: Number,
    default: 0
  },
  priceOnRequest: {
    type: Boolean,
    default: false
  },
  showPrice: {
    type: Boolean,
    default: true
  },
  virtualTourUrl: {
    type: String,
    default: ''
  },
  imageHighlights: [{
    image: { type: String, default: '' },
    title: { type: String, default: '' },
    description: { type: String, default: '' }
  }],
  nearbyLocations: [{
    name: { type: String, default: '' },
    distance: { type: String, default: '' },
    category: { type: String, default: 'Landmark' },
    icon: { type: String, default: '📍' }
  }],
  plotSizes: [{
    type: Number
  }],
  sizeUnit: {
    type: String,
    default: 'Sq. Yards'
  },
  status: {
    type: String,
    enum: ['Ready to Move', 'Ongoing', 'Upcoming', 'Sold Out'],
    default: 'Ongoing'
  },
  jdaApproved: {
    type: Boolean,
    default: true
  },
  reraApproved: {
    type: Boolean,
    default: true
  },
  reraNumber: {
    type: String,
    default: ''
  },
  bankLoanAvailable: {
    type: Boolean,
    default: true
  },
  bankLoanDetails: {
    type: String,
    default: '80% Loan Available from all leading government and private banks'
  },
  amenities: [{
    type: String
  }],
  images: [{
    type: String
  }],
  featured: {
    type: Boolean,
    default: false
  },
  brochureUrl: {
    type: String,
    default: ''
  },
  views: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

PropertySchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Math.floor(1000 + Math.random() * 9000);
  }
  next();
});

module.exports = mongoose.model('Property', PropertySchema);
