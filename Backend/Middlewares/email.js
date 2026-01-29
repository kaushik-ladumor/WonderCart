const transporter = require("./EmailConfig");
const {
  Verification_Email_Template,
  Welcome_Email_Template,
  resendCode_Email_Template,
  forgatPassword_Email_Template,
  contactSupport_Email_Template,
  orderConfirmation_Email_Template,
} = require("./EmailTemplate");

const sendVerificationCode = async (email, verificationCode) => {
  try {
    const response = await transporter.sendMail({
      from: '"Team WonderCart🎋" <wondercarthelp@gmail.com>',
      to: email,
      subject: "Verify your Email - WonderCart",
      html: Verification_Email_Template.replace(
        "{verificationCode}",
        verificationCode
      ),
    });

    console.log("Verification email sent:", response.messageId);
  } catch (error) {
    console.error("Verification email error:", error);
  }
};

const sendWelcomeEmail = async (email, username) => {
  try {
    const response = await transporter.sendMail({
      from: '"Team WonderCart🎋" <wondercarthelp@gmail.com>',
      to: email,
      subject: "Welcome to WonderCart 🎉",
      html: Welcome_Email_Template.replace("{username}", username),
    });

    console.log("Welcome email sent:", response.messageId);
  } catch (error) {
    console.error("Welcome email error:", error);
  }
};

const sendResendCode = async (email, verificationCode) => {
  try {
    const response = await transporter.sendMail({
      from: '"Team WonderCart🎋" <wondercarthelp@gmail.com>',
      to: email,
      subject: "Your New Verification Code - WonderCart",
      html: resendCode_Email_Template.replace(
        "{verificationCode}",
        verificationCode
      ),
    });

    console.log("Resend code email sent:", response.messageId);
  } catch (error) {
    console.error("Resend code email error:", error);
  }
};

const sendForgatPasswordCode = async (email, verificationCode) => {
  try {
    const response = await transporter.sendMail({
      from: '"Team WonderCart🎋" <wondercarthelp@gmail.com>',
      to: email,
      subject: "Reset Your Password - WonderCart",
      html: forgatPassword_Email_Template.replace(
        "{verificationCode}",
        verificationCode
      ),
    });

    console.log("Reset password email sent:", response.messageId);
  } catch (error) {
    console.error("Reset password email error:", error);
  }
};

const contactSupport = async (name, email, subject, message) => {
  try {
    const response = await transporter.sendMail({
    from: '"WonderCart Contact Form" <wondercarthelp@gmail.com>',
    to: email,
    subject: `New Contact Form Submission: ${subject}`,
    html: contactSupport_Email_Template
      .replace("{name}", name)
      .replace("{email}", email)
      .replace("{subject}", subject)
      .replace("{message}", message),
    });
    console.log("Contact support email sent:", response.messageId);
  } catch (error) {
    console.error("Contact support email error:", error);
  }
};

const sendOrderConfirmation = async (userEmail, order) => {
  try {
    // Validate email
    if (!userEmail || typeof userEmail !== 'string' || !userEmail.includes('@')) {
      console.error("Invalid email address:", userEmail);
      return { success: false, error: "Invalid email address" };
    }

    // Validate order
    if (!order || !order._id) {
      console.error("Invalid order data");
      return { success: false, error: "Invalid order data" };
    }

    const emailContent = orderConfirmation_Email_Template(userEmail, order);
    const shortOrderId = order._id.toString().slice(-8);

    const mailOptions = {
      from: '"WONDERCART" <wondercarthelp@gmail.com>',
      to: userEmail,
      subject: `Order Confirmed - #${shortOrderId}`,
      html: emailContent,
    };

    console.log("Sending email with options:", {
      to: userEmail,
      subject: mailOptions.subject
    });

    const response = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", response.messageId);
    return { success: true, messageId: response.messageId };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationCode,
  sendWelcomeEmail,
  sendResendCode,
  sendForgatPasswordCode,
  contactSupport,
  sendOrderConfirmation,
};
