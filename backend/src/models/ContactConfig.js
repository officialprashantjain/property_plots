const mongoose = require('mongoose');

const contactConfigSchema = new mongoose.Schema({
  image: {
    type: String,
    default: ''
  },
  // We can add more config fields here later as needed
}, { 
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('ContactConfig', contactConfigSchema);
