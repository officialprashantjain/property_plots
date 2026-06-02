const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  designation: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  department: {
    type: String,
    trim: true
  },
  experience: {
    type: String,
    trim: true
  },
  officeAddress: {
    type: String,
    trim: true
  },
  officeHours: {
    type: String,
    trim: true
  },
  aboutMe: {
    type: String,
    trim: true
  },
  socialLinks: {
    linkedin: { type: String, default: '' },
    facebook: { type: String, default: '' },
    twitter:  { type: String, default: '' },
    instagram: { type: String, default: '' }
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
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

module.exports = mongoose.model('Agent', agentSchema);
