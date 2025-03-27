import express from "express";
import mongoose from "mongoose";
import Schema from "mongoose";

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    estimateprice: { type: String, required: true },
    offerAmount: { type: Number, required: false },
    onlinePrice:{ type: Number, required: false},
    sellPrice: { type: Number, required: false},
    startDate: { type: Date, default: Date.now, required: true },
    endDate: { type: Date, required:false , default:null},
    ReservePrice: { type: Number, required: false},
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: false,
    },
    image: [{ type: String, required: true }],
    skuNumber:{ type: String, required: false },
    lotNumber: { type: String, required: false },
    status: {
      type: String,
      enum: ['Sold', 'Not Sold'],
      default: 'Not Sold'
    },
    favorite: { type: Boolean, default: false },
    sortByPrice: {
      type: String,
      required: true,
      enum: ['High Price', 'Low Price']
    },
    details: [
      {
        key: { type: String, required: false },
        value: { type: String, required: false}
      }
    ],
    stock: { type: Number, default: 1 }, // Add stock field with default value of 1
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    type:{type:String , default: ""},
    count: { type: Number, default: 1 },
    auctionType:{type:String , default: ""},
  }, {
    timestamps: true
  });
  
  export default mongoose.model('AuctionProduct', productSchema);
