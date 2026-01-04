// backend/models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: Number,
  category: String,
  inStock: { type: Boolean, default: true },
  features: [String],
  createdAt: { type: Date, default: Date.now }
});

// Create text index for search
productSchema.index({ name: 'text', description: 'text', category: 'text' });

export const Product = mongoose.model("Product", productSchema);
