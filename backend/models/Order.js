// backend/models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  items: [{
    productName: String,
    quantity: Number,
    price: Number
  }],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ["pending", "confirmed", "Processing", "shipped", "Delivered", "Refund", "Return", "Exchange", "cancelled"],
    default: "pending"
  },
  history: [{
    action: String,
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }],
  refundId: String,
  returnId: String,
  exchangeId: String,
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  paymentMethod: String,
  paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
  orderDate: { type: Date, default: Date.now },
  estimatedDelivery: Date,
  trackingNumber: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Order = mongoose.model("Order", orderSchema);

