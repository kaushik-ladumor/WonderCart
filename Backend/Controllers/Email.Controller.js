const {
    Verification_Email_Template,
    Welcome_Email_Template,
    resendCode_Email_Template,
    forgatPassword_Email_Template,
    contactSupport_Email_Template,
    orderConfirmation_Email_Template,
} = require("../Middlewares/EmailTemplate");

const generateEmailContent = async (req, res) => {
    const { type, data } = req.body;

    try {
        let html_content = "";
        let subject = "";

        switch (type) {
            case "verification":
                html_content = Verification_Email_Template.replace(
                    "{verificationCode}",
                    data.verificationCode
                );
                subject = "Verify your Email - WonderCart";
                break;

            case "welcome":
                html_content = Welcome_Email_Template.replace(
                    "{username}",
                    data.username
                );
                subject = "Welcome to WonderCart 🎉";
                break;

            case "resendCode":
                html_content = resendCode_Email_Template.replace(
                    "{verificationCode}",
                    data.verificationCode
                );
                subject = "Your New Verification Code - WonderCart";
                break;

            case "forgotPassword":
                html_content = forgatPassword_Email_Template.replace(
                    "{verificationCode}",
                    data.verificationCode
                );
                subject = "Reset Your Password - WonderCart";
                break;

            case "contactSupport":
                html_content = contactSupport_Email_Template
                    .replace("{name}", data.name)
                    .replace("{email}", data.email)
                    .replace("{subject}", data.subject)
                    .replace("{message}", data.message);
                subject = `New Contact Form Submission: ${data.subject}`;
                break;

            case "orderConfirmation":
                // data should contain { user, order }
                html_content = orderConfirmation_Email_Template(data.user, data.order);
                const shortOrderId = data.order._id.toString().slice(-8);
                subject = `Order Confirmed - #${shortOrderId}`;
                break;

            default:
                return res.status(400).json({ message: "Invalid email type" });
        }

        res.status(200).json({
            success: true,
            subject,
            html_content,
        });
    } catch (error) {
        console.error("Error generating email content:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = {
    generateEmailContent,
};
