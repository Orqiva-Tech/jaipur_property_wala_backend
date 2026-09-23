const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Connect to MongoDB
connectDB();

const app = express();

// Security & Utility Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: '*', // Allows development client and production host
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Serve Public Uploads (Properties & Gallery photos)
app.use('/uploads/properties', express.static(path.join(__dirname, 'uploads/properties')));
app.use('/uploads/gallery', express.static(path.join(__dirname, 'uploads/gallery')));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'Jaipur Property Wala API',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/admin/properties', require('./routes/propertyRoutes'));
app.use('/api/locations', require('./routes/locationRoutes'));
app.use('/api/admin/locations', require('./routes/locationRoutes'));
app.use('/api/enquiries', require('./routes/enquiryRoutes'));
app.use('/api/admin/enquiries', require('./routes/enquiryRoutes'));
app.use('/api/careers', require('./routes/careerRoutes'));
app.use('/api/admin/careers', require('./routes/careerRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/admin/gallery', require('./routes/galleryRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/admin/blogs', require('./routes/blogRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/settings', (req, res, next) => {
  const adminController = require('./controllers/adminController');
  adminController.getSettings(req, res, next);
});

// Central Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[Jaipur Property Wala API] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
});
