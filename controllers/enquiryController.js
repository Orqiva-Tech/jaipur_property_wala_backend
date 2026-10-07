const Enquiry = require('../models/Enquiry');
const { sendAdminEnquiryNotification, sendCustomerEnquiryConfirmation } = require('../utils/emailService');

// @desc    Create new lead / enquiry
// @route   POST /api/enquiries
// @access  Public
const createEnquiry = async (req, res, next) => {
  try {
    const { name, phone, email, interestedProperty, propertyId, preferredLocation, budget, message, source } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your name and phone number.'
      });
    }

    // Anti-double-click guard: only block duplicate clicks on identical phone & property within 5 seconds
    const fiveSecondsAgo = new Date(Date.now() - 5 * 1000);
    const existingDuplicate = await Enquiry.findOne({
      phone,
      interestedProperty: interestedProperty || 'General Consultation',
      createdAt: { $gte: fiveSecondsAgo }
    });

    if (existingDuplicate) {
      return res.status(200).json({
        success: true,
        message: 'Thank you! We have already received your enquiry. Our Jaipur real estate advisor will call you shortly.',
        data: {
          id: existingDuplicate._id,
          _id: existingDuplicate._id,
          name: existingDuplicate.name
        }
      });
    }

    const enquiry = await Enquiry.create({
      name,
      phone,
      email: email || '',
      interestedProperty: interestedProperty || 'General Consultation',
      propertyId: propertyId || undefined,
      preferredLocation: preferredLocation || 'Jaipur',
      budget: budget || 'Any',
      message: message || '',
      source: source || 'Website',
      status: req.body.status || 'New',
      ipAddress: req.ip || req.headers['x-forwarded-for']
    });

    // Dispatch admin notification directly and await transmission to ensure delivery on cloud containers
    try {
      const emailRes = await sendAdminEnquiryNotification(enquiry);
      if (!emailRes.success) {
        console.warn('[Email Warning] Admin notification could not be delivered:', emailRes.error);
      }
    } catch (emailErr) {
      console.warn('[Email Warning] Exception while sending admin enquiry email:', emailErr.message);
    }

    // Customer confirmation can be sent in background
    if (enquiry.email) {
      sendCustomerEnquiryConfirmation(enquiry).catch(err => {
        console.warn('[Email Warning] Customer confirmation email failed:', err.message);
      });
    }

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully! Our expert advisor will contact you within 15 minutes.',
      data: {
        id: enquiry._id,
        _id: enquiry._id,
        name: enquiry.name
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all enquiries with filters & search
// @route   GET /api/admin/enquiries
// @access  Protected (Admin)
const getEnquiries = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { interestedProperty: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Enquiry.countDocuments(query);
    const enquiries = await Enquiry.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: enquiries.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: enquiries
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single enquiry by ID
// @route   GET /api/admin/enquiries/:id
// @access  Protected (Admin)
const getEnquiryById = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id).populate('propertyId');
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: enquiry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update enquiry status & add internal notes
// @route   PUT /api/admin/enquiries/:id
// @access  Protected (Admin)
const updateEnquiryStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry record not found'
      });
    }

    if (status) {
      enquiry.status = status;
    }

    if (note) {
      enquiry.internalNotes.push({
        note,
        author: req.admin ? req.admin.name : 'Admin',
        date: new Date()
      });
    }

    await enquiry.save();

    res.status(200).json({
      success: true,
      message: 'Enquiry updated successfully',
      data: enquiry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete enquiry
// @route   DELETE /api/admin/enquiries/:id
// @access  Protected (Admin)
const deleteEnquiry = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry record not found'
      });
    }

    await enquiry.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Enquiry deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export enquiries as CSV
