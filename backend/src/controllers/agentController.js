const Agent = require("../models/Agent");
const env = require("../config/env");
const fs = require("fs");
const path = require("path");

const buildUrl = (filename) => `${env.baseUrl}/uploads/${filename}`;

const deleteFile = (url) => {
  if (!url) return;
  try {
    const filename = url.split("/uploads/")[1];
    if (filename) {
      const filePath = path.join(__dirname, "../../public/uploads", filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (err) {
    console.error(`Failed to delete file: ${url}`, err);
  }
};

const processAgentData = (req) => {
  if (req.body.socialLinks && typeof req.body.socialLinks === "string") {
    try {
      req.body.socialLinks = JSON.parse(req.body.socialLinks);
    } catch (e) {
      // Fallback
    }
  }

  if (req.file) {
    req.body.image = buildUrl(req.file.filename);
  }
};

// @desc    Get all active agents (Public)
// @route   GET /api/agents
exports.getAgents = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const filter = { isActive: true };
    const total = await Agent.countDocuments(filter);
    
    const agents = await Agent.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      agents
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get all agents (Admin)
// @route   GET /api/admin/agents
exports.getAdminAgents = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const total = await Agent.countDocuments();
    
    const agents = await Agent.find()
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      agents
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Create a new agent (Admin)
// @route   POST /api/admin/agents
exports.createAgent = async (req, res) => {
  try {
    processAgentData(req);
    const agent = await Agent.create(req.body);
    res.status(201).json(agent);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Update an agent (Admin)
// @route   PUT /api/admin/agents/:id
exports.updateAgent = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    const oldImage = agent.image;
    processAgentData(req);

    // If a new image is uploaded, delete the old one
    if (req.file && oldImage) {
      deleteFile(oldImage);
    }

    Object.assign(agent, req.body);
    const updated = await agent.save();
    res.status(200).json(updated);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid Agent ID format" });
    }
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Delete an agent (Admin)
// @route   DELETE /api/admin/agents/:id
exports.deleteAgent = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    if (agent.image) {
      deleteFile(agent.image);
    }

    await Agent.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Agent deleted successfully" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid Agent ID format" });
    }
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get agent by ID (Admin)
// @route   GET /api/admin/agents/:id
exports.getAgentById = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }
    res.status(200).json(agent);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid Agent ID format" });
    }
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
