const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  companyName: {
    type: String,
    default: 'JAIPUR PROPERTY WALA'
  },
  logoUrl: {
    type: String,
    default: 'https://res.cloudinary.com/ripzq8zx/image/upload/v1790232795/jaipur_property_wala/brand/temp_logo_qhl20u.jpg'
  },
  tagline: {
    type: String,
    default: 'Premier JDA Approved Residential & Commercial Plots in Jaipur'
  },
  phone: {
    type: String,
    default: ''
  },
  alternatePhone: {
    type: String,
    default: ''
  },
  whatsapp: {
    type: String,
    default: ''
  },
  hero: {
    mediaType: {
      type: String,
      enum: ['images', 'video'],
      default: 'images'
    },
    images: {
      type: [String],
      default: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=85',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=85'
      ]
    },
    videoUrl: {
      type: String,
      default: ''
    },
    badge: {
      type: String,
      default: '100% JDA & RERA Approved Residential & Commercial Plots'
    },
    title: {
      type: String,
      default: 'Discover Verified JDA Approved Plots in Jaipur'
    },
    subtitle: {
      type: String,
      default: 'Buy residential and commercial plots starting from ₹15 Lakhs with spot registry and 80% pre-approved bank loans. Prime schemes in Jagatpura, Mahindra SEZ, Tonk Road & Ajmer Expressway.'
    }
  },
  aboutSection: {
    badge: {
      type: String,
      default: 'About Our Company'
    },
    title: {
      type: String,
      default: 'Why Choose Jaipur Property Wala?'
    },
    description: {
      type: String,
      default: 'Jaipur Property Wala (Jaipur JDA Plots Colonizers & Developers) has established an unmatched benchmark of credibility across Rajasthan. We protect your hard-earned investment by offering only clear-title, JDA-approved schemes with direct spot registry and zero hidden charges.'
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80'
    },
    imageTag: {
      type: String,
      default: 'Authentic Jaipur Roots'
    },
    imageQuote: {
      type: String,
      default: '“Estate brings together all the essentials of modern living with features that ensure comfort, safety, and lasting value.”'
    },
    experienceYears: {
      type: String,
      default: '20+ Years'
    },
    experienceText: {
      type: String,
      default: 'Pioneering Safe JDA Land Ownership in Jaipur'
    },
    points: {
      type: [{
        title: { type: String, default: '' },
        description: { type: String, default: '' }
      }],
      default: [
        {
          title: 'Guaranteed Capital Appreciation:',
          description: 'Planned JDA sectors in Jagatpura, SEZ, and Tonk Road have consistently generated high capital gains.'
        },
        {
          title: 'Total Construction Flexibility:',
          description: 'Construct your custom dream villa immediately, lease commercial spaces, or hold the clear-title plot for your family.'
        },
        {
          title: '100% Security & 80% Bank Loan:',
          description: 'All properties feature complete 90-A revenue conversion with instant loans supported by SBI, HDFC, and ICICI.'
        }
      ]
    }
  },
  email: {
    type: String,
    default: 'info@jaipurpropertywala.in'
  },
  address: {
    type: String,
    default: 'Livasha Flat No.301, Mahal Yojna, Mahal Road Scheme, Jagatpura, Jaipur - 302017, Rajasthan'
  },
  mapEmbedUrl: {
    type: String,
    default: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d113941.51733246473!2d75.76839352932943!3d26.818814524458826!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396dc9e208b0beab%3A0xe542fe882433e387!2sJagatpura%2C%20Jaipur%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin'
  },
  officeTimings: {
    type: String,
    default: 'Monday - Sunday: 9:00 AM - 8:00 PM'
  },
  stats: {
    yearsExperience: { type: String, default: '20+' },
    satisfiedClients: { type: String, default: '4,500+' },
    jdaPlotsSold: { type: String, default: '3,200+' },
    bankLoanApproval: { type: String, default: '80% All Banks' }
  },
  socialLinks: {
    facebook: { type: String, default: 'https://facebook.com/' },
    instagram: { type: String, default: 'https://instagram.com/' },
    youtube: { type: String, default: 'https://youtube.com/' },
    linkedin: { type: String, default: 'https://linkedin.com/' }
  },
  townshipShowcase: {
    mode: {
      type: String,
      enum: ['recent', 'custom'],
      default: 'recent'
    },
    selectedProperties: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property'
    }],
    badge: {
      type: String,
      default: 'Signature Plotted Developments'
    },
    title: {
      type: String,
      default: 'Ongoing & Ready-to-Build Townships'
    },
    subtitle: {
      type: String,
      default: 'Explore prime projects with ready possession, underground utilities, and direct highway connectivity.'
    }
  }
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Settings', SettingsSchema);
