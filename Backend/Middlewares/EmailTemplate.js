// Verification Email Template
const Verification_Email_Template = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
        .header { background: #000; padding: 20px; text-align: center; }
        .logo { color: white; font-size: 20px; font-weight: bold; }
        .content { padding: 30px; }
        .title { color: #000; font-size: 18px; margin-bottom: 15px; }
        .text { color: #666; margin-bottom: 20px; line-height: 1.5; }
        .code-box { background: #f8f8f8; border: 2px dashed #000; border-radius: 8px; padding: 25px; text-align: center; margin: 25px 0; }
        .code { font-size: 28px; font-weight: bold; letter-spacing: 8px; font-family: monospace; }
        .info { background: #f8f8f8; padding: 15px; border-radius: 6px; font-size: 12px; color: #666; }
        .footer { background: #000; padding: 20px; text-align: center; color: white; font-size: 12px; }
        @media (max-width: 600px) {
            body { padding: 10px; }
            .content { padding: 20px; }
            .code { font-size: 24px; letter-spacing: 6px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">WONDERCART</div>
        </div>
        <div class="content">
            <h2 class="title">Verify Your Email</h2>
            <p class="text">Enter this code to verify your account:</p>
            <div class="code-box">
                <div class="code">{verificationCode}</div>
            </div>
            <div class="info">⏱️ Expires in 10 minutes</div>
        </div>
        <div class="footer">
            © 2025 WonderCart • All rights reserved
        </div>
    </div>
</body>
</html>
`;

// Welcome Email Template
const Welcome_Email_Template = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
        .header { background: #000; padding: 20px; text-align: center; }
        .logo { color: white; font-size: 20px; font-weight: bold; }
        .content { padding: 30px; }
        .title { color: #000; font-size: 18px; margin-bottom: 15px; }
        .text { color: #666; margin-bottom: 20px; line-height: 1.5; }
        .welcome-box { background: #000; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .btn { display: inline-block; background: #000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 15px; font-weight: bold; }
        .footer { background: #000; padding: 20px; text-align: center; color: white; font-size: 12px; }
        @media (max-width: 600px) {
            body { padding: 10px; }
            .content { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">WONDERCART</div>
        </div>
        <div class="content">
            <h2 class="title">Welcome, {username}!</h2>
            <div class="welcome-box">
                <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">Your Account is Active</div>
                <div style="font-size: 14px; opacity: 0.9;">Start exploring amazing deals</div>
            </div>
            <p class="text">We're excited to have you! Shop thousands of quality products with fast delivery.</p>
            <center><a href="#" class="btn">Start Shopping</a></center>
        </div>
        <div class="footer">
            © 2025 WonderCart • support@wondercart.com
        </div>
    </div>
</body>
</html>
`;

// Resend Code Email Template
const resendCode_Email_Template = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
        .header { background: #000; padding: 20px; text-align: center; }
        .logo { color: white; font-size: 20px; font-weight: bold; }
        .content { padding: 30px; }
        .title { color: #000; font-size: 18px; margin-bottom: 15px; }
        .text { color: #666; margin-bottom: 20px; line-height: 1.5; }
        .code-box { background: #f8f8f8; border: 2px dashed #000; border-radius: 8px; padding: 25px; text-align: center; margin: 25px 0; }
        .code { font-size: 28px; font-weight: bold; letter-spacing: 8px; font-family: monospace; }
        .alert { background: #fff8e6; border: 1px solid #000; padding: 15px; border-radius: 6px; font-size: 12px; margin: 15px 0; }
        .footer { background: #000; padding: 20px; text-align: center; color: white; font-size: 12px; }
        @media (max-width: 600px) {
            body { padding: 10px; }
            .content { padding: 20px; }
            .code { font-size: 24px; letter-spacing: 6px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">WONDERCART</div>
        </div>
        <div class="content">
            <h2 class="title">New Verification Code</h2>
            <p class="text">You requested a new code:</p>
            <div class="code-box">
                <div class="code">{verificationCode}</div>
            </div>
            <div class="alert">⚠️ Expires in 10 minutes. Previous code is now inactive.</div>
        </div>
        <div class="footer">
            © 2025 WonderCart • All rights reserved
        </div>
    </div>
</body>
</html>
`;

// Reset Password Email Template
const forgatPassword_Email_Template = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
        .header { background: #000; padding: 20px; text-align: center; }
        .logo { color: white; font-size: 20px; font-weight: bold; }
        .content { padding: 30px; }
        .title { color: #000; font-size: 18px; margin-bottom: 15px; }
        .text { color: #666; margin-bottom: 20px; line-height: 1.5; }
        .code-box { background: #f8f8f8; border: 2px dashed #000; border-radius: 8px; padding: 25px; text-align: center; margin: 25px 0; }
        .code { font-size: 28px; font-weight: bold; letter-spacing: 8px; font-family: monospace; }
        .tips { background: #000; color: white; padding: 15px; border-radius: 6px; font-size: 12px; }
        .footer { background: #000; padding: 20px; text-align: center; color: white; font-size: 12px; }
        @media (max-width: 600px) {
            body { padding: 10px; }
            .content { padding: 20px; }
            .code { font-size: 24px; letter-spacing: 6px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">WONDERCART</div>
        </div>
        <div class="content">
            <h2 class="title">Reset Your Password</h2>
            <p class="text">Use this code to reset your password:</p>
            <div class="code-box">
                <div class="code">{verificationCode}</div>
            </div>
            <div class="tips">
                🔒 Security Tips:<br>
                • Never share this code<br>
                • Choose a strong password<br>
                • Code expires in 10 minutes
            </div>
        </div>
        <div class="footer">
            © 2025 WonderCart • support@wondercart.com
        </div>
    </div>
</body>
</html>
`;

// Contact Support Email Template
const contactSupport_Email_Template = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
        .header { background: #000; padding: 20px; text-align: center; }
        .logo { color: white; font-size: 20px; font-weight: bold; }
        .content { padding: 30px; }
        .title { color: #000; font-size: 18px; margin-bottom: 15px; }
        .text { color: #666; margin-bottom: 20px; line-height: 1.5; }
        .ref-box { background: #f8f8f8; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0; }
        .ref { font-size: 18px; font-weight: bold; }
        .info { margin: 15px 0; padding: 15px; background: #f8f8f8; border-radius: 6px; }
        .label { color: #999; font-size: 12px; }
        .value { font-weight: bold; margin-bottom: 10px; }
        .footer { background: #000; padding: 20px; text-align: center; color: white; font-size: 12px; }
        @media (max-width: 600px) {
            body { padding: 10px; }
            .content { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">WONDERCART</div>
        </div>
        <div class="content">
            <h2 class="title">Message Received</h2>
            <p class="text">We've received your message and will respond within 24-48 hours.</p>
            
            <div class="ref-box">
                <div class="label">Reference Number</div>
                <div class="ref">203hfk43</div>
            </div>

            <div class="info">
                <div class="label">Name</div>
                <div class="value">{name}</div>
                
                <div class="label">Email</div>
                <div class="value">{email}</div>
                
                <div class="label">Subject</div>
                <div class="value">{subject}</div>
            </div>

            <div style="margin-top: 25px;">
                <div class="label">Your Message</div>
                <div style="padding: 15px; background: #f8f8f8; border-radius: 6px; margin-top: 10px;">
                    {message}
                </div>
            </div>
        </div>
        <div class="footer">
            © 2025 WonderCart<br>wondercarthelp@gmail.com | +91-7226987466
        </div>
    </div>
</body>
</html>
`;

// Helper functions
const getShortId = (id) => {
    if (!id) return "";
    const idStr = id.toString ? id.toString() : String(id);
    return idStr.slice(-8);
};

const formatPrice = (price) => {
    return `₹${parseFloat(price || 0).toFixed(2)}`;
};

const formatDate = (date) => {
    if (!date) return "Date not available";
    const dateObj = new Date(date);
    return isNaN(dateObj.getTime()) ? "Invalid date" :
        dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

// Order Confirmation Email Template
const orderConfirmation_Email_Template = (user, order) => {
    const orderId = getShortId(order._id);
    const orderDate = formatDate(order.createdAt || new Date());
    const orderTotal = formatPrice(order.totalAmount);
    const userName = user?.name || order.address?.fullName || "Customer";

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
        .header { background: #000; padding: 25px; text-align: center; color: white; }
        .logo { font-size: 22px; font-weight: bold; margin-bottom: 10px; }
        .content { padding: 30px; }
        .title { color: #000; font-size: 18px; margin: 20px 0 15px; }
        .alert { background: #f8f8f8; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #000; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
        .info-item { margin: 10px 0; }
        .label { color: #666; font-size: 13px; margin-bottom: 5px; }
        .value { font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #f8f8f8; padding: 12px; text-align: left; font-weight: bold; border-bottom: 2px solid #000; }
        td { padding: 12px; border-bottom: 1px solid #eee; }
        .total { font-weight: bold; border-top: 2px solid #000; }
        .btn { display: inline-block; background: #000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 10px; }
        .footer { background: #000; padding: 20px; text-align: center; color: white; font-size: 12px; }
        @media (max-width: 600px) {
            body { padding: 10px; }
            .content { padding: 20px; }
            .info-grid { grid-template-columns: 1fr; }
            table { font-size: 14px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">WONDERCART</div>
            <h2 style="margin: 10px 0 5px;">Order Confirmed</h2>
            <div>Thank you for your purchase!</div>
        </div>
        
        <div class="content">
            <div class="alert">
                <strong>Order #${orderId}</strong> has been confirmed and is being processed.
            </div>

            <div class="title">Order Summary</div>
            <div class="info-grid">
                <div class="info-item">
                    <div class="label">Order Number</div>
                    <div class="value">#${orderId}</div>
                </div>
                <div class="info-item">
                    <div class="label">Order Date</div>
                    <div class="value">${orderDate}</div>
                </div>
                <div class="info-item">
                    <div class="label">Payment</div>
                    <div class="value">${order.paymentMethod || "N/A"}</div>
                </div>
                <div class="info-item">
                    <div class="label">Status</div>
                    <div class="value" style="color: #000;">${order.orderStatus || "Confirmed"}</div>
                </div>
            </div>

            <div class="title">Order Details</div>
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${(order.items || []).map(item => `
                    <tr>
                        <td>
                            <strong>${item.productName || "Product"}</strong>
                            ${item.color ? `<div style="color: #666; font-size: 13px;">Color: ${item.color}</div>` : ""}
                        </td>
                        <td>${item.quantity || 1}</td>
                        <td>${formatPrice(item.price)}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>

            <table>
                <tr>
                    <td style="text-align: right;">Subtotal:</td>
                    <td>${formatPrice(order.totalAmount - (order.shipping || 0))}</td>
                </tr>
                ${order.shipping ? `
                <tr>
                    <td style="text-align: right;">Shipping:</td>
                    <td>${formatPrice(order.shipping)}</td>
                </tr>
                ` : ''}
                <tr class="total">
                    <td style="text-align: right;">Total:</td>
                    <td><strong>${orderTotal}</strong></td>
                </tr>
            </table>

            <div class="title">Shipping Information</div>
            <div style="background: #f8f8f8; padding: 15px; border-radius: 6px;">
                <div><strong>${order.address?.fullName || "Customer"}</strong></div>
                <div style="margin-top: 10px;">${order.address?.phone || ""}</div>
                <div>${order.address?.street || ""}</div>
                <div>${order.address?.city || ""}, ${order.address?.state || ""} ${order.address?.zipcode || ""}</div>
            </div>

            <center style="margin: 25px 0;">
                <a href="#" class="btn">Track Order</a>
            </center>

            <div style="text-align: center; margin-top: 25px; color: #666; font-size: 14px;">
                Need help? support@wondercart.com
            </div>
        </div>

        <div class="footer">
            © ${new Date().getFullYear()} WonderCart<br>
            <a href="https://wondercart.com" style="color: white;">Shop Again</a> | 
            <a href="mailto:support@wondercart.com" style="color: white;">Contact Support</a>
        </div>
    </div>
</body>
</html>
  `;
};

module.exports = {
    Verification_Email_Template,
    Welcome_Email_Template,
    resendCode_Email_Template,
    forgatPassword_Email_Template,
    contactSupport_Email_Template,
    orderConfirmation_Email_Template,
};