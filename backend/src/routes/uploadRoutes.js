const express = require('express');
const { uploadSingle, uploadMultiple, handleMulterError } = require('../middleware/upload');
const { uploadSingleImage, uploadMultipleImages } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/single', protect, uploadSingle, handleMulterError, uploadSingleImage);
router.post('/multiple', protect, uploadMultiple, handleMulterError, uploadMultipleImages);

module.exports = router;
