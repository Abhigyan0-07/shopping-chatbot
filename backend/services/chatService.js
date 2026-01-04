// backend/services/chatService.js
// Chat service with conversation context handling
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { getFAQAnswer } from "./faqService.js";
import mongoose from "mongoose";

// In-memory conversation context (in production, use Redis or database)
const conversationContexts = new Map();

/**
 * Main chat handler with context management
 */
export async function handleChatMessage(message, context = {}) {
  const messageLower = message.trim().toLowerCase();
  const sessionId = context.sessionId || "default";
  
  // Get or create conversation context
  let convContext = conversationContexts.get(sessionId) || {
    expecting: null,
    lastOrderId: null,
    lastEmail: null,
    flow: null
  };

  // Handle "hey" greeting
  if (messageLower === "hey" || messageLower === "hi" || messageLower === "hello") {
    conversationContexts.set(sessionId, { expecting: "choice", flow: "main" });
    return {
      reply: "Hi — how can I help you today?",
      options: ["Order I placed", "General query"],
      context: { expecting: "choice", flow: "main" }
    };
  }

  // Handle option selection
  if (convContext.expecting === "choice") {
    if (messageLower.includes("order") || messageLower.includes("placed")) {
      conversationContexts.set(sessionId, { 
        expecting: "order_identifier", 
        flow: "order_lookup",
        lastOrderId: null,
        lastEmail: null
      });
      return {
        reply: "Please provide your order id or email used for order.",
        context: { expecting: "order_identifier", flow: "order_lookup" }
      };
    } else if (messageLower.includes("general") || messageLower.includes("query")) {
      conversationContexts.set(sessionId, { 
        expecting: "general_query", 
        flow: "general"
      });
      return {
        reply: "Sure! What would you like to know? I can help with shipping, returns, payments, and more.",
        context: { expecting: "general_query", flow: "general" }
      };
    }
  }

  // Handle order lookup
  if (convContext.expecting === "order_identifier" || convContext.flow === "order_lookup") {
    const isDbConnected = mongoose.connection.readyState === 1;
    
    if (!isDbConnected) {
      return {
        reply: "I'm unable to access the order database right now. Please try again later or contact support.",
        context: convContext
      };
    }

    // Try to extract email or order ID
    const emailMatch = message.match(/[\w\.-]+@[\w\.-]+\.\w+/);
    const orderIdMatch = message.match(/#?(\d{5,})/);

    if (emailMatch) {
      const email = emailMatch[0].toLowerCase();
      conversationContexts.set(sessionId, { ...convContext, lastEmail: email });
      
      try {
        const orders = await Order.find({ customerEmail: email })
          .sort({ orderDate: -1 })
          .limit(10);

        if (orders.length === 0) {
          return {
            reply: `No orders found for email: ${email}. Please check your email address or try with your order ID.`,
            context: { ...convContext, lastEmail: email }
          };
        }

        // Store orders in context for follow-up questions
        conversationContexts.set(sessionId, { 
          ...convContext, 
          lastEmail: email,
          lastOrders: orders.map(o => o.orderId)
        });

        return {
          reply: formatOrdersList(orders),
          orders: orders.map(formatOrderForResponse),
          context: { 
            expecting: "order_action", 
            flow: "order_lookup",
            lastEmail: email,
            lastOrders: orders.map(o => o.orderId)
          }
        };
      } catch (err) {
        console.error("Error fetching orders by email:", err);
        return {
          reply: "Sorry, I encountered an error while fetching your orders. Please try again.",
          context: convContext
        };
      }
    } else if (orderIdMatch) {
      const orderId = orderIdMatch[1];
      conversationContexts.set(sessionId, { ...convContext, lastOrderId: orderId });
      
      try {
        const order = await Order.findOne({ orderId: orderId });
        
        if (!order) {
          return {
            reply: `Order #${orderId} not found. Please check your order ID or try with your email address.`,
            context: { ...convContext, lastOrderId: orderId }
          };
        }

        conversationContexts.set(sessionId, { 
          ...convContext, 
          lastOrderId: orderId,
          lastEmail: order.customerEmail
        });

        return {
          reply: formatOrderDetails(order),
          order: formatOrderForResponse(order),
          context: { 
            expecting: "order_action", 
            flow: "order_lookup",
            lastOrderId: orderId,
            lastEmail: order.customerEmail
          }
        };
      } catch (err) {
        console.error("Error fetching order by ID:", err);
        return {
          reply: "Sorry, I encountered an error while fetching your order. Please try again.",
          context: convContext
        };
      }
    } else {
      return {
        reply: "I couldn't find an email address or order ID in your message. Please provide either:\n- Your email address (e.g., user@example.com)\n- Your order ID (e.g., #12345)",
        context: convContext
      };
    }
  }

  // Handle follow-up questions about orders (context-aware)
  if (convContext.flow === "order_lookup" && convContext.lastOrderId) {
    const orderId = convContext.lastOrderId;
    
    // Check for action requests
    if (messageLower.includes("refund") || messageLower.includes("get refund")) {
      return {
        reply: `I can help you with a refund for order #${orderId}. Would you like me to initiate the refund?`,
        action: "refund",
        orderId: orderId,
        context: { ...convContext, expecting: "action_confirmation" }
      };
    }
    
    if (messageLower.includes("return") || messageLower.includes("request return")) {
      return {
        reply: `I can help you request a return for order #${orderId}. Would you like me to proceed?`,
        action: "return",
        orderId: orderId,
        context: { ...convContext, expecting: "action_confirmation" }
      };
    }
    
    if (messageLower.includes("exchange") || messageLower.includes("request exchange")) {
      return {
        reply: `I can help you request an exchange for order #${orderId}. Would you like me to proceed?`,
        action: "exchange",
        orderId: orderId,
        context: { ...convContext, expecting: "action_confirmation" }
      };
    }
    
    if (messageLower.includes("track") || messageLower.includes("tracking") || messageLower.includes("when") || messageLower.includes("shipped")) {
      try {
        const order = await Order.findOne({ orderId: orderId });
        if (order) {
          return {
            reply: formatTrackingInfo(order),
            context: convContext
          };
        }
      } catch (err) {
        console.error("Error fetching order for tracking:", err);
      }
    }
  }

  // Handle general queries & Product Search
  if (convContext.flow === "general" || convContext.expecting === "general_query") {
    // 1. Try Product Search
    const productMatch = await searchProducts(message);
    if (productMatch) {
       return {
         reply: productMatch,
         context: { ...convContext, expecting: "general_query" }
       };
    }

    // 2. Try FAQ
    const faqAnswer = getFAQAnswer(message);
    if (faqAnswer) {
      return {
        reply: faqAnswer,
        context: { ...convContext, expecting: "general_query" }
      };
    } else {
      return {
        reply: "I don't have that info right now — would you like me to raise a support ticket?",
        options: ["Yes, raise a ticket", "No, thanks"],
        context: { ...convContext, expecting: "support_ticket_decision" }
      };
    }
  }

  // Default: reset to greeting if unclear
  if (!convContext.expecting && !convContext.flow) {
    conversationContexts.set(sessionId, { expecting: "choice", flow: "main" });
    return {
      reply: "Hi — how can I help you today?",
      options: ["Order I placed", "General query"],
      context: { expecting: "choice", flow: "main" }
    };
  }

  // Fallback
  return {
    reply: "I'm not sure how to help with that. Would you like to check your orders or ask a general question?",
    options: ["Order I placed", "General query"],
    context: { expecting: "choice", flow: "main" }
  };
}

/**
 * Format orders list for display
 */
function formatOrdersList(orders) {
  if (orders.length === 0) return "No orders found.";
  
  let message = `I found ${orders.length} order(s):\n\n`;
  
  orders.forEach((order, index) => {
    const statusColor = getStatusColor(order.status);
    const itemsSummary = order.items.map(i => `${i.productName} (x${i.quantity})`).join(", ");
    message += `${index + 1}. Order #${order.orderId}\n`;
    message += `   Items: ${itemsSummary}\n`;
    message += `   Amount: ₹${order.totalAmount}\n`;
    message += `   Status: ${order.status}\n`;
    message += `   Date: ${new Date(order.orderDate).toLocaleDateString()}\n\n`;
  });
  
  message += "You can ask about any order by mentioning its ID, or use the action buttons below.";
  
  return message;
}

/**
 * Format single order details
 */
function formatOrderDetails(order) {
  const itemsList = order.items.map(item => 
    `  • ${item.productName} (Qty: ${item.quantity}) - ₹${item.price}`
  ).join("\n");

  let message = `Order #${order.orderId} Details:\n\n`;
  message += `Status: ${order.status}\n`;
  message += `Order Date: ${new Date(order.orderDate).toLocaleDateString()}\n`;
  message += `Total Amount: ₹${order.totalAmount}\n`;
  message += `Payment Status: ${order.paymentStatus}\n\n`;
  message += `Items:\n${itemsList}\n\n`;
  
  if (order.trackingNumber) {
    message += `Tracking: ${order.trackingNumber}\n`;
  }
  if (order.estimatedDelivery) {
    message += `Estimated Delivery: ${new Date(order.estimatedDelivery).toLocaleDateString()}\n`;
  }
  
  return message;
}

/**
 * Format order for JSON response
 */
function formatOrderForResponse(order) {
  return {
    orderId: order.orderId,
    items: order.items,
    totalAmount: order.totalAmount,
    status: order.status,
    orderDate: order.orderDate,
    customerEmail: order.customerEmail,
    trackingNumber: order.trackingNumber,
    estimatedDelivery: order.estimatedDelivery,
    refundId: order.refundId,
    returnId: order.returnId,
    exchangeId: order.exchangeId
  };
}

/**
 * Format tracking information
 */
function formatTrackingInfo(order) {
  let message = `Tracking Information for Order #${order.orderId}:\n\n`;
  message += `Status: ${order.status}\n`;
  
  if (order.trackingNumber) {
    message += `Tracking Number: ${order.trackingNumber}\n`;
  } else {
    message += `Tracking Number: Not assigned yet\n`;
  }
  
  if (order.estimatedDelivery) {
    message += `Estimated Delivery: ${new Date(order.estimatedDelivery).toLocaleDateString()}\n`;
  }
  
  if (order.status === "shipped" || order.status === "Processing") {
    message += `Current Location: In transit\n`;
  } else if (order.status === "Delivered") {
    message += `Current Location: Delivered\n`;
  } else if (order.status === "processing") {
    message += `Current Location: Processing at warehouse\n`;
  } else {
    message += `Current Location: Pending\n`;
  }
  
  return message;
}

/**
 * Get status color indicator
 */
function getStatusColor(status) {
  const statusLower = status.toLowerCase();
  if (statusLower === "delivered") return "green";
  if (statusLower === "processing" || statusLower === "shipped") return "orange";
  if (statusLower === "refund" || statusLower === "return" || statusLower === "exchange") return "red";
  return "gray";
}

/**
 * Clear conversation context (for testing or session cleanup)
 */
export function clearContext(sessionId = "default") {
  conversationContexts.delete(sessionId);
}

/**
 * Search for products
 */
async function searchProducts(query) {
  const queryLower = query.toLowerCase();
  
  // Basic keyword extraction (very simple)
  // Check if query implies looking for a product
  const isProductQuery = queryLower.includes("price") || 
                         queryLower.includes("how much") || 
                         queryLower.includes("have") || 
                         queryLower.includes("buy") || 
                         queryLower.includes("cost") ||
                         queryLower.includes("show") ||
                         queryLower.includes("details");

  if (!isProductQuery && !queryLower.includes("smartphone") && !queryLower.includes("headphone") && !queryLower.includes("watch")) {
      return null;
  }

  // extract keywords to match against product names
  // In a real app, use MongoDB text search or Atlas Search
  const products = await Product.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { category: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } }
    ]
  }).limit(3);

  if (products.length > 0) {
    let reply = `I found ${products.length} product(s) matching your query:\n\n`;
    products.forEach(p => {
      reply += `📱 **${p.name}**\n`;
      reply += `   💰 Price: ₹${p.price}\n`;
      reply += `   📝 ${p.description}\n`;
      reply += `   ✅ In Stock: ${p.inStock ? 'Yes' : 'No'}\n\n`;
    });
    return reply;
  }
  
  return null;
}
