import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.sendgrid.net",
  port: 587,
  auth: {
    user: "Vikalp.aidev@gmail.com",
    pass: "vnst ynhj bbfw dlbk",
  },
});

const sendEmail = async ({ from, to, message }) => {
  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: message.subject || "New Contact Form Submission",
      text: `
📩 Name: ${message.name || "N/A"}
📧 Email: ${message.email || "N/A"}
📱 Mobile: ${message.number || "N/A"}
📝 Message:
${message.text || "No content provided"}
      `,
    });

    console.log("Message sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export default sendEmail;
