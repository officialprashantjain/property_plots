const Property = require("../models/Property");
const env = require("../config/env");
const fs = require("fs");
const path = require("path");

const buildUrl = (filename) => `${env.baseUrl}/uploads/${filename}`;

const processPropertyData = (req) => {
  // Parse JSON strings for complex fields if they arrive as strings (common in multipart)
  ["media", "faqs", "features"].forEach((field) => {
    if (req.body[field] && typeof req.body[field] === "string") {
      try {
        req.body[field] = JSON.parse(req.body[field]);
      } catch (e) {
        // Fallback to original if not valid JSON
      }
    }
  });

  if (req.files) {
    if (!req.body.media) req.body.media = {};

    if (req.files.primaryImage && req.files.primaryImage[0]) {
      req.body.media.primaryImage = buildUrl(
        req.files.primaryImage[0].filename,
      );
    }

    if (req.files.gallery && req.files.gallery.length > 0) {
      req.body.media.gallery = req.files.gallery.map((file) =>
        buildUrl(file.filename),
      );
    }
  }
};

const deleteFiles = (urls) => {
  if (!urls) return;
  const urlList = Array.isArray(urls) ? urls : [urls];

  urlList.forEach((url) => {
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
  });
};

// @desc    Get all properties with search & filter (Public)
// @route   GET /api/properties
exports.getProperties = async (req, res) => {
  try {
    const {
      keyword,
      propertyType,
      location,
      priceRange,
      plotSize,
      page = 1,
      limit = 9,
    } = req.query;

    const filter = { isActive: true, status: "active" };

    if (keyword) filter.title = { $regex: keyword, $options: "i" };
    if (propertyType) filter.propertyType = propertyType;
    if (location) filter.location = location;
    if (priceRange) filter.priceRange = priceRange;
    if (plotSize) filter.plotSize = plotSize;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Property.countDocuments(filter);

    const properties = await Property.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      properties,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get single property by ID (Public)
// @route   GET /api/properties/:id
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Create a new property (Admin)
// @route   POST /api/admin/properties
exports.createProperty = async (req, res) => {
  try {
    processPropertyData(req);
    const property = await Property.create(req.body);
    res.status(201).json(property);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "A property with this title already exists." });
    }
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get all properties including drafts (Admin)
// @route   GET /api/admin/properties
exports.getAdminProperties = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Property.countDocuments();

    const properties = await Property.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res
      .status(200)
      .json({
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        properties,
      });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Update a property (Admin)
// @route   PUT /api/admin/properties/:id
exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property || !property.isActive) {
      return res.status(404).json({ message: "Property not found" });
    }

    processPropertyData(req);
    Object.assign(property, req.body);
    const updated = await property.save();
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Soft delete a property (Admin)
// @route   DELETE /api/admin/properties/:id
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Capture image URLs before deleting record
    if (property.media) {
      if (property.media.primaryImage) deleteFiles(property.media.primaryImage);
      if (property.media.gallery && property.media.gallery.length > 0)
        deleteFiles(property.media.gallery);
    }

    await Property.findByIdAndDelete(req.params.id);

    res
      .status(200)
      .json({ message: "Property and associated images deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get single property by ID (Admin)
// @route   GET /api/properties/admin/:id
exports.getAdminPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Bulk upload properties from Excel
// @route   POST /api/properties/admin/bulk-upload
exports.bulkUploadProperties = async (req, res) => {
  try {
    let xlsx;
    try {
      // Require locally so the app won't crash if the package isn't installed yet
      xlsx = require('xlsx');
    } catch (err) {
      return res.status(500).json({ message: 'Package missing. Please run: npm install xlsx' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an Excel file' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (!data || data.length === 0) {
      return res.status(400).json({ message: 'Excel file is empty' });
    }

    const propertiesToInsert = data.map(row => {
      const media = {};
      if (row.primaryImage) media.primaryImage = row.primaryImage;
      if (row.gallery) {
        media.gallery = String(row.gallery).split(',').map(url => url.trim());
      }
      if (row.videoUrl) media.videoUrl = row.videoUrl;

      let features = [];
      let faqs = [];
      try { if (row.features) features = JSON.parse(row.features); } catch(e){}
      try { if (row.faqs) faqs = JSON.parse(row.faqs); } catch(e){}

      let slug = '';
      if (row.title) {
        slug = String(row.title)
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
      }

      return {
        title: row.title,
        slug: slug,
        propertyType: row.propertyType,
        location: row.location,
        price: Number(row.price),
        priceRange: row.priceRange,
        plotSize: row.plotSize,
        area: row.area ? Number(row.area) : 0,
        descriptionHtml: row.descriptionHtml || '',
        status: row.status || 'active',
        isActive: row.isActive !== undefined ? Boolean(row.isActive) : true,
        features,
        faqs,
        media
      };
    });

    const inserted = await Property.insertMany(propertiesToInsert);
    res.status(201).json({ 
      message: `Successfully uploaded ${inserted.length} properties!`,
      count: inserted.length 
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate property found check titles/slugs.', error: error.message });
    }
    res.status(500).json({ message: 'Server Error during bulk upload', error: error.message });
  }
};
