const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug:  { type: String },

  propertyType: { type: String, required: true },
  location:     { type: String, required: true },
  priceRange:   { type: String },
  plotSize:     { type: String },

  price: { type: Number, required: true },
  area:  { type: Number },

  descriptionHtml: { type: String },

  faqs: [{
    question: String,
    answer: String
  }],

  features: [String],

  media: {
    primaryImage: String,
    gallery:      [String],
    videoUrl:     String
  },

  status:   { type: String, enum: ['active', 'sold', 'draft'], default: 'draft' },
  isActive: { type: Boolean, default: true }
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

propertySchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Property', propertySchema);
