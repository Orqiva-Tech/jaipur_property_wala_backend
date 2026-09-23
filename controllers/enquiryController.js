const Enquiry = require('../models/Enquiry');
const { sendAdminEnquiryNotification, sendCustomerEnquiryConfirmation } = require('../utils/emailService');

// @desc    Create new lead / enquiry
// @route   POST /api/enquiries
// @access  Public
const createEnquiry = async (req, res, next) => {
  try {
    const { name, phone, email, interestedProperty, preferredLocation, budget, message, source } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your name and phone number.'
      });
    }

    // Basic anti-spam: check if same phone submitted in last 2 minutes
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const existingRecent = await Enquiry.findOne({
      phone,
      createdAt: { $gte: twoMinutesAgo }
    });

    if (existingRecent) {
      return res.status(200).json({
        success: true,
        message: 'Thank you! We have already received your enquiry. Our Jaipur real estate advisor will call you shortly.'
      });
    }

    const enquiry = await Enquiry.create({
      name,
      phone,
      email: email || '',
      interestedProperty: interestedProperty || 'General Consultation',
      preferredLocation: preferredLocation || 'Jaipur',
      budget: budget || 'Any',
      message: message || '',
      source: source || 'Website',
      ipAddress: req.ip || req.headers['x-forwarded-for']
    });

    // Asynchronously dispatch emails without delaying response to client
    Promise.allSettled([
      sendAdminEnquiryNotification(enquiry),
      sendCustomerEnquiryConfirmation(enquiry)
    ]).then(results => {
      results.forEach((r, idx) => {
        if (r.status === 'rejected') {
          console.error(`[Email Error] Failed dispatching email ${idx === 0 ? 'Admin' : 'Customer'}:`, r.reason);
        }
      });
    }).catch(err => {
      console.error('[Email Error] Unexpected exception in email dispatch:', err);
    });

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

module.exports = {
  createEnquiry,
  getEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
  deleteEnquiryNote,
  exportEnquiriesCSV
};
