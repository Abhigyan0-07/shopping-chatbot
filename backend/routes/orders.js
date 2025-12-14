// backend/routes/orders.js
import express from "express";
import { Order } from "../models/Order.js";

const router = express.Router();

// GET /api/orders?email=<email> - Get orders by email
router.get("/", async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ 
        error: "Email parameter is required",
        message: "Please provide an email address to search for orders."
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: "Invalid email format",
        message: "Please provide a valid email address."
      });
    }

    const orders = await Order.find({ customerEmail: email.toLowerCase() })
      .sort({ orderDate: -1 })
      .select("orderId items totalAmount status orderDate");

    if (orders.length === 0) {
      return res.status(404).json({ 
        error: "No orders found",
        message: `No orders found for email: ${email}`,
        orders: []
      });
    }

    res.json({
      success: true,
      count: orders.length,
      orders: orders.map(order => ({
        orderId: order.orderId,
        items: order.items,
        totalAmount: order.totalAmount,
        status: order.status,
        orderDate: order.orderDate
      }))
    });
  } catch (err) {
    console.error("Error fetching orders by email:", err);
    res.status(500).json({ 
      error: "Server error",
      message: "Failed to fetch orders. Please try again later."
    });
  }
});

// GET /api/orders/:id - Get order by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findOne({ orderId: id });

    if (!order) {
      return res.status(404).json({ 
        error: "Order not found",
        message: `Order with ID ${id} not found.`
      });
    }

    res.json({
      success: true,
      order: {
        orderId: order.orderId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        items: order.items,
        totalAmount: order.totalAmount,
        status: order.status,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderDate: order.orderDate,
        estimatedDelivery: order.estimatedDelivery,
        trackingNumber: order.trackingNumber,
        history: order.history,
        refundId: order.refundId,
        returnId: order.returnId,
        exchangeId: order.exchangeId
      }
    });
  } catch (err) {
    console.error("Error fetching order by ID:", err);
    res.status(500).json({ 
      error: "Server error",
      message: "Failed to fetch order. Please try again later."
    });
  }
});

// POST /api/orders/:id/refund - Initiate refund
router.post("/:id/refund", async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findOne({ orderId: id });

    if (!order) {
      return res.status(404).json({ 
        error: "Order not found",
        message: `Order with ID ${id} not found.`
      });
    }

    if (order.status === "Refund" || order.paymentStatus === "refunded") {
      return res.json({
        success: true,
        message: `Refund already initiated for order ${id}. Refund ID: ${order.refundId || "Pending"}`,
        refundId: order.refundId
      });
    }

    const refundId = `R${Date.now()}`;
    order.status = "Refund";
    order.paymentStatus = "refunded";
    order.refundId = refundId;
    order.history.push({
      action: "refund_initiated",
      status: "Refund",
      note: `Refund initiated. Amount: ₹${order.totalAmount}`
    });
    order.updatedAt = new Date();
    
    await order.save();

    res.json({
      success: true,
      message: `Refund initiated successfully. Refund ID: ${refundId}. You will receive the amount in 5–7 business days.`,
      refundId: refundId,
      orderId: order.orderId,
      amount: order.totalAmount
    });
  } catch (err) {
    console.error("Error initiating refund:", err);
    res.status(500).json({ 
      error: "Server error",
      message: "Failed to initiate refund. Please try again later."
    });
  }
});

// POST /api/orders/:id/return - Request return
router.post("/:id/return", async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findOne({ orderId: id });

    if (!order) {
      return res.status(404).json({ 
        error: "Order not found",
        message: `Order with ID ${id} not found.`
      });
    }

    if (order.status === "Return") {
      return res.json({
        success: true,
        message: `Return already requested for order ${id}. Return ID: ${order.returnId || "Pending"}`,
        returnId: order.returnId
      });
    }

    const returnId = `RET${Date.now()}`;
    order.status = "Return";
    order.returnId = returnId;
    order.history.push({
      action: "return_requested",
      status: "Return",
      note: `Return requested. Pickup will be scheduled within 24 hours.`
    });
    order.updatedAt = new Date();
    
    await order.save();

    res.json({
      success: true,
      message: `Return request submitted. Return ID: ${returnId}. Our team will schedule a pickup within 24 hours.`,
      returnId: returnId,
      orderId: order.orderId
    });
  } catch (err) {
    console.error("Error requesting return:", err);
    res.status(500).json({ 
      error: "Server error",
      message: "Failed to request return. Please try again later."
    });
  }
});

// POST /api/orders/:id/exchange - Request exchange
router.post("/:id/exchange", async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, newItem } = req.body;
    
    const order = await Order.findOne({ orderId: id });

    if (!order) {
      return res.status(404).json({ 
        error: "Order not found",
        message: `Order with ID ${id} not found.`
      });
    }

    if (order.status === "Exchange") {
      return res.json({
        success: true,
        message: `Exchange already requested for order ${id}. Exchange ID: ${order.exchangeId || "Pending"}`,
        exchangeId: order.exchangeId
      });
    }

    const exchangeId = `EX${Date.now()}`;
    order.status = "Exchange";
    order.exchangeId = exchangeId;
    order.history.push({
      action: "exchange_requested",
      status: "Exchange",
      note: `Exchange requested. ${reason ? `Reason: ${reason}` : ""} ${newItem ? `New item: ${newItem}` : ""}`
    });
    order.updatedAt = new Date();
    
    await order.save();

    res.json({
      success: true,
      message: `Exchange request submitted. Exchange ID: ${exchangeId}. Our team will process your request and contact you within 24 hours.`,
      exchangeId: exchangeId,
      orderId: order.orderId
    });
  } catch (err) {
    console.error("Error requesting exchange:", err);
    res.status(500).json({ 
      error: "Server error",
      message: "Failed to request exchange. Please try again later."
    });
  }
});

// GET /api/orders/:id/track - Get tracking info
router.get("/:id/track", async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findOne({ orderId: id });

    if (!order) {
      return res.status(404).json({ 
        error: "Order not found",
        message: `Order with ID ${id} not found.`
      });
    }

    const trackingInfo = {
      orderId: order.orderId,
      status: order.status,
      trackingNumber: order.trackingNumber || "Not assigned yet",
      estimatedDelivery: order.estimatedDelivery || null,
      shippingAddress: order.shippingAddress,
      currentLocation: order.status === "shipped" ? "In transit" : 
                      order.status === "Delivered" ? "Delivered" :
                      order.status === "processing" ? "Processing at warehouse" : "Pending"
    };

    res.json({
      success: true,
      tracking: trackingInfo
    });
  } catch (err) {
    console.error("Error fetching tracking info:", err);
    res.status(500).json({ 
      error: "Server error",
      message: "Failed to fetch tracking information. Please try again later."
    });
  }
});

export default router;

