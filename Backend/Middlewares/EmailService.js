const brevo = require("./BrevoConfig");
const {
    Verification_Email_Template,
    Welcome_Email_Template,
    resendCode_Email_Template,
    forgatPassword_Email_Template,
    contactSupport_Email_Template,
    orderConfirmation_Email_Template,
} = require("./EmailTemplate");

const sender = {
    email: process.env.BREVO_SENDER_EMAIL,
    name: process.env.BREVO_SENDER_NAME,
};

// ✅ Send Verification Code
const sendVerificationCode = async (email, verificationCode) => {
    try {
        await brevo.sendTransacEmail({
            sender,
            to: [{ email }],
            subject: "Verify your Email - WonderCart",
            htmlContent: Verification_Email_Template.replace(
                "{verificationCode}",
                verificationCode
            ),
        });
        console.log("Verification email sent");
    } catch (error) {
        console.error("Verification email error:", error.response?.body || error);
    }
};

// ✅ Welcome Email
const sendWelcomeEmail = async (email, username) => {
    try {
        await brevo.sendTransacEmail({
            sender,
            to: [{ email }],
            subject: "Welcome to WonderCart 🎉",
            htmlContent: Welcome_Email_Template.replace("{username}", username),
        });
        console.log("Welcome email sent");
    } catch (error) {
        console.error("Welcome email error:", error.response?.body || error);
    }
};

// ✅ Resend Code
const sendResendCode = async (email, verificationCode) => {
    try {
        await brevo.sendTransacEmail({
            sender,
            to: [{ email }],
            subject: "Your New Verification Code - WonderCart",
            htmlContent: resendCode_Email_Template.replace(
                "{verificationCode}",
                verificationCode
            ),
        });
        console.log("Resend code email sent");
    } catch (error) {
        console.error("Resend code email error:", error.response?.body || error);
    }
};

// ✅ Forgot Password
const sendForgatPasswordCode = async (email, verificationCode) => {
    try {
        await brevo.sendTransacEmail({
            sender,
            to: [{ email }],
            subject: "Reset Your Password - WonderCart",
            htmlContent: forgatPassword_Email_Template.replace(
                "{verificationCode}",
                verificationCode
            ),
        });
        console.log("Reset password email sent");
    } catch (error) {
        console.error("Reset password email error:", error.response?.body || error);
    }
};

// ✅ Contact Support
const contactSupport = async (name, email, subject, message) => {
    try {
        await brevo.sendTransacEmail({
            sender,
            to: [{ email }],
            subject: `New Contact Form Submission: ${subject}`,
            htmlContent: contactSupport_Email_Template
                .replace("{name}", name)
                .replace("{email}", email)
                .replace("{subject}", subject)
                .replace("{message}", message),
        });
        console.log("Contact support email sent");
    } catch (error) {
        console.error("Contact support email error:", error.response?.body || error);
    }
};

// ✅ Order Confirmation
const sendOrderConfirmation = async (userEmail, order) => {
    try {
        if (!userEmail || !userEmail.includes("@")) {
            return { success: false, error: "Invalid email" };
        }
        if (!order || !order._id) {
            return { success: false, error: "Invalid order" };
        }

        const shortOrderId = order._id.toString().slice(-8);
        const emailContent = orderConfirmation_Email_Template(userEmail, order);

        await brevo.sendTransacEmail({
            sender,
            to: [{ email: userEmail }],
            subject: `Order Confirmed - #${shortOrderId}`,
            htmlContent: emailContent,
        });

        console.log("Order confirmation email sent");
        return { success: true };
    } catch (error) {
        console.error("Order email error:", error.response?.body || error);
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
