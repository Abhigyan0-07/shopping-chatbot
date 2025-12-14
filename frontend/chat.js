// frontend/chat.js
// Chat API client with context management

const CHAT_ENDPOINT = "http://localhost:8000/api/chat";
const ORDERS_ENDPOINT = "http://localhost:8000/api/orders";

// Conversation context (stored in memory)
let conversationContext = {};

/**
 * Send message to chatbot with context
 */
export async function sendMessageToBot(message, context = null) {
  try {
    const response = await fetch(CHAT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        message,
        context: context || conversationContext
      }),
      credentials: 'include',
      mode: 'cors'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server returned status ${response.status}`);
    }

    const data = await response.json();
    
    // Update conversation context
    if (data.context) {
      conversationContext = data.context;
    }
    
    return data;
  } catch (err) {
    console.error("Chat error:", err);
    if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError") || err.name === "TypeError") {
      return {
        reply: "Unable to connect to the backend server. Please make sure:\n1. Backend server is running on http://localhost:8000\n2. Check browser console for CORS errors\n3. Try refreshing the page",
        context: conversationContext
      };
    }
    return {
      reply: `Error: ${err.message}. Please try again.`,
      context: conversationContext
    };
  }
}

/**
 * Fetch orders by email
 */
export async function fetchOrdersByEmail(email) {
  try {
    const response = await fetch(`${ORDERS_ENDPOINT}?email=${encodeURIComponent(email)}`, {
      method: "GET",
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch orders");
    }

    return await response.json();
  } catch (err) {
    console.error("Orders fetch error:", err);
    throw err;
  }
}

/**
 * Fetch order by ID
 */
export async function fetchOrderById(orderId) {
  try {
    const response = await fetch(`${ORDERS_ENDPOINT}/${orderId}`, {
      method: "GET",
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch order");
    }

    return await response.json();
  } catch (err) {
    console.error("Order fetch error:", err);
    throw err;
  }
}

/**
 * Perform order action (refund, return, exchange, track)
 */
export async function performOrderAction(orderId, action, data = {}) {
  try {
    let endpoint = `${ORDERS_ENDPOINT}/${orderId}`;
    
    if (action === "refund") {
      endpoint += "/refund";
    } else if (action === "return") {
      endpoint += "/return";
    } else if (action === "exchange") {
      endpoint += "/exchange";
    } else if (action === "track") {
      endpoint += "/track";
    } else {
      throw new Error("Invalid action");
    }

    const method = action === "track" ? "GET" : "POST";
    
    const response = await fetch(endpoint, {
      method: method,
      headers: {
        "Content-Type": "application/json"
      },
      body: method === "POST" ? JSON.stringify(data) : undefined,
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to perform action");
    }

    return await response.json();
  } catch (err) {
    console.error("Order action error:", err);
    throw err;
  }
}

/**
 * Get current conversation context
 */
export function getContext() {
  return conversationContext;
}

/**
 * Clear conversation context
 */
export function clearContext() {
  conversationContext = {};
}
