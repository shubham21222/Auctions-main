import mongoose from 'mongoose';

const pastAuctionProductSchema = new mongoose.Schema({
  lotNumber: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  condition: {
    type: String,
    trim: true
  },
  startPrice: {
    type: Number,
    required: true,
    min: 0
  },
  lowEstimate: {
    type: Number,
    min: 0
  },
  highEstimate: {
    type: Number,
    min: 0
  },
  reservePrice: {
    type: Number,
    min: 0
  },
  sku: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    trim: true
  },
  onlinePrice: {
    type: Number,
    min: 0
  },
  nyeDiscount30: {
    type: Number,
    min: 0,
    max: 100
  },
  nyeDiscount40: {
    type: Number,
    min: 0,
    max: 100
  },
  finalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  images: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

// Add index for faster queries
pastAuctionProductSchema.index({ lotNumber: 1 });
pastAuctionProductSchema.index({ sku: 1 });
pastAuctionProductSchema.index({ title: 1 });
pastAuctionProductSchema.index({ startPrice: 1 });
pastAuctionProductSchema.index({ finalPrice: 1 });
pastAuctionProductSchema.index({ createdAt: 1 });
pastAuctionProductSchema.index({ lotNumber: 1, title: 1 });
pastAuctionProductSchema.index({ startPrice: 1, finalPrice: 1 });

// Add compound index for catalog products query performance
pastAuctionProductSchema.index({ _id: 1, lotNumber: 1 });
pastAuctionProductSchema.index({ _id: 1, title: 1 });
pastAuctionProductSchema.index({ _id: 1, startPrice: 1 });

const PastAuctionProduct = mongoose.model('PastAuctionProduct', pastAuctionProductSchema);

export default PastAuctionProduct; 