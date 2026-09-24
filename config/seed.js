const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: __dirname + '/../.env' });

const Admin = require('../models/Admin');
const Property = require('../models/Property');
const Career = require('../models/Career');
const Gallery = require('../models/Gallery');
const Blog = require('../models/Blog');
const Settings = require('../models/Settings');
const Enquiry = require('../models/Enquiry');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jaipur_property_wala');
    console.log('[Seed] Connected to MongoDB');

    // 1. Seed Admin
    await Admin.deleteMany({});
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@jaipurpropertywala.in';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@JaipurPropertyWala2026';

    await Admin.create({
      name: 'Jaipur Property Wala Management',
      email: adminEmail,
      password: adminPassword,
      role: 'superadmin'
    });
    console.log(`[Seed] Admin created: ${adminEmail}`);

    // 2. Seed Settings
    await Settings.deleteMany({});
    await Settings.create({
      companyName: 'JAIPUR PROPERTY WALA',
      tagline: 'Premier JDA & RERA Approved Residential & Commercial Plots across Jaipur, Ajmer, Kishangarh & Mumbai',
      phone: '9828226566',
      alternatePhone: '+91 98282 26566',
      whatsapp: '919828226566',
      email: 'info@jaipurpropertywala.in',
      address: 'Livasha Flat No.301, Mahal Yojna, Mahal Road Scheme, Jagatpura, Jaipur - 302017, Rajasthan',
      officeTimings: 'Monday - Sunday: 9:00 AM - 8:00 PM',
      stats: {
        yearsExperience: '20+',
        satisfiedClients: '4,500+',
        jdaPlotsSold: '3,200+',
        bankLoanApproval: '80% All Banks'
      },
      socialLinks: {
        facebook: 'https://facebook.com/jaipurpropertywala',
        instagram: 'https://instagram.com/jaipurpropertywala',
        youtube: 'https://youtube.com/@jaipurpropertywala',
        linkedin: 'https://linkedin.com/company/jaipurpropertywala'
      }
    });
    console.log('[Seed] Website settings seeded');

    // 3. Seed Properties Across Jaipur, Ajmer, Kishangarh & Mumbai
    await Property.deleteMany({});
    const propertiesData = [
      // JAIPUR 1
      {
        title: 'VRB World City — Premium Township Plots',
        slug: 'vrb-world-city-mahendra-sez-jaipur',
        tagline: 'Ultra-modern mega township adjoining Mahindra World City SEZ',
        description: 'VRB World City is a grand JDA and RERA approved plotted development situated directly near the flourishing Mahindra World City SEZ corridor in Jaipur. Offering meticulously planned residential and commercial plots equipped with modern underground utilities, lush landscaped theme parks, 40-60 ft bitumen roads, a dedicated meditation & wellness zone, and 24x7 gated security surveillance.',
        category: 'Residential',
        type: 'Plot',
        location: {
          area: 'Mahindra SEZ, Ajmer Road',
          city: 'Jaipur',
          address: 'Near Mahindra World City, Off Ajmer Road Expressway, Jaipur - 302037',
          landmark: 'Mahindra World City IT Hub'
        },
        price: 2450000,
        priceDisplay: '₹24.50 Lacs - ₹55 Lacs',
        pricePerSqYd: 22000,
        priceOnRequest: false,
        plotSizes: [111.11, 138.88, 152.77, 166.66, 200, 250],
        sizeUnit: 'Sq. Yards',
        status: 'Ongoing',
        jdaApproved: true,
        reraApproved: true,
        reraNumber: 'RAJ/P/2023/2458',
        bankLoanAvailable: true,
        bankLoanDetails: 'Up to 80% Loan from all Leading Banks (SBI, HDFC, ICICI, PNB)',
        amenities: [
          'Gated Colony with Grand Entrance',
          '24x7 Security CCTV Cameras',
          '40 & 60 Feet Wide Bitumen Roads',
          'Underground Water & Electricity Lines',
          'Lush Landscaped Theme Gardens',
          'Kids Play Area & Open Gym',
          'Community Center & Meditation Area'
        ],
        images: [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'
        ],
        featured: true,
        views: 342
      },
      // JAIPUR 2
      {
        title: 'Jaipur Bombay Hospital Scheme Residential Plots',
        slug: 'jaipur-bombay-hospital-plots-jagatpura',
        tagline: 'High-value residential plots in Jaipur’s most sought-after growth corridor',
        description: 'Strategically located in the high-density prime residential hub of Jagatpura, just minutes from the upcoming Bombay Hospital and Ring Road connecting junction. This premium JDA scheme offers ready-to-build plots with immediate registry and spot bank loan approvals.',
        category: 'Residential',
        type: 'Plot',
        location: {
          area: 'Jagatpura',
          city: 'Jaipur',
          address: 'Near Bombay Hospital Site & Mahal Road, Jagatpura, Jaipur - 302017',
          landmark: 'Near Bombay Hospital & Ring Road'
        },
        price: 3200000,
        priceDisplay: '₹32.00 Lacs - ₹75 Lacs',
        pricePerSqYd: 28800,
        priceOnRequest: false,
        plotSizes: [111.11, 138.88, 152.77, 166.66, 200, 300],
        sizeUnit: 'Sq. Yards',
        status: 'Ready to Move',
        jdaApproved: true,
        reraApproved: true,
        reraNumber: 'RAJ/P/2022/1982',
        bankLoanAvailable: true,
        bankLoanDetails: '80% Pre-approved bank loans with instant sanction',
        amenities: [
          'Immediate Registry & Possession',
          'Ready-to-Build Gated Community',
          'Footpaths & Plantation on Both Sides',
          'Modern LED Street Lights',
          'Overhead & Underground Water Reservoir'
        ],
        images: [
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80'
        ],
        featured: true,
        views: 489
      },
      // JAIPUR 3
      {
        title: 'Riyasat Eco Park Nature Plots',
        slug: 'riyasat-eco-park-tonk-road-vatika',
        tagline: 'Eco-conscious serene living with world-class wellness amenities',
        description: 'Riyasat Eco Park on Tonk Road, Vatika brings together nature-inspired township design with complete urban sophistication. Boasting sprawling green belts, dedicated yoga and herbal plantations, modern clubhouse provisions, and seamless connectivity to Tonk Road Highway.',
        category: 'Residential',
        type: 'Plot',
        location: {
          area: 'Tonk Road Vatika',
          city: 'Jaipur',
          address: 'Main Tonk Road Highway Corridor, Vatika, Jaipur - 303905',
          landmark: 'Near Vatika Mod & Ring Road interchange'
        },
        price: 1850000,
        priceDisplay: '₹18.50 Lacs - ₹42 Lacs',
        pricePerSqYd: 16500,
        priceOnRequest: false,
        plotSizes: [111.11, 138.88, 152.77, 200],
        sizeUnit: 'Sq. Yards',
        status: 'Ongoing',
        jdaApproved: true,
        reraApproved: true,
        reraNumber: 'RAJ/P/2023/3104',
        bankLoanAvailable: true,
        bankLoanDetails: '80% Loan from all nationalised banks with minimal documentation',
        amenities: [
          'Eco-friendly Herbal Garden & Gazebo',
          'Grand Royal Entrance Gate',
          'CCTV Cameras & 24/7 Security Guards',
          'Rainwater Harvesting System'
        ],
        images: [
          'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'
        ],
        featured: true,
        views: 298
      },
      // AJMER 1
      {
        title: 'Pushkar Royal Enclave — Gated Residential Plots',
        slug: 'pushkar-royal-enclave-ajmer',
        tagline: 'Picturesque Aravalli foothills living on Pushkar Bypass Road',
        description: 'Pushkar Royal Enclave is an ADA & RERA sanctioned plotted paradise set against the peaceful backdrop of the Aravalli hills on Pushkar Bypass, Ajmer. Featuring 40-ft wide roads, ornamental gate, sweet municipal water lines, and serene views. Ideal for spiritual retreat villas, second homes, and high-capital-gain plotting.',
        category: 'Residential',
        type: 'Plot',
        location: {
          area: 'Pushkar Bypass Road',
          city: 'Ajmer',
          address: 'Pushkar Bypass, Near Holy City Entrance, Ajmer - 305004',
          landmark: 'Pushkar Bypass Toll Circle'
        },
        price: 2150000,
        priceDisplay: '₹21.50 Lacs - ₹48 Lacs',
        pricePerSqYd: 18000,
        priceOnRequest: false,
        plotSizes: [111.11, 150, 200, 250],
        sizeUnit: 'Sq. Yards',
        status: 'Ongoing',
        jdaApproved: true,
        reraApproved: true,
        reraNumber: 'RAJ/P/2023/7812',
        bankLoanAvailable: true,
        bankLoanDetails: '80% Loan through SBI & HDFC Ajmer Main Branch',
        amenities: [
          'Aravalli Mountain View Plots',
          'Grand Fort-Theme Entrance Arch',
          '24x7 Security Surveillance',
          'Sweet Ground Water Pipeline',
          'Solar LED Streetlights'
        ],
        images: [
          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80'
        ],
        featured: true,
        views: 310
      },
      // AJMER 2
      {
        title: 'Panchsheel Elite Plotted Township',
        slug: 'panchsheel-elite-plots-ajmer',
        tagline: 'Posh urban residential enclave in Ajmer’s most prestigious sector',
        description: 'Panchsheel Elite offers prime ready-to-build residential plots in Ajmer’s most coveted VIP residential sector. Located minutes from top CBSE schools, shopping plazas, and multispeciality hospitals with ready possession, spot registry, and underground electrification.',
        category: 'Residential',
        type: 'Plot',
        location: {
          area: 'Panchsheel Nagar',
          city: 'Ajmer',
          address: 'Sector C, Panchsheel Nagar, Ajmer - 305001',
          landmark: 'Near Panchsheel Lake & Community Center'
        },
        price: 2800000,
        priceDisplay: '₹28.00 Lacs - ₹62 Lacs',
        pricePerSqYd: 23500,
        priceOnRequest: false,
        plotSizes: [120, 150, 180, 220],
        sizeUnit: 'Sq. Yards',
        status: 'Ready to Move',
        jdaApproved: true,
        reraApproved: true,
        reraNumber: 'RAJ/P/2023/5541',
        bankLoanAvailable: true,
        bankLoanDetails: '80% Loan approved with minimal paperwork',
        amenities: [
          'Immediate Patta Registry',
          'Posh Residential Neighborhood',
          'Wide Bitumen Carpet Roads',
          'Children Play Park & Walking Track'
        ],
        images: [
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=1200&q=80'
        ],
        featured: false,
        views: 275
      },
      // KISHANGARH 1
      {
        title: 'Marble City Mega Commercial & Industrial Plots',
        slug: 'marble-city-commercial-industrial-kishangarh',
        tagline: 'Asia’s largest marble trading corridor on NH-8 Expressway',
        description: 'Positioned right on National Highway 8, this flagship commercial and industrial plotted development is tailor-made for marble showrooms, transport logistics, warehousing, and corporate commercial complexes. Featuring heavy-vehicle 80-ft concrete access roads, 3-phase industrial power infrastructure, and undisputed land titles.',
        category: 'Commercial',
        type: 'Commercial Plot',
        location: {
          area: 'NH-8 Marble Hub',
          city: 'Kishangarh',
          address: 'Main NH-8 Expressway, Marble Industrial Area, Kishangarh - 305801',
          landmark: 'Opposite Marble Association Mandi'
        },
        price: 4500000,
        priceDisplay: '₹45.00 Lacs - ₹1.50 Cr',
        pricePerSqYd: 32000,
        priceOnRequest: false,
        plotSizes: [200, 300, 500, 1000],
        sizeUnit: 'Sq. Yards',
        status: 'Ready to Move',
        jdaApproved: true,
        reraApproved: true,
        reraNumber: 'RAJ/P/2023/9102',
        bankLoanAvailable: true,
        bankLoanDetails: 'Commercial financing available from SBI and ICICI',
        amenities: [
          'Direct NH-8 Highway Frontage',
          'Heavy Commercial Vehicle Access (80ft Road)',
          'High Tension Industrial Power Ready',
          'Dedicated Truck Parking Bay'
        ],
        images: [
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'
        ],
        featured: true,
        views: 430
      },
      // KISHANGARH 2
      {
        title: 'Silora Green Valley Township Plots',
        slug: 'silora-green-valley-kishangarh',
        tagline: 'Planned peaceful residential gated society near Kishangarh Airport',
        description: 'Silora Green Valley is a modern gated colony situated in close proximity to Kishangarh Airport and the Silora industrial corridor. Designed with modern families in mind, providing high-standard community living, parks, 24x7 security, and rapid access to both Jaipur and Ajmer via the express highway.',
        category: 'Residential',
        type: 'Plot',
        location: {
          area: 'Silora RIICO Zone',
          city: 'Kishangarh',
          address: 'Near Kishangarh Airport Road, Silora, Kishangarh - 305802',
          landmark: 'Near Kishangarh Airport'
        },
        price: 1550000,
        priceDisplay: '₹15.50 Lacs - ₹35 Lacs',
        pricePerSqYd: 14000,
        priceOnRequest: false,
        plotSizes: [100, 111.11, 138.88, 166.66],
        sizeUnit: 'Sq. Yards',
        status: 'Ongoing',
        jdaApproved: true,
        reraApproved: true,
        reraNumber: 'RAJ/P/2023/6410',
        bankLoanAvailable: true,
        bankLoanDetails: '80% Loan available from leading banks',
        amenities: [
          '10 mins to Kishangarh Airport',
          'Gated Colony with Guard Cabin',
          'Wide Bitumen Carpet Roads',
          'Landscaped Green Park'
        ],
        images: [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
        ],
        featured: false,
        views: 220
      },
      // MUMBAI 1
      {
        title: 'Sea Breeze Luxury Coastal Plots — Mumbai MMR',
        slug: 'sea-breeze-luxury-coastal-plots-mumbai',
        tagline: 'Private weekend villa plots along Mumbai’s scenic western coastal belt',
        description: 'Escape the hustle of Mumbai into your private sanctuary. Sea Breeze Coastal Plots offers clear-title, NA sanction villa plots along the Palghar-Boisar MMR coastal corridor, just 90 minutes from Borivali. Perfect for weekend luxury villas, organic orchards, and high-growth land banking with upcoming bullet train and coastal road connectivity.',
        category: 'Residential',
        type: 'Villa',
        location: {
          area: 'Palghar-Boisar Coastal Belt',
          city: 'Mumbai',
          address: 'Off Western Coastal Highway, Palghar, Mumbai MMR - 401501',
          landmark: 'Near Shirgaon Beach & Bullet Train Station'
        },
        price: 3500000,
        priceDisplay: '₹35.00 Lacs - ₹95 Lacs',
        pricePerSqYd: 15500,
        priceOnRequest: false,
        plotSizes: [150, 200, 300, 500],
        sizeUnit: 'Sq. Yards',
        status: 'Ongoing',
        jdaApproved: true,
        reraApproved: true,
        reraNumber: 'MAHARERA/P/2024/11029',
        bankLoanAvailable: true,
        bankLoanDetails: '75% - 80% Loan from HDFC, ICICI, and Axis Bank',
        amenities: [
          'Exclusive Coastal Villa Gated Enclave',
          'Clubhouse with Swimming Pool & Lawn',
          '24/7 Security & Managed Plantation Care',
          'Walking distance to Beach Access'
        ],
        images: [
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
        ],
        featured: true,
        views: 580
      },
      // MUMBAI 2
      {
        title: 'Navi Mumbai Golden Gateway Plots',
        slug: 'navi-mumbai-golden-gateway-plots',
        tagline: 'Strategic commercial & residential plots near Navi Mumbai International Airport',
        description: 'Located in the high-yield Panvel-JNPT expansion axis of Navi Mumbai, Golden Gateway Plots provides premium investment plots with clear NA titles and immediate highway connectivity. Situated 20 minutes from the new Navi Mumbai International Airport (NMIA) and Mumbai Trans Harbour Link (Atal Setu).',
        category: 'Commercial',
        type: 'Commercial Plot',
        location: {
          area: 'Panvel Growth Corridor',
          city: 'Mumbai',
          address: 'Old Mumbai-Pune Highway / Panvel Expressway Axis, Navi Mumbai - 410206',
          landmark: 'Near Navi Mumbai International Airport (NMIA)'
        },
        price: 5500000,
        priceDisplay: '₹55.00 Lacs - ₹1.75 Cr',
        pricePerSqYd: 38000,
        priceOnRequest: false,
        plotSizes: [150, 200, 300, 450],
        sizeUnit: 'Sq. Yards',
        status: 'Ready to Move',
        jdaApproved: true,
        reraApproved: true,
        reraNumber: 'MAHARERA/P/2023/8892',
        bankLoanAvailable: true,
        bankLoanDetails: 'Pre-approved loans through SBI and leading private banks',
        amenities: [
          'Direct Expressway & Atal Setu Access',
          '20 mins to Navi Mumbai Airport',
          'Concrete Roads with Stormwater Drainage',
          'High ROI Industrial & Commercial Potential'
        ],
        images: [
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80'
        ],
        featured: true,
        views: 640
      }
    ];

    await Property.insertMany(propertiesData);
    console.log(`[Seed] ${propertiesData.length} properties seeded across Jaipur, Ajmer, Kishangarh & Mumbai`);

    // 4. Seed Careers
    await Career.deleteMany({});
    const careersData = [
      {
        title: 'Senior Real Estate Sales Executive',
        slug: 'senior-real-estate-sales-executive',
        department: 'Sales & Business Development',
        employmentType: 'Full-Time',
        location: 'Jaipur & Ajmer Regional Desk',
        experience: '2 - 5 Years in Real Estate Sales',
        salaryRange: '₹30,000 - ₹60,000 / month + Attractive Commission',
        openings: 3,
        description: 'We are seeking a driven, client-oriented Senior Real Estate Sales Executive with a deep understanding of plotted markets across Jaipur, Ajmer, and Kishangarh. The ideal candidate will conduct property presentations, lead high-net-worth customer site visits, and close high-value deals with integrity.',
        responsibilities: [
          'Conduct comprehensive property presentations and on-site visits for verified buyer leads',
          'Advise clients on JDA & ADA title verification, registry procedures, and bank loan approvals',
          'Maintain robust relationships with prospective homebuyers, investors, and associates',
          'Achieve monthly and quarterly plot sales targets with high conversion rates'
        ],
        qualifications: [
          'Bachelor’s Degree in any discipline (BBA/MBA preferred)',
          'Minimum 2 years proven sales track record in plotted townships',
          'Strong command of Hindi and English communication skills',
          'Own conveyance for client site inspections'
        ],
        isActive: true
      },
      {
        title: 'Customer Relationship & Telecalling Executive',
        slug: 'customer-relationship-telecalling-executive',
        department: 'Customer Service & Pre-Sales',
        employmentType: 'Full-Time',
        location: 'Jagatpura, Jaipur',
        experience: '1 - 3 Years',
        salaryRange: '₹18,000 - ₹30,000 / month + Performance Incentives',
        openings: 4,
        description: 'Join our energetic pre-sales team to manage inbound enquiries for our Jaipur, Ajmer, Kishangarh, and Mumbai projects.',
        responsibilities: [
          'Handle incoming calls, WhatsApp enquiries, and web inquiries promptly',
          'Explain plot dimensions, pricing, and bank loan offers',
          'Coordinate site visits with field executives and follow up post-visit'
        ],
        qualifications: [
          'Graduate in any stream',
          'Excellent phone etiquette and persuasive communication skills',
          'Basic proficiency in computer and CRM tools'
        ],
        isActive: true
      }
    ];

    await Career.insertMany(careersData);
    console.log(`[Seed] ${careersData.length} careers seeded`);

    // 5. Seed Gallery Items Across Jaipur, Ajmer, Kishangarh & Mumbai
    await Gallery.deleteMany({});
    const galleryData = [
      {
        title: 'VRB World City Grand Entrance Archway',
        category: 'Project Photos',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        caption: 'Grand Entrance & 60-ft Bitumen Boulevard at VRB World City near Mahindra SEZ',
        location: 'Jaipur',
        projectName: 'VRB World City',
        isFeatured: true,
        displayOrder: 1
      },
      {
        title: 'Underground Electrification & Road Works — Jagatpura',
        category: 'Construction Progress',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=1200&q=80',
        caption: 'Heavy road paving and underground electrification progress in Jagatpura Project',
        location: 'Jaipur',
        projectName: 'Bombay Hospital Scheme',
        isFeatured: true,
        displayOrder: 2
      },
      {
        title: 'Pushkar Royal Enclave — Aravalli Hills Foothill Plots',
        category: 'Project Photos',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        caption: 'Picturesque mountain views and road boundary marking in Pushkar Bypass Ajmer',
        location: 'Ajmer',
        projectName: 'Pushkar Royal Enclave',
        isFeatured: true,
        displayOrder: 3
      },
      {
        title: 'Panchsheel Elite Lakeview Township Development',
        category: 'Completed Projects',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
        caption: 'Completed paved roads, designer LED lighting, and boundary compound in Ajmer',
        location: 'Ajmer',
        projectName: 'Panchsheel Elite',
        isFeatured: true,
        displayOrder: 4
      },
      {
        title: 'NH-8 Marble City Highway Commercial Hub',
        category: 'Completed Projects',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        caption: '80ft wide concrete road development with industrial electric connection in Kishangarh',
        location: 'Kishangarh',
        projectName: 'Marble City NH-8',
        isFeatured: true,
        displayOrder: 5
      },
      {
        title: 'Silora Green Valley Landscaping & Gate Installation',
        category: 'Construction Progress',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
        caption: 'On-site plantation, main security gate, and water tube-well boring in Kishangarh',
        location: 'Kishangarh',
        projectName: 'Silora Green Valley',
        isFeatured: true,
        displayOrder: 6
      },
      {
        title: 'Sea Breeze Coastal Villa Enclave — Mumbai MMR',
        category: 'Project Photos',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
        caption: 'Private weekend villa plots near Boisar Coastal Highway, Mumbai MMR',
        location: 'Mumbai',
        projectName: 'Sea Breeze Coastal Plots',
        isFeatured: true,
        displayOrder: 7
      },
      {
        title: 'Navi Mumbai Golden Gateway Strategic Industrial Park',
        category: 'Completed Projects',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
        caption: 'Commercial highway frontage plots near upcoming Navi Mumbai International Airport',
        location: 'Mumbai',
        projectName: 'Golden Gateway Navi Mumbai',
        isFeatured: true,
        displayOrder: 8
      },
      {
        title: 'Weekend Customer Site Visit Delegations',
        category: 'Property Site Visits',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
        caption: 'Homebuyers and investors inspecting ready plots with our senior consultants',
        location: 'Jaipur',
        projectName: 'Mahal Yojna',
        isFeatured: true,
        displayOrder: 9
      },
      {
        title: 'Aerial Drone Tour of Highway Plotted Township',
        category: 'Videos',
        mediaType: 'video',
        mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-residential-suburb-with-houses-and-gardens-41617-large.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
        caption: 'Complete aerial drone walkthrough showing road masterplan and green surroundings',
        location: 'Jaipur',
        projectName: 'Riyasat Eco Park',
        isFeatured: true,
        displayOrder: 10
      }
    ];

    await Gallery.insertMany(galleryData);
    console.log(`[Seed] ${galleryData.length} gallery items seeded across Jaipur, Ajmer, Kishangarh & Mumbai`);

    // 6. Seed Blogs
    await Blog.deleteMany({});
    const blogsData = [
      {
        title: 'Why Investing in Approved Plots in Jaipur, Ajmer & Mumbai MMR is the Safest Real Estate Move in 2026',
        slug: 'why-investing-in-approved-plots-jaipur-ajmer-mumbai-2026',
        excerpt: 'With the Delhi-Mumbai Industrial Corridor and Ring Road expansions, discover why sanctioned land guarantees 100% legal security and unmatched appreciation.',
        content: `
<h2>The Unrivalled Security of Sanctioned Plotted Land</h2>
<p>When purchasing real estate across Rajasthan (Jaipur, Ajmer, Kishangarh) and Mumbai MMR, the golden standard of safety and peace of mind is government authority sanction (JDA, ADA, MMRDA, RERA). Approved land provides unequivocal legal clarity, ensuring the plot is immune from future municipal encroachment, zone disputes, or agricultural title conflicts.</p>

<h3>Key Benefits of Choosing Verified Plots:</h3>
<ul>
  <li><strong>Clear Legal Title:</strong> Complete conversion with government patta and spot registry.</li>
  <li><strong>80% Bank Loan Availability:</strong> Nationalised institutions such as SBI, HDFC, ICICI, and PNB provide instant home loan sanctions up to 80% of the registry cost.</li>
  <li><strong>Structured Infrastructure:</strong> Masterplan norms mandate standard road widths (minimum 30 to 80 ft), demarcated parks, water harvesting, underground drainage, and electrification.</li>
</ul>
        `,
        coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        author: 'Jaipur Property Wala Editorial Board',
        category: 'JDA Plots & Investment Guide',
        tags: ['JDA Plots', 'Real Estate Investment', 'Jaipur Property', 'Ajmer Plots', 'Mumbai Land'],
        isPublished: true,
        readTime: '4 min read',
        seoTitle: 'Why Buy Approved Plots in Jaipur, Ajmer & Mumbai | 2026 Investment Guide',
        seoDescription: 'Discover why approved plots in Jaipur, Ajmer, and Mumbai MMR are the safest high-yield investment.'
      }
    ];

    await Blog.insertMany(blogsData);
    console.log(`[Seed] ${blogsData.length} blogs seeded`);

    // 7. Seed Initial Sample Enquiry
    await Enquiry.deleteMany({});
    await Enquiry.create({
      name: 'Dr. Ramesh Choudhary',
      phone: '9829012345',
      email: 'ramesh.choudhary@gmail.com',
      interestedProperty: 'VRB World City — Premium Township Plots',
      preferredLocation: 'Mahindra SEZ, Ajmer Road',
      budget: '₹25L - ₹40L',
      message: 'Looking for a 150 to 200 Sq. Yard JDA plot for villa construction. Please arrange a site visit this Sunday.',
      status: 'New',
      source: 'Website Hero Form'
    });
    console.log('[Seed] Sample enquiry seeded');

    console.log('[Seed Completed] Database successfully seeded with multi-city records!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
