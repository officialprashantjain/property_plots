const express = require('express');
const { getAllOptions, createOption, updateOption, deleteOption } = require('../controllers/searchOptionController');
const { protect } = require('../middleware/auth');
const router = express.Router();

// GET is public (for the frontend search bar)
// POST is protected (only Admin)
router.route('/')
  .get(getAllOptions)
  .post(protect, createOption);

// PUT and DELETE are protected (only Admin)
router.route('/:id')
  .put(protect, updateOption)
  .delete(protect, deleteOption);

module.exports = router;
