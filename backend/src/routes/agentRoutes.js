const express = require("express");
const {
  getAgents,
  getAdminAgents,
  createAgent,
  updateAgent,
  deleteAgent,
  getAgentById
} = require("../controllers/agentController");
const { protect } = require("../middleware/auth");
const { uploadSingle, handleMulterError } = require("../middleware/upload");

const router = express.Router();

// Public routes
router.get("/", getAgents);

// Admin protected routes
router.get("/admin/all", protect, getAdminAgents);
router.get("/admin/:id", protect, getAgentById);
router.post("/admin", protect, uploadSingle, handleMulterError, createAgent);
router.put("/admin/:id", protect, uploadSingle, handleMulterError, updateAgent);
router.delete("/admin/:id", protect, deleteAgent);

module.exports = router;
