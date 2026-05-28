const express = require("express");
const {
  getProperties,
  getPropertyById,
  createProperty,
  bulkUploadProperties,
  getAdminProperties,
  getAdminPropertyById,
  updateProperty,
  deleteProperty,
} = require("../controllers/propertyController");
const { protect } = require("../middleware/auth");
const {
  uploadPropertyImages,
  uploadExcel,
  handleMulterError,
} = require("../middleware/upload");

const router = express.Router();

// Public routes
router.get("/", getProperties);
router.get("/:id", getPropertyById);

// Admin protected routes
router.get("/admin/all", protect, getAdminProperties);
router.get("/admin/:id", protect, getAdminPropertyById);
router.post("/admin/bulk-upload", protect, uploadExcel, bulkUploadProperties);
router.post(
  "/admin",
  protect,
  uploadPropertyImages,
  handleMulterError,
  createProperty,
);
router.put(
  "/admin/:id",
  protect,
  uploadPropertyImages,
  handleMulterError,
  updateProperty,
);
router.delete("/admin/:id", protect, deleteProperty);

module.exports = router;
