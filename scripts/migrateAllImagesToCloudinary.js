const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'ripzq8zx',
  api_key: process.env.CLOUDINARY_API_KEY || '134591968648872',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'mdcSuYowuCH1_TD4RF8OHu-MvZo'
});

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://globalabxtech_db_user:x7ugDrg3nbSl5vxs@cluster0.skszwlq.mongodb.net/jaipur_property_wala?retryWrites=true&w=majority&appName=Cluster0';

async function uploadUrlToCloudinary(url, folder) {
  if (!url || typeof url !== 'string') return url;
  if (url.includes('res.cloudinary.com')) {
    console.log(`  [Skip] Already on Cloudinary: ${url.substring(0, 60)}...`);
    return url;
  }
  try {
    console.log(`  [Uploading] to ${folder}: ${url.substring(0, 70)}...`);
    const res = await cloudinary.uploader.upload(url, {
      folder: folder,
      resource_type: 'auto'
    });
    console.log(`  [Success] -> ${res.secure_url}`);
    return res.secure_url;
  } catch (err) {
    console.error(`  [Failed] Could not upload ${url.substring(0, 50)}:`, err.message);
    return url; // Keep original if fails
  }
}

async function migrate() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected successfully.\n');

  const Property = require('../models/Property');
  const Gallery = require('../models/Gallery');
  const Settings = require('../models/Settings');
  const Blog = require('../models/Blog');

  // 1. Update Settings with Brand Logo
  console.log('--- 1. Migrating Settings & Brand Logo ---');
  let settings = await Settings.findOne();
  const brandLogoCloudinary = 'https://res.cloudinary.com/ripzq8zx/image/upload/v1790232795/jaipur_property_wala/brand/temp_logo_qhl20u.jpg';
  if (settings) {
    settings.logoUrl = brandLogoCloudinary;
    await settings.save();
    console.log(`Settings updated with logoUrl: ${brandLogoCloudinary}`);
  } else {
    settings = await Settings.create({
      logoUrl: brandLogoCloudinary
    });
    console.log(`Settings created with logoUrl: ${brandLogoCloudinary}`);
  }

  // 2. Properties
  console.log('\n--- 2. Migrating Property Images ---');
  const properties = await Property.find();
  console.log(`Found ${properties.length} properties.`);

  for (const prop of properties) {
    console.log(`\nProperty: "${prop.title}" (ID: ${prop._id})`);
    let modified = false;

    // Migrate images array
    if (Array.isArray(prop.images) && prop.images.length > 0) {
      const newImages = [];
      for (const imgUrl of prop.images) {
        const uploadedUrl = await uploadUrlToCloudinary(imgUrl, 'jaipur_property_wala/properties');
        newImages.push(uploadedUrl);
        if (uploadedUrl !== imgUrl) modified = true;
      }
      prop.images = newImages;
    }

    // Migrate imageHighlights
    if (Array.isArray(prop.imageHighlights) && prop.imageHighlights.length > 0) {
      for (const hl of prop.imageHighlights) {
        if (hl.url) {
          const uploadedUrl = await uploadUrlToCloudinary(hl.url, 'jaipur_property_wala/properties');
          if (uploadedUrl !== hl.url) {
            hl.url = uploadedUrl;
            modified = true;
          }
        }
      }
    }

    if (modified) {
      await prop.save();
      console.log(`  -> Property "${prop.title}" saved with Cloudinary URLs.`);
    } else {
      console.log(`  -> No changes needed for "${prop.title}".`);
    }
  }

  // 3. Galleries
  console.log('\n--- 3. Migrating Gallery Media ---');
  const galleries = await Gallery.find();
  console.log(`Found ${galleries.length} gallery items.`);

  for (const item of galleries) {
    console.log(`Gallery Item: "${item.title}"`);
    let modified = false;

    if (item.mediaUrl) {
      const uploaded = await uploadUrlToCloudinary(item.mediaUrl, 'jaipur_property_wala/gallery');
      if (uploaded !== item.mediaUrl) {
        item.mediaUrl = uploaded;
        modified = true;
      }
    }

    if (item.thumbnailUrl) {
      const uploadedThumb = await uploadUrlToCloudinary(item.thumbnailUrl, 'jaipur_property_wala/gallery');
      if (uploadedThumb !== item.thumbnailUrl) {
        item.thumbnailUrl = uploadedThumb;
        modified = true;
      }
    }

    if (modified) {
      await item.save();
      console.log(`  -> Gallery Item "${item.title}" saved with Cloudinary URL.`);
    }
  }

  // 4. Blogs
  console.log('\n--- 4. Migrating Blog Cover Images ---');
  const blogs = await Blog.find();
  console.log(`Found ${blogs.length} blogs.`);

  for (const blog of blogs) {
    if (blog.coverImage) {
      console.log(`Blog: "${blog.title}"`);
      const uploaded = await uploadUrlToCloudinary(blog.coverImage, 'jaipur_property_wala/blogs');
      if (uploaded !== blog.coverImage) {
        blog.coverImage = uploaded;
        await blog.save();
        console.log(`  -> Blog "${blog.title}" saved with Cloudinary URL.`);
      }
    }
  }

  console.log('\n==========================================');
  console.log('✅ COMPLETE CLOUDINARY MIGRATION FINISHED!');
  console.log('==========================================');

  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
