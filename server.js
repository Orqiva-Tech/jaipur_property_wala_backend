const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Connect to MongoDB & ensure default admin exists
const ensureDefaultAdmin = async () => {
  try {
    const Admin = require('./models/Admin');
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@jaipurpropertywala.in').trim().toLowerCase();
    const adminExists = await Admin.findOne({ email: adminEmail });
    if (!adminExists) {
      const adminPassword = (process.env.ADMIN_PASSWORD || 'Admin@JaipurPropertyWala2026').trim();
      await Admin.create({
        name: 'Jaipur Property Wala Management',
        email: adminEmail,
        password: adminPassword,
        role: 'superadmin'
      });
      console.log(`[Auto-Init] Default superadmin account ensured: ${adminEmail}`);
    }
  } catch (err) {
    console.error('[Auto-Init Admin Error]:', err.message);
  }
};

connectDB().then(() => {
  ensureDefaultAdmin();
});

const app = express();

// Allowed Origins for Production & Development
const allowedOrigins = [
  'https://jaipurpropertywala.in',
  'https://www.jaipurpropertywala.in',
  'https://admin.jaipurpropertywala.in',
  'https://api.jaipurpropertywala.in',
  'https://property.dobhi.in',
  'https://adminproperti.dobhi.in',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5180',
  'http://localhost:5181',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5180',
  'http://127.0.0.1:5181'
];

if (process.env.CLIENT_URL && process.env.CLIENT_URL !== '*') {
  process.env.CLIENT_URL.split(',').forEach(url => {
    const trimmed = url.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

// Security & Utility Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, server-to-server, health check)
    if (!origin) return callback(null, true);
    
    // Check exact match, subdomains of jaipurpropertywala.in, dobhi.in, or localhost
    const isAllowed = 
      allowedOrigins.includes(origin) ||
      origin.endsWith('.jaipurpropertywala.in') ||
      origin === 'https://jaipurpropertywala.in' ||
      origin.endsWith('.dobhi.in') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      process.env.CLIENT_URL === '*';

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, true); // Fallback so no valid frontend client is blocked
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
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

// Diagnostic Email Test Route
app.get('/api/test-email', async (req, res) => {
  try {
    const { sendAdminEnquiryNotification, getSmtpCredentials } = require('./utils/emailService');
    const creds = getSmtpCredentials ? getSmtpCredentials() : {};
    const testResult = await sendAdminEnquiryNotification({
      name: 'Diagnostic Verification',
      phone: '+919251217568',
      email: 'admin@jaipurpropertywala.in',
      interestedProperty: 'Render Live Email Diagnostic Test',
      preferredLocation: 'Jaipur',
      budget: 'Any',
      message: 'Direct live test verifying that Render successfully dispatches email notifications to admin.',
      source: 'Render Live Diagnostic'
    });
    res.json({
      success: true,
      message: 'Diagnostic email test completed',
      emailResult: testResult,
      resolvedConfig: {
        user: creds.user,
        adminRecipient: creds.adminEmail,
        passConfigured: !!creds.pass,
        passLength: creds.pass ? creds.pass.length : 0
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
      stack: err.stack
    });
  }
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
