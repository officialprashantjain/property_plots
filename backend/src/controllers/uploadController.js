const env = require('../config/env');

// @desc    Upload a single image
// @route   POST /api/uploads/single
// @access  Private/Admin
exports.uploadSingleImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const url = req.file.location;
  res.status(200).json({
    success: true,
    message: 'Image uploaded successfully',
    data: { url }
  });
};

// @desc    Upload multiple images
// @route   POST /api/uploads/multiple
// @access  Private/Admin
exports.uploadMultipleImages = (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded' });
  }

  const urls = req.files.map(file => file.location);
  res.status(200).json({
    success: true,
    message: 'Images uploaded successfully',
    data: { urls }
  });
};
