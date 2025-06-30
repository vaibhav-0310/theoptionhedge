import express from 'express';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import sendEmail from '../utils/mailer.utils.js';
dotenv.config();

const router = express.Router();
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized: Please log in' });
}

router.post("/create-order", async (req, res) => {
  try {
    const { amount, courseName } = req.body;
    
    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valid amount is required" });
    }

    const options = {
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: `receipt_order_${Math.random().toString(36).substring(7)}`,
      notes: {
        course_name: courseName || "Course Subscription"
      }
    };

    const order = await razorpay.orders.create(options);
    console.log("Order created:", order.id);
    res.json(order);

  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Option 1: If you want to require authentication
router.post("/payment-success", isLoggedIn, async (req, res) => {
  const { paymentId, orderId, signature, name = "TheOptionHedge" } = req.body;
  
  try {
    console.log("Payment success called with:", { paymentId, orderId, signature });
    
    // Get email from authenticated user
    const email = req.user.email;
    console.log("User email:", email);

    const message = {
      subject: "Payment Successful - Option Hedge Academy",
      text: `Hello ${name},\n\nThank you for your payment.\n\nPayment ID: ${paymentId}\nOrder ID: ${orderId}\n\nRegards,\nOption Hedge Academy`
    };

    await sendEmail({
      from: '"Option Hedge Academy" <Vikalp.aidev@gmail.com>',
      to: email,
      message,
    });
    
    console.log("Email sent successfully to:", email);
    res.status(200).json({ 
      message: "Payment processed and email sent successfully",
      paymentId: paymentId 
    });
    
  } catch (error) {
    console.error("Error in payment success:", error);
    res.status(500).json({ 
      error: "Payment received but failed to send email",
      details: error.message 
    });
  }
});

// Option 2: Alternative route without authentication (for testing)
router.post("/payment-success-guest", async (req, res) => {
  const { paymentId, orderId, signature, name = "TheOptionHedge", email = "theoptionhedge@gmail.com" } = req.body;
  
  try {
    console.log("Guest payment success called with:", { paymentId, orderId, signature });

    const message = {
      subject: "Payment Successful - Option Hedge Academy",
      text: `Hello ${name},\n\nThank you for your payment.\n\nPayment ID: ${paymentId}\nOrder ID: ${orderId}\n\nRegards,\nOption Hedge Academy`
    };

    await sendEmail({
      from: '"Option Hedge Academy" <Vikalp.aidev@gmail.com>',
      to: email,
      message,
    });
    
    console.log("Email sent successfully to:", email);
    res.status(200).json({ 
      message: "Payment processed and email sent successfully",
      paymentId: paymentId 
    });
    
  } catch (error) {
    console.error("Error in guest payment success:", error);
    res.status(500).json({ 
      error: "Payment received but failed to send email",
      details: error.message 
    });
  }
});

export default router;