// @route   GET /api/admin/enquiries/export
// @access  Protected (Admin)
const exportEnquiriesCSV = async (req, res, next) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });

    let csv = 'Name,Phone,Email,Property,Status,Preferred Location,Budget,Message,Date\n';
    enquiries.forEach(e => {
      const cleanMsg = (e.message || '').replace(/"/g, '""').replace(/\n/g, ' ');
      csv += `"${e.name}","${e.phone}","${e.email}","${e.interestedProperty}","${e.status}","${e.preferredLocation}","${e.budget}","${cleanMsg}","${e.createdAt.toISOString()}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="jaipur-property-wala-leads.csv"');
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a note from an enquiry
// @route   DELETE /api/enquiries/:id/notes/:noteId
// @access  Protected (Admin)
const deleteEnquiryNote = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry record not found'
      });
    }

    const noteId = req.params.noteId;
    enquiry.internalNotes = enquiry.internalNotes.filter(
      (n, idx) => String(n._id) !== String(noteId) && String(idx) !== String(noteId)
    );

    await enquiry.save();

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
      data: enquiry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin manually create single lead / enquiry
// @route   POST /api/admin/enquiries/admin or POST /api/enquiries/admin
// @access  Protected (Admin)
const createAdminEnquiry = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      email,
      interestedProperty,
      propertyId,
      preferredLocation,
      budget,
      message,
      source,
      status,
      initialNote
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone number are required.'
      });
    }

    const internalNotes = [];
    if (initialNote && String(initialNote).trim()) {
      internalNotes.push({
        note: String(initialNote).trim(),
        author: req.admin?.name || 'Admin',
        date: new Date()
      });
    }

    const enquiry = await Enquiry.create({
      name: String(name).trim(),
      phone: String(phone).trim(),
      email: email ? String(email).trim().toLowerCase() : '',
      interestedProperty: interestedProperty ? String(interestedProperty).trim() : 'General Consultation',
      propertyId: propertyId || undefined,
      preferredLocation: preferredLocation ? String(preferredLocation).trim() : 'Jaipur',
      budget: budget ? String(budget).trim() : 'Any',
      message: message ? String(message).trim() : '',
      source: source ? String(source).trim() : 'Admin Entry',
      status: status || 'New',
      internalNotes,
      ipAddress: req.ip || req.headers['x-forwarded-for']
    });

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: enquiry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk import leads / enquiries from CSV / JSON
// @route   POST /api/admin/enquiries/import or POST /api/enquiries/import
// @access  Protected (Admin)
const importEnquiries = async (req, res, next) => {
  try {
    const { leads } = req.body;

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No lead records provided for import.'
      });
    }

    const validLeads = [];
    const skipped = [];
    const allowedStatuses = ['New', 'Contacted', 'Site Visit Scheduled', 'Negotiation', 'Closed', 'Archived'];

    for (let i = 0; i < leads.length; i++) {
      const item = leads[i];
      const name = item.name || item.Name || item['Customer Name'] || item['Full Name'];
      const phone = item.phone || item.Phone || item['Phone Number'] || item['Mobile'] || item['WhatsApp'];

      if (!name || !phone || !String(name).trim() || !String(phone).trim()) {
        skipped.push({ row: i + 1, reason: 'Missing name or phone number', data: item });
        continue;
      }

      const email = item.email || item.Email || '';
      const interestedProperty = item.interestedProperty || item.Property || item['Interested Scheme'] || item['Interested Property'] || 'General Consultation';
      const preferredLocation = item.preferredLocation || item.Location || item['Preferred Location'] || item.Locality || 'Jaipur';
      const budget = item.budget || item.Budget || 'Any';
      const message = item.message || item.Message || item.Requirements || item.Notes || '';
      const source = item.source || item.Source || 'CSV Import';
      let rawStatus = item.status || item.Status || 'New';
      if (!allowedStatuses.includes(rawStatus)) {
        rawStatus = 'New';
      }

      const internalNotes = [];
      const noteText = item.note || item.Note || item['Internal Note'];
      if (noteText && String(noteText).trim()) {
        internalNotes.push({
          note: String(noteText).trim(),
          author: req.admin?.name || 'Admin (Import)',
          date: new Date()
        });
      }

      validLeads.push({
        name: String(name).trim(),
        phone: String(phone).trim(),
        email: email ? String(email).trim().toLowerCase() : '',
        interestedProperty: String(interestedProperty).trim(),
        preferredLocation: String(preferredLocation).trim(),
        budget: String(budget).trim(),
        message: String(message).trim(),
        source: String(source).trim(),
        status: rawStatus,
        internalNotes,
        ipAddress: req.ip || req.headers['x-forwarded-for']
      });
    }

    if (validLeads.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid lead records found in the import payload. Each lead must contain at least Name and Phone.',
        skippedCount: skipped.length,
        skipped
      });
    }

    const inserted = await Enquiry.insertMany(validLeads);

    res.status(201).json({
      success: true,
      message: `Successfully imported ${inserted.length} lead${inserted.length === 1 ? '' : 's'}.`,
      count: inserted.length,
      skippedCount: skipped.length,
      skipped
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEnquiry,
  createAdminEnquiry,
  importEnquiries,
  getEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
  deleteEnquiry,
  deleteEnquiryNote,
  exportEnquiriesCSV
};
