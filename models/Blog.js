const mongoose = require('mongoose');
const slugify = require('slugify');

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    index: true
  },
  excerpt: {
    type: String,
    required: [true, 'Excerpt is required'],
    maxlength: 350
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  coverImage: {
    type: String,
    required: [true, 'Cover image is required']
  },
  author: {
    type: String,
    default: 'Jaipur Property Wala Editorial'
  },
  category: {
    type: String,
    default: 'JDA Plots & Investment Guide'
  },
  tags: [{
    type: String
  }],
  isPublished: {
    type: Boolean,
    default: true
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  readTime: {
    type: String,
    default: '5 min read'
  },
  seoTitle: {
    type: String,
    default: ''
  },
  seoDescription: {
    type: String,
    default: ''
  },
  views: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

BlogSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Math.floor(1000 + Math.random() * 9000);
  }
  next();
});

module.exports = mongoose.model('Blog', BlogSchema);
