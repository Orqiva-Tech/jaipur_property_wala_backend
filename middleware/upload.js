const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = [
  path.join(__dirname, '../uploads/properties'),
  path.join(__dirname, '../uploads/gallery'),
  path.join(__dirname, '../uploads/resumes')
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Property & Gallery Image Storage
const mediaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (req.baseUrl.includes('gallery')) {
      cb(null, path.join(__dirname, '../uploads/gallery'));
    } else {
      cb(null, path.join(__dirname, '../uploads/properties'));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Resume Storage (stored in protected folder, not directly served statically)
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/resumes'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'resume-' + uniqueSuffix + ext);
  }
});

const mediaFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp|svg|gif|avif|bmp|tiff|jfif|heic|mp4|webm|mkv|mov|avi|m4v/i;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const extValid = allowedExtensions.test(ext);
  const isMediaMime = file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/') || file.mimetype === 'application/octet-stream';

  if (extValid || isMediaMime) {
    cb(null, true);
  } else {
    // Lenient fallback to allow admin to upload any image or media
    cb(null, true);
  }
};

const resumeFilter = (req, file, cb) => {
  const allowedExtensions = /pdf|doc|docx/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const isAllowedExt = allowedExtensions.test(ext);

  if (isAllowedExt) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX formats are supported for resume uploads.'));
  }
};

const uploadMedia = multer({
  storage: mediaStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 100 // Unlimited / high batch upload
  },
  fileFilter: mediaFilter
});

const uploadResume = multer({
  storage: resumeStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: resumeFilter
});

module.exports = {
  uploadMedia,
  uploadResume
};
