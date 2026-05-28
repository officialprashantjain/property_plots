const mongoose = require('mongoose');

const searchOptionSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['propertyType', 'location', 'priceRange', 'plotSize'],
    required: true,
  },
  value: {
    type: String,
    required: true,
  }
}, { timestamps: true });

// Prevent duplicate entries for the exact same category and value
searchOptionSchema.index({ category: 1, value: 1 }, { unique: true });

module.exports = mongoose.model('SearchOption', searchOptionSchema);
