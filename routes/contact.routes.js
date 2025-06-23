import express from 'express';
import sendEmail from '../utils/mailer.utils.js';

const router = express.Router();
router.post('/contact', async (req, res) => {
 const { name, email, number, message } = req.body;

  try {
    await sendEmail({
      from: `"${name}" <${email}>`,
      to: 'theoptionhedge@gmail.com',
      message: {
        subject: "New Contact Form Message",
        text: message,
        name,
        email,
        number,
      }
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

router.post('/send-webinar-registration', async (req, res) => {
  try {
    const { from, to, message } = req.body;
    const result = await sendEmail({ from, to, message });
    res.status(200).json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error('Email sending failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;