const Agent = require("../models/Agent");
const { deleteFromS3 } = require("../middleware/upload");

const processAgentData = (req) => {
  if (req.body.socialLinks && typeof req.body.socialLinks === "string") {
    try {
      req.body.socialLinks = JSON.parse(req.body.socialLinks);
    } catch (e) {
    }
  }

  if (req.file) {
    req.body.image = req.file.location;
  }
};


exports.getAgents = async (req, res) => {
  try {
    const { page = 1, limit = 12, keyword } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const filter = { isActive: true };
    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { designation: { $regex: keyword, $options: "i" } },
        { phone: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
        { department: { $regex: keyword, $options: "i" } }
      ];
    }
    
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


exports.getAdminAgents = async (req, res) => {
  try {
    const { page = 1, limit = 20, keyword } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const filter = {};
    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { designation: { $regex: keyword, $options: "i" } },
        { phone: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
        { department: { $regex: keyword, $options: "i" } }
      ];
    }
    
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


exports.createAgent = async (req, res) => {
  try {
    processAgentData(req);
    const agent = await Agent.create(req.body);
    res.status(201).json(agent);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


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
      deleteFromS3(oldImage);
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


exports.deleteAgent = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    if (agent.image) {
      deleteFromS3(agent.image);
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
