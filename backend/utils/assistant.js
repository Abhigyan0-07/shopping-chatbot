// backend/utils/assistant.js
/**
 * assistantReply(message)
 * E-commerce assistant with database integration:
 * - product search examples
 * - order status lookup from database
 * - returns/refunds/help
 * - payment/EMI info
 * - fallback prompts
 */

import { Order } from "../models/Order.js";
import mongoose from "mongoose";

const sampleProducts = [
  { id: "P1001", title: "Smartphone X200", price: 14999, rating: 4.3, available: true },
  { id: "P1002", title: "Wireless Headphones Pro", price: 2999, rating: 4.5, available: true },
  { id: "P1003", title: "Fitness Band 2", price: 1299, rating: 4.0, available: false }
];

export async function assistantReply(message) {
  const m = message.trim().toLowerCase();

  // Check if MongoDB is connected
  const isDbConnected = mongoose.connection.readyState === 1;

  // quick intent checks (rule-based)
  if (/(show|list|find).*(smartphone|phone|mobile)/.test(m) || /smartphones?/.test(m)) {
    const underMatch = m.match(/under\s*(₹?\s*\d+|\d+)/);
    let max = underMatch ? parseInt(underMatch[1].replace(/[₹\s]/g, "")) : Infinity;
    const results = sampleProducts.filter(p => p.title.toLowerCase().includes("smartphone") && p.price <= max);
    if (results.length === 0) return formatReply("I couldn't find smartphones within that price. Would you like alternatives under ₹20,000?");
    return formatSearch(results);
  }

  if (/(headphone|earbud|headset)/.test(m)) {
    const results = sampleProducts.filter(p => p.title.toLowerCase().includes("headphone"));
    return results.length ? formatSearch(results) : formatReply("I don't see headphones right now — want alternatives or a price range?");
  }

  // Order tracking with database lookup
  if (/where is my order|track order|order (status|#)?\s*#?\d+|order\s+#?\d+/.test(m)) {
    const idMatch = m.match(/#?(\d{5,})/);
    if (!idMatch) {
      return formatReply("I can help you track your order! Please provide your order ID (e.g., 'order #12345' or 'track order 12345').");
    }
    
    const orderId = idMatch[1];
    
    if (!isDbConnected) {
      return formatReply(`I found order ID ${orderId}, but I'm unable to access the database right now. Please make sure MongoDB is connected. For now, you can check your order status in the 'My Orders' section of your account.`);
    }

    try {
      const order = await Order.findOne({ orderId: orderId });
      
      if (!order) {
        return formatReply(`I couldn't find an order with ID ${orderId}. Please double-check your order number, or contact customer support if you believe this is an error.`);
      }

      // Format order details
      const itemsList = order.items.map(item => 
        `  • ${item.productName} (Qty: ${item.quantity}) - ₹${item.price}`
      ).join("\n");

      const statusEmoji = {
        "pending": "⏳",
        "confirmed": "✅",
        "processing": "🔄",
        "shipped": "🚚",
        "delivered": "📦",
        "cancelled": "❌",
        "returned": "↩️"
      };

      let orderInfo = `Here's the status of your order #${order.orderId}:\n\n`;
      orderInfo += `Status: ${statusEmoji[order.status] || "📋"} ${order.status.toUpperCase()}\n`;
      orderInfo += `Order Date: ${new Date(order.orderDate).toLocaleDateString()}\n`;
      orderInfo += `Total Amount: ₹${order.totalAmount}\n`;
      orderInfo += `Payment Status: ${order.paymentStatus}\n\n`;
      orderInfo += `Items:\n${itemsList}\n\n`;

      if (order.trackingNumber) {
        orderInfo += `Tracking Number: ${order.trackingNumber}\n`;
      }
      if (order.estimatedDelivery) {
        orderInfo += `Estimated Delivery: ${new Date(order.estimatedDelivery).toLocaleDateString()}\n`;
      }
      if (order.shippingAddress) {
        orderInfo += `\nShipping Address: ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`;
      }

      return formatReply(orderInfo);
    } catch (err) {
      console.error("Error fetching order:", err);
      return formatReply(`I encountered an error while looking up order ${orderId}. Please try again or contact customer support.`);
    }
  }

  // Returns and refunds with order lookup
  if (/(return|refund|replace|warranty|cancel).*order|order.*(return|refund|cancel)/.test(m)) {
    const idMatch = m.match(/#?(\d{5,})/);
    if (idMatch && isDbConnected) {
      const orderId = idMatch[1];
      try {
        const order = await Order.findOne({ orderId: orderId });
        if (order) {
          if (order.status === "delivered") {
            return formatReply(`For order #${orderId}, you can initiate a return within 7 days of delivery. Steps: 1) Go to 'My Orders' → 2) Select 'Return' → 3) Choose reason → 4) Schedule pickup. Refunds process within 3-7 business days after we receive the item.`);
          } else if (order.status === "shipped") {
            return formatReply(`Order #${orderId} is already shipped. You can request a return once it's delivered, or contact support to cancel if it hasn't been dispatched yet.`);
          } else if (order.status === "cancelled") {
            return formatReply(`Order #${orderId} has already been cancelled. If payment was made, refund should process within 3-5 business days.`);
          } else {
            return formatReply(`Order #${orderId} is currently ${order.status}. You can cancel it from 'My Orders' if it hasn't shipped yet.`);
          }
        }
      } catch (err) {
        console.error("Error fetching order for return:", err);
      }
    }
    return formatReply("For returns and refunds: check the returns policy on the product page, or ask me 'How to return order #<id>'. Typical steps: request a return in Orders → choose reason → schedule pickup. Refunds usually process within 3-7 business days after pickup.");
  }

  if (/(emi|emi option|pay in)/.test(m)) {
    return formatReply("EMI options depend on the seller and card. Usually you can select EMI at checkout and choose tenor (3/6/9/12 months). Would you like an EMI estimate on a specific product?");
  }

  if (/(payment failed|payment error)/.test(m)) {
    return formatReply("If payment failed: don't retry immediately. Check transaction status with your bank, or wait 10–15 minutes then check 'My Orders' — the payment may be pending. If money was deducted, open a dispute or contact support with the transaction reference.");
  }

  if (/(hello|hi|hey)/.test(m)) {
    return formatReply("Hi there! I'm your shopping assistant. Ask me to find products, check orders, or explain returns and payments. Example: 'Show me latest smartphones under 20000' or 'How do I return order #12345'?");
  }

  // fallback: small helpful reply + ask clarifying question
  return formatReply("I can help with product search, orders, payments, returns, and recommendations. What would you like help with? For example, try: 'Show me the latest smartphones under ₹20,000'.");
}

// helper formats
function formatSearch(items) {
  const lines = items.map(p => `• ${p.title} — ₹${p.price} — ⭐ ${p.rating} — ${p.available ? "In stock" : "Out of stock"}`);
  return `Here are some matches:\n${lines.join("\n")}\n\nWant details or similar alternatives?`;
}

function formatReply(text) {
  // Keep tone warm and helpful
  return `Sure — ${text}`;
}
