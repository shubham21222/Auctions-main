import mongoose from 'mongoose';

const PastAuctionSchema = new mongoose.Schema({
  catalogName: { type: String, required: true },
  fileUrl: { type: String },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PastAuctionProduct' }],
  uploadedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const PastAuction = mongoose.model('PastAuction', PastAuctionSchema);
export default PastAuction; 