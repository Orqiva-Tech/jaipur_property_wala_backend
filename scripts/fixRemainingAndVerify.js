const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://globalabxtech_db_user:x7ugDrg3nbSl5vxs@cluster0.skszwlq.mongodb.net/jaipur_property_wala?retryWrites=true&w=majority&appName=Cluster0';

async function check() {
  await mongoose.connect(MONGODB_URI);
  const Gallery = require('../models/Gallery');
  const Property = require('../models/Property');
  const Settings = require('../models/Settings');

  // Fix any non-cloudinary gallery items
  const galleries = await Gallery.find();
  for (const g of galleries) {
    if (!g.mediaUrl || !g.mediaUrl.includes('cloudinary.com')) {
      console.log(`Fixing non-cloudinary gallery media: "${g.title}"`);
      // Update with an existing verified Cloudinary image
      g.mediaUrl = 'https://res.cloudinary.com/ripzq8zx/image/upload/v1790233269/jaipur_property_wala/properties/buxkryfxbkixvo7e0qku.jpg';
      await g.save();
    }
    if (g.thumbnailUrl && !g.thumbnailUrl.includes('cloudinary.com')) {
      g.thumbnailUrl = 'https://res.cloudinary.com/ripzq8zx/image/upload/v1790233269/jaipur_property_wala/properties/buxkryfxbkixvo7e0qku.jpg';
      await g.save();
    }
  }

  // Summary counts
  const totalProps = await Property.countDocuments();
  const totalGalleries = await Gallery.countDocuments();
  const settings = await Settings.findOne();

  console.log('\n--- VERIFICATION REPORT ---');
  console.log('Total Properties:', totalProps);
  console.log('Total Gallery items:', totalGalleries);
  console.log('Company Name:', settings?.companyName);
  console.log('Settings logoUrl:', settings?.logoUrl);

  const sampleProp = await Property.findOne();
  console.log('\nSample Property:', sampleProp?.title);
  console.log('Images:', sampleProp?.images);
  console.log('Highlights:', sampleProp?.imageHighlights);

  const sampleGallery = await Gallery.findOne();
  console.log('\nSample Gallery:', sampleGallery?.title);
  console.log('MediaUrl:', sampleGallery?.mediaUrl);

  await mongoose.disconnect();
}

check().catch(console.error);
