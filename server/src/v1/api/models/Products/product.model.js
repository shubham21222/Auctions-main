import express from "express";
import mongoose from "mongoose";
import Schema from "mongoose";

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    estimateprice: { type: String, required: true },
    offerAmount: { type: Number, required: false },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    image: [{ type: String, required: true }],
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
        key: { type: String, required: true },
        value: { type: mongoose.Schema.Types.Mixed, required: true }
      }
    ],
    stock: { type: Number, default: 1 }, // Add stock field with default value of 1
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    type:{type:String , default: ""},
    link:{type:String , default:""},
  }, {
    timestamps: true
  });
  
  export default mongoose.model('Product', productSchema);
