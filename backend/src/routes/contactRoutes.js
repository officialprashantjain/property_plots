const express = require("express");
const {
  submitContact,
  getContactConfig,
  getAdminContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
  updateContactConfig,
  getUnreadCount,
  markAllAsRead
} = require("../controllers/contactController");
const { protect } = require("../middleware/auth");
const { uploadSingle, handleMulterError } = require("../middleware/upload");

const router = express.Router();

// Public routes
router.post("/", submitContact);
router.get("/config", getContactConfig);

// Admin protected routes
router.get("/admin/unread-count", protect, getUnreadCount);
router.put("/admin/mark-all-read", protect, markAllAsRead);
router.get("/admin/all", protect, getAdminContacts);
router.get("/admin/:id", protect, getContactById);
router.put("/admin/:id/status", protect, updateContactStatus);
router.delete("/admin/:id", protect, deleteContact);
router.put("/admin/config", protect, uploadSingle, handleMulterError, updateContactConfig);

module.exports = router;
