const Contact = require("../models/Contact");
const ContactConfig = require("../models/ContactConfig");
const env = require("../config/env");

const buildUrl = (filename) => `${env.baseUrl}/uploads/${filename}`;

// --- Public Endpoints ---

// @desc    Submit a contact form (Public)
// @route   POST /api/contacts
exports.submitContact = async (req, res) => {
  try {
    const contact = await Contact.create(req.body);
    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get contact page configuration (Public)
// @route   GET /api/contacts/config
exports.getContactConfig = async (req, res) => {
  try {
    let config = await ContactConfig.findOne();
    if (!config) {
      // Create a default one if it doesn't exist
      config = await ContactConfig.create({ image: '' });
    }
    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// --- Admin Endpoints ---

// @desc    Get all contacts (Admin)
// @route   GET /api/admin/contacts
exports.getAdminContacts = async (req, res) => {
  try {
    const { page = 1, limit = 20, isRead, status, keyword } = req.query;
    const filter = {};
    if (isRead !== undefined) filter.isRead = isRead === 'true';
    if (status) filter.status = status;

    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
        { phone: { $regex: keyword, $options: "i" } },
        { inquiryType: { $regex: keyword, $options: "i" } },
        { message: { $regex: keyword, $options: "i" } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Contact.countDocuments(filter);

    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      contacts
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get single contact and mark as read (Admin)
// @route   GET /api/admin/contacts/:id
exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    // Mark as read when admin views it
    if (!contact.isRead) {
      contact.isRead = true;
      await contact.save();
    }

    res.status(200).json(contact);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid Contact ID format" });
    }
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Update contact status (Admin)
// @route   PUT /api/admin/contacts/:id/status
exports.updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.status(200).json(contact);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid Contact ID format" });
    }
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Delete a contact (Admin)
// @route   DELETE /api/admin/contacts/:id
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid Contact ID format" });
    }
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Update contact page configuration (Admin)
// @route   PUT /api/admin/contacts/config
exports.updateContactConfig = async (req, res) => {
  try {
    let config = await ContactConfig.findOne();
    if (!config) {
      config = new ContactConfig();
    }

    if (req.file) {
      config.image = buildUrl(req.file.filename);
    }

    // Handle other body fields if any
    Object.assign(config, req.body);
    
    await config.save();
    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get unread contact inquiries count (Admin)
// @route   GET /api/admin/contacts/unread-count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Contact.countDocuments({ isRead: false, status: 'active' });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Mark all contact inquiries as read (Admin)
// @route   PUT /api/admin/contacts/mark-all-read
exports.markAllAsRead = async (req, res) => {
  try {
    await Contact.updateMany({ isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: "All messages marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
