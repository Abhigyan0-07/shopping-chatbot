// backend/scripts/seedOrders.js
// Script to seed sample orders into the database
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Order } from "../models/Order.js";

dotenv.config();

const sampleOrders = [
  {
    orderId: "12345",
    customerName: "John Doe",
    customerEmail: "john.doe@example.com",
    items: [
      { productName: "Smartphone X200", quantity: 1, price: 14999 },
      { productName: "Wireless Headphones Pro", quantity: 1, price: 2999 }
    ],
    totalAmount: 17998,
    status: "Delivered",
    shippingAddress: {
      street: "123 Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400001"
    },
    paymentMethod: "Credit Card",
    paymentStatus: "paid",
    orderDate: new Date("2024-01-15"),
    estimatedDelivery: new Date("2024-01-20"),
    trackingNumber: "TRACK123456789"
  },
  {
    orderId: "12346",
    customerName: "Jane Smith",
    customerEmail: "jane.smith@example.com",
    items: [
      { productName: "Fitness Band 2", quantity: 2, price: 1299 }
    ],
    totalAmount: 2598,
    status: "Processing",
    shippingAddress: {
      street: "456 Park Avenue",
      city: "Delhi",
      state: "Delhi",
      zipCode: "110001"
    },
    paymentMethod: "UPI",
    paymentStatus: "paid",
    orderDate: new Date("2024-01-20"),
    estimatedDelivery: new Date("2024-01-25"),
    trackingNumber: "TRACK987654321"
  },
  {
    orderId: "12347",
    customerName: "Bob Johnson",
    customerEmail: "bob.johnson@example.com",
    items: [
      { productName: "Smartphone X200", quantity: 1, price: 14999 }
    ],
    totalAmount: 14999,
    status: "Processing",
    shippingAddress: {
      street: "789 Oak Road",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560001"
    },
    paymentMethod: "Debit Card",
    paymentStatus: "paid",
    orderDate: new Date("2024-01-22"),
    estimatedDelivery: new Date("2024-01-28"),
    trackingNumber: null
  },
  {
    orderId: "12348",
    customerName: "Alice Williams",
    customerEmail: "alice.williams@example.com",
    items: [
      { productName: "Wireless Headphones Pro", quantity: 1, price: 2999 }
    ],
    totalAmount: 2999,
    status: "Processing",
    shippingAddress: {
      street: "321 Elm Street",
      city: "Chennai",
      state: "Tamil Nadu",
      zipCode: "600001"
    },
    paymentMethod: "Net Banking",
    paymentStatus: "pending",
    orderDate: new Date("2024-01-23"),
    estimatedDelivery: new Date("2024-01-30"),
    trackingNumber: null
  },
  {
    orderId: "12349",
    customerName: "Charlie Brown",
    customerEmail: "charlie.brown@example.com",
    items: [
      { productName: "Smartphone X200", quantity: 1, price: 14999 },
      { productName: "Fitness Band 2", quantity: 1, price: 1299 }
    ],
    totalAmount: 16298,
    status: "Refund",
    shippingAddress: {
      street: "654 Pine Street",
      city: "Kolkata",
      state: "West Bengal",
      zipCode: "700001"
    },
    paymentMethod: "Credit Card",
    paymentStatus: "refunded",
    orderDate: new Date("2024-01-10"),
    estimatedDelivery: new Date("2024-01-15"),
    trackingNumber: null,
    refundId: "R1234567890",
    history: [{
      action: "refund_initiated",
      status: "Refund",
      note: "Refund initiated. Amount: ₹16298"
    }]
  },
  {
    orderId: "12350",
    customerName: "John Doe",
    customerEmail: "john.doe@example.com",
    items: [
      { productName: "Laptop Stand", quantity: 1, price: 1999 }
    ],
    totalAmount: 1999,
    status: "Return",
    shippingAddress: {
      street: "123 Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400001"
    },
    paymentMethod: "Credit Card",
    paymentStatus: "paid",
    orderDate: new Date("2024-01-18"),
    estimatedDelivery: new Date("2024-01-22"),
    trackingNumber: "TRACK555555555",
    returnId: "RET9876543210",
    history: [{
      action: "return_requested",
      status: "Return",
      note: "Return requested. Pickup scheduled."
    }]
  },
  {
    orderId: "12351",
    customerName: "Jane Smith",
    customerEmail: "jane.smith@example.com",
    items: [
      { productName: "Smartphone X200", quantity: 1, price: 14999 }
    ],
    totalAmount: 14999,
    status: "Exchange",
    shippingAddress: {
      street: "456 Park Avenue",
      city: "Delhi",
      state: "Delhi",
      zipCode: "110001"
    },
    paymentMethod: "UPI",
    paymentStatus: "paid",
    orderDate: new Date("2024-01-19"),
    estimatedDelivery: new Date("2024-01-24"),
    trackingNumber: "TRACK111111111",
    exchangeId: "EX5555555555",
    history: [{
      action: "exchange_requested",
      status: "Exchange",
      note: "Exchange requested for different color variant."
    }]
  },
  {
    orderId: "12352",
    customerName: "Abhigyan",
    customerEmail: "abhigyan@example.com",
    items: [
      { productName: "Gaming Mouse", quantity: 1, price: 1499 },
      { productName: "Laptop Stand", quantity: 1, price: 1999 }
    ],
    totalAmount: 3498,
    status: "shipped",
    shippingAddress: {
      street: "101 Tech Park",
      city: "Pune",
      state: "Maharashtra",
      zipCode: "411001"
    },
    paymentMethod: "UPI",
    paymentStatus: "paid",
    orderDate: new Date("2024-02-01"),
    estimatedDelivery: new Date("2024-02-05"),
    trackingNumber: "TRACK_GAME_123"
  },
  {
    orderId: "12353",
    customerName: "Abhigyan",
    customerEmail: "abhigyan@example.com",
    items: [
      { productName: "Smart Watch Ultra", quantity: 1, price: 24999 }
    ],
    totalAmount: 24999,
    status: "Processing",
    shippingAddress: {
      street: "101 Tech Park",
      city: "Pune",
      state: "Maharashtra",
      zipCode: "411001"
    },
    paymentMethod: "Credit Card",
    paymentStatus: "paid",
    orderDate: new Date("2024-02-03"),
    estimatedDelivery: new Date("2024-02-10"),
    trackingNumber: null
  },
  {
    orderId: "12354",
    customerName: "Abhigyan",
    customerEmail: "abhigyan@example.com",
    items: [
      { productName: "Wireless Headphones Pro", quantity: 2, price: 2999 }
    ],
    totalAmount: 5998,
    status: "Delivered",
    shippingAddress: {
      street: "101 Tech Park",
      city: "Pune",
      state: "Maharashtra",
      zipCode: "411001"
    },
    paymentMethod: "Net Banking",
    paymentStatus: "paid",
    orderDate: new Date("2024-01-25"),
    estimatedDelivery: new Date("2024-01-30"),
    trackingNumber: "TRACK_AUDIO_999"
  }
];

async function seedOrders() {
  try {
    const uri = process.env.MONGO_URI;
    
    if (!uri) {
      console.error("❌ MONGO_URI not found in .env file");
      console.log("Please create a .env file in the backend directory with:");
      console.log("MONGO_URI=mongodb://localhost:27017/chatbot");
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log("✓ Connected to MongoDB");

    // Clear existing orders (optional - comment out if you want to keep existing data)
    await Order.deleteMany({});
    console.log("✓ Cleared existing orders");

    // Insert sample orders
    const insertedOrders = await Order.insertMany(sampleOrders);
    console.log(`✓ Inserted ${insertedOrders.length} sample orders`);

    console.log("\n📦 Sample Orders Created:");
    insertedOrders.forEach(order => {
      console.log(`  - Order #${order.orderId} (${order.status}) - ₹${order.totalAmount}`);
    });

    console.log("\n✅ Database seeding completed!");
    console.log("\nYou can now test the chatbot with queries like:");
    console.log('  - "Where is my order #12345"');
    console.log('  - "Track order 12346"');
    console.log('  - "What is the status of order #12347"');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedOrders();

