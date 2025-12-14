// backend/services/faqService.js
// FAQ knowledge base for general queries

const faqDatabase = [
  {
    keywords: ["shipping", "delivery", "how long", "when will", "ship", "deliver"],
    answer: "Standard shipping takes 3-5 business days. Express shipping (1-2 days) is available at checkout. Orders are processed within 24 hours of payment confirmation."
  },
  {
    keywords: ["return", "returns", "return policy", "can i return"],
    answer: "You can return items within 7 days of delivery. Items must be unused and in original packaging. To initiate a return, go to 'My Orders' and select 'Return' for the item."
  },
  {
    keywords: ["refund", "refunds", "refund policy", "money back"],
    answer: "Refunds are processed within 5-7 business days after we receive the returned item. The amount will be credited to your original payment method."
  },
  {
    keywords: ["payment", "pay", "payment method", "how to pay", "payment options"],
    answer: "We accept Credit/Debit cards, UPI, Net Banking, and Cash on Delivery (COD). You can select your preferred payment method at checkout."
  },
  {
    keywords: ["emi", "installment", "pay in installments"],
    answer: "EMI options are available for orders above ₹5,000. You can choose 3, 6, 9, or 12-month tenures. EMI is available for credit cards from major banks."
  },
  {
    keywords: ["cancel", "cancel order", "cancel my order"],
    answer: "You can cancel your order within 24 hours of placing it if it hasn't been shipped. Go to 'My Orders' and click 'Cancel Order'. Refunds for cancelled orders are processed within 3-5 business days."
  },
  {
    keywords: ["warranty", "guarantee", "warranty period"],
    answer: "All products come with manufacturer warranty. Warranty periods vary by product (typically 6-12 months). Check the product page for specific warranty details."
  },
  {
    keywords: ["track", "tracking", "where is my package"],
    answer: "Once your order is shipped, you'll receive a tracking number via email and SMS. You can track your order in 'My Orders' section or use the tracking number on our website."
  },
  {
    keywords: ["exchange", "replace", "wrong item"],
    answer: "You can request an exchange within 7 days of delivery if you received a wrong or defective item. Go to 'My Orders', select the order, and click 'Request Exchange'."
  },
  {
    keywords: ["contact", "support", "help", "customer service"],
    answer: "You can reach our customer support at support@example.com or call 1800-XXX-XXXX (9 AM - 9 PM, Monday to Saturday). You can also chat with us here for immediate assistance."
  }
];

/**
 * Get FAQ answer based on user query
 */
export function getFAQAnswer(message) {
  const messageLower = message.toLowerCase();
  
  for (const faq of faqDatabase) {
    const matchCount = faq.keywords.filter(keyword => 
      messageLower.includes(keyword)
    ).length;
    
    if (matchCount > 0) {
      return faq.answer;
    }
  }
  
  return null;
}

/**
 * Get all FAQ topics (for help menu)
 */
export function getAllFAQs() {
  return faqDatabase.map(faq => ({
    topic: faq.keywords[0],
    answer: faq.answer
  }));
}

