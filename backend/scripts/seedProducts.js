// backend/scripts/seedProducts.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Product } from "../models/Product.js";

dotenv.config();

const sampleProducts = [
  {
    name: "Smartphone X200",
    description: "Latest flagship smartphone with 120Hz display and 108MP camera.",
    price: 14999,
    category: "Electronics",
    features: ["5G Support", "12GB RAM", "256GB Storage", "5000mAh Battery"]
  },
  {
    name: "Wireless Headphones Pro",
    description: "Active Noise Cancelling headphones with 30-hour battery life.",
    price: 2999,
    category: "Electronics",
    features: ["ANC", "Bluetooth 5.3", "Fast Charging", "High-Res Audio"]
  },
  {
    name: "Fitness Band 2",
    description: "Water-resistant fitness tracker with heart rate and SpO2 monitoring.",
    price: 1299,
    category: "Wearables",
    features: ["IP68 Water Resistant", "14-Day Battery", "Sleep Tracking"]
  },
  {
    name: "Laptop Stand",
    description: "Ergonomic aluminum laptop stand with adjustable height.",
    price: 1999,
    category: "Accessories",
    features: ["Aluminum Body", "Adjustable Height", "Anti-slip Pads"]
  },
  {
    name: "Smart Watch Ultra",
    description: "Premium smartwatch with rugged design and diving support.",
    price: 24999,
    category: "Wearables",
    features: ["Titanium Case", "GPS", "ECG", "Cellular"]
  },
  {
    name: "Gaming Mouse",
    description: "RGB gaming mouse with 16000 DPI sensor.",
    price: 1499,
    category: "Electronics",
    features: ["RGB Lighting", "Programmable Buttons", "Lightweight"]
  }
];

async function seedProducts() {
  try {
    const uri = process.env.MONGO_URI;
    
    if (!uri) {
      console.error("❌ MONGO_URI not found in .env file");
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log("✓ Connected to MongoDB");

    // Clear existing products
    await Product.deleteMany({});
    console.log("✓ Cleared existing products");

    // Insert sample products
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`✓ Inserted ${insertedProducts.length} products`);

    console.log("\n📦 Sample Products:");
    insertedProducts.forEach(p => {
      console.log(`  - ${p.name} (₹${p.price})`);
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    process.exit(1);
  }
}

seedProducts();
