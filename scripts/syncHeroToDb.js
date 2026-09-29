const mongoose = require('mongoose');

const uri = 'mongodb+srv://globalabxtech_db_user:x7ugDrg3nbSl5vxs@cluster0.skszwlq.mongodb.net/jaipur_property_wala?retryWrites=true&w=majority&appName=Cluster0';

async function syncHero() {
  await mongoose.connect(uri);
  const collection = mongoose.connection.db.collection('settings');
  
  const heroData = {
    mediaType: 'video',
    videoUrl: 'https://res.cloudinary.com/ripzq8zx/video/upload/v1790697565/jaipur_property_wala/properties/qdyelhnra5xxhk1oetct.mp4',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=85',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=85'
    ],
    badge: '100% JDA & RERA Approved Residential & Commercial Plots',
    title: 'Discover Verified JDA Approved Plots in Jaipur',
    subtitle: 'Buy residential and commercial plots starting from ₹15 Lakhs with spot registry and 80% pre-approved bank loans. Prime schemes in Jagatpura, Mahindra SEZ, Tonk Road & Ajmer Expressway.'
  };

  const res = await collection.updateOne({}, {
    $set: {
      hero: heroData
    }
  });

  console.log('MongoDB update modifiedCount:', res.modifiedCount);

  // Now verify what https://api.jaipurpropertywala.in/api/settings returns
  const apiRes = await fetch('https://api.jaipurpropertywala.in/api/settings');
  const apiJson = await apiRes.json();
  console.log('API RETURNS HERO:', JSON.stringify(apiJson.data?.hero, null, 2));

  process.exit(0);
}

syncHero().catch(err => {
  console.error(err);
  process.exit(1);
});
