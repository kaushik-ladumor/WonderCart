const mongoose = require("mongoose");
const Product = require("../Models/Product.Model");
const Order = require("../Models/Order.Model");
const User = require("../Models/User.Model");
const SellerProfile = require("../Models/SellerProfile.Model");
const Notification = require("../Models/Notification.Model");
const transporter = require("../Middlewares/EmailConfig");
const cloudinary = require("../Utils/Cloudinary");

// ─── DASHBOARD ───
const sellerDashboard = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user.userId);

    // Check seller profile status
    let sellerProfile = await SellerProfile.findOne({ user: sellerId });
    if (!sellerProfile) {
      sellerProfile = await SellerProfile.create({ user: sellerId, profileStatus: "email_pending" });
    }

    const products = await Product.find({ owner: sellerId });
    const productIds = products.map(p => p._id);
    const productCount = products.length;
    const pendingProductCount = products.filter(p => p.status === "pending").length;
    const approvedProductCount = products.filter(p => p.status === "approved").length;

    const orders = await Order.find({
      "items.product": { $in: productIds }
    }).sort({ createdAt: -1 });

    const orderStatus = {
      pending: { orderCount: 0, totalEarnings: 0 },
      processing: { orderCount: 0, totalEarnings: 0 },
      shipped: { orderCount: 0, totalEarnings: 0 },
      delivered: { orderCount: 0, totalEarnings: 0 },
      cancelled: { orderCount: 0, totalEarnings: 0 }
    };

    let totalEarnings = 0;

    orders.forEach(order => {
      const sellerItems = order.items.filter(item =>
        productIds.some(id => id.equals(item.product))
      );
      const earning = sellerItems.reduce(
        (sum, item) => sum + (item.price * item.quantity), 0
      );
      if (orderStatus[order.status]) {
        orderStatus[order.status].orderCount += 1;
        orderStatus[order.status].totalEarnings += earning;
        totalEarnings += earning;
      }
    });

    const orderCount = orders.length;
    const deliveredCount = orderStatus.delivered.orderCount;
    const successRate = orderCount > 0 ? Math.round((deliveredCount / orderCount) * 100) : 0;
    const avgOrderValue = orderCount > 0 ? (totalEarnings / orderCount) : 0;

    res.json({
      productCount,
      pendingProductCount,
      approvedProductCount,
      orderCount,
      totalEarnings,
      avgOrderValue,
      successRate,
      orderStatus,
      sellerProfile: {
        profileStatus: sellerProfile.profileStatus,
        emailVerified: sellerProfile.emailVerified,
        step2Completed: sellerProfile.step2Completed,
        step3Completed: sellerProfile.step3Completed,
        shopName: sellerProfile.shopName,
        rejectionReason: sellerProfile.rejectionReason,
        adminMessage: sellerProfile.adminMessage,
      }
    });

  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Server error loading dashboard" });
  }
};

// ─── GET SELLER PROFILE ───
const getSellerProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    let profile = await SellerProfile.findOne({ user: userId });

    if (!profile) {
      profile = await SellerProfile.create({ user: userId, profileStatus: "email_pending" });
    }

    res.json({ success: true, profile });
  } catch (error) {
    console.error("Get seller profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── SEND OTP FOR EMAIL VERIFICATION ───
const sendSellerOtp = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.verificationCode = otp;
    user.expireCode = expiry;
    await user.save();

    // Send OTP email
    try {
      await transporter.sendMail({
        from: '"Team WonderCart🎋" <wondercarthelp@gmail.com>',
        to: user.email,
        subject: "Verify your Seller Email - WonderCart",
        html: `
          <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="font-size: 20px; font-weight: 700; color: #141b2d; margin: 0;">WonderCart Seller</h1>
              <p style="font-size: 13px; color: #5c6880; margin-top: 4px;">Email Verification</p>
            </div>
            <div style="text-align: center; padding: 32px; background: #f8f9fc; border-radius: 16px; margin-bottom: 24px;">
              <p style="font-size: 14px; color: #5c6880; margin: 0 0 16px;">Your verification code is</p>
              <div style="font-size: 36px; font-weight: 800; color: #141b2d; letter-spacing: 8px; font-family: monospace;">${otp}</div>
              <p style="font-size: 12px; color: #9ca3af; margin-top: 16px;">This code expires in 10 minutes</p>
            </div>
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">If you didn't request this, ignore this email.</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Email send failed:", emailErr);
    }

    res.json({
      success: true,
      message: "OTP sent to your email",
      verificationCode: otp, // For EmailJS fallback on frontend
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── VERIFY SELLER OTP ───
const verifySellerOtp = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { otp } = req.body;

    if (!otp || otp.length !== 4) {
      return res.status(400).json({ success: false, message: "Invalid OTP format" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.expireCode && user.expireCode < Date.now()) {
      return res.status(410).json({ success: false, message: "OTP expired. Please resend." });
    }

    if (user.verificationCode !== otp) {
      return res.status(400).json({ success: false, message: "Incorrect code. Try again." });
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationCode = null;
    user.expireCode = null;
    await user.save();

    // Update seller profile
    let profile = await SellerProfile.findOne({ user: userId });
    if (!profile) {
      profile = await SellerProfile.create({ user: userId });
    }
    profile.emailVerified = true;
    profile.profileStatus = "email_verified";
    await profile.save();

    res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── SAVE STEP 2: BUSINESS DETAILS ───
const saveBusinessDetails = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      shopName, businessType, sellerCategories, gstNumber, panNumber,
      businessAddress, warehouseAddress, warehouseSameAsBusiness,
      supportEmail, supportPhone,
    } = req.body;

    if (!shopName || !panNumber || !sellerCategories || sellerCategories.length === 0) {
      return res.status(400).json({ success: false, message: "Shop name, PAN, and at least one category are required" });
    }

    if (sellerCategories.length > 5) {
      return res.status(400).json({ success: false, message: "Maximum 5 categories allowed" });
    }

    // PAN validation
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    if (!panRegex.test(panNumber.toUpperCase())) {
      return res.status(400).json({ success: false, message: "Invalid PAN number format" });
    }

    // GST validation (if provided)
    if (gstNumber) {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
      if (!gstRegex.test(gstNumber.toUpperCase())) {
        return res.status(400).json({ success: false, message: "Invalid GST number format" });
      }
    }

    let profile = await SellerProfile.findOne({ user: userId });
    if (!profile) {
      profile = await SellerProfile.create({ user: userId });
    }

    if (profile.profileStatus === "submitted" || profile.profileStatus === "active") {
      return res.status(400).json({ success: false, message: "Profile already submitted or active" });
    }

    // Handle document uploads
    let panCardUrl = profile.panCardDocument;
    let identityDocUrl = profile.identityDocument;

    if (req.files) {
      if (req.files.panCardDocument && req.files.panCardDocument[0]) {
        panCardUrl = req.files.panCardDocument[0].path.replace("http://", "https://");
      }
      if (req.files.identityDocument && req.files.identityDocument[0]) {
        identityDocUrl = req.files.identityDocument[0].path.replace("http://", "https://");
      }
    }

    profile.shopName = shopName;
    profile.businessType = businessType || "";
    profile.sellerCategories = sellerCategories;
    profile.gstNumber = gstNumber ? gstNumber.toUpperCase() : "";
    profile.panNumber = panNumber.toUpperCase();
    profile.businessAddress = businessAddress;
    profile.warehouseSameAsBusiness = warehouseSameAsBusiness;
    profile.warehouseAddress = warehouseSameAsBusiness ? businessAddress : warehouseAddress;
    profile.supportEmail = supportEmail || "";
    profile.supportPhone = supportPhone || "";
    profile.panCardDocument = panCardUrl;
    profile.identityDocument = identityDocUrl;
    profile.step2Completed = true;

    await profile.save();

    res.json({ success: true, message: "Business details saved", profile });
  } catch (error) {
    console.error("Save business details error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── SAVE STEP 3: BANK ACCOUNT ───
const saveBankDetails = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      bankAccountHolder, bankAccountNumber,
      bankIfscCode, bankName, bankBranch, bankAccountType,
    } = req.body;

    if (!bankAccountHolder || !bankAccountNumber || !bankIfscCode || !bankAccountType) {
      return res.status(400).json({ success: false, message: "All bank fields are required" });
    }

    let profile = await SellerProfile.findOne({ user: userId });
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

    if (profile.profileStatus === "submitted" || profile.profileStatus === "active") {
      return res.status(400).json({ success: false, message: "Profile already submitted or active" });
    }

    profile.bankAccountHolder = bankAccountHolder;
    profile.bankAccountNumber = bankAccountNumber;
    profile.bankIfscCode = bankIfscCode.toUpperCase();
    profile.bankName = bankName || "";
    profile.bankBranch = bankBranch || "";
    profile.bankAccountType = bankAccountType;
    profile.step3Completed = true;

    await profile.save();

    res.json({ success: true, message: "Bank details saved", profile });
  } catch (error) {
    console.error("Save bank details error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── SUBMIT FOR REVIEW ───
const submitForReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const profile = await SellerProfile.findOne({ user: userId });

    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

    if (!profile.emailVerified) {
      return res.status(400).json({ success: false, message: "Email not verified" });
    }
    if (!profile.step2Completed) {
      return res.status(400).json({ success: false, message: "Business details incomplete" });
    }
    if (!profile.step3Completed) {
      return res.status(400).json({ success: false, message: "Bank details incomplete" });
    }

    profile.profileStatus = "submitted";
    profile.submittedAt = new Date();
    profile.rejectionReason = null;
    profile.adminMessage = null;
    await profile.save();

    // Notify admins
    const admins = await User.find({ role: "admin" });
    const user = await User.findById(userId);

    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        role: "admin",
        type: "seller-application",
        message: `📋 New seller application from ${user.username} — Shop: ${profile.shopName}`,
      });

      if (global.io) {
        global.io.to(`admin-${admin._id}`).emit("notification", {
          type: "seller-application",
          message: `📋 New seller application from ${user.username} — Shop: ${profile.shopName}`,
        });
      }
    }

    // Send admin notification email
    try {
      const adminEmails = admins.map(a => a.email).join(", ");
      if (adminEmails) {
        await transporter.sendMail({
          from: '"WonderCart System" <wondercarthelp@gmail.com>',
          to: adminEmails,
          subject: `New Seller Application — ${profile.shopName}`,
          html: `<p>New seller application submitted by <b>${user.username}</b> — Shop: <b>${profile.shopName}</b></p><p>Categories: ${profile.sellerCategories.join(", ")}</p><p>Please review in the admin panel.</p>`,
        });
      }
    } catch (emailErr) {
      console.error("Admin notification email failed:", emailErr);
    }

    res.json({ success: true, message: "Profile submitted for review" });
  } catch (error) {
    console.error("Submit for review error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── REQUEST NEW CATEGORY ───
const requestNewCategory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { category, reason } = req.body;

    if (!category || !reason) {
      return res.status(400).json({ success: false, message: "Category and reason required" });
    }

    const profile = await SellerProfile.findOne({ user: userId });
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

    if (profile.profileStatus !== "active") {
      return res.status(400).json({ success: false, message: "Only approved sellers can request categories" });
    }

    if (profile.sellerCategories.includes(category)) {
      return res.status(400).json({ success: false, message: "Category already approved" });
    }

    // Check for pending request for same category
    const existingRequest = profile.categoryRequests.find(
      r => r.category.toLowerCase() === category.toLowerCase() && r.status === "pending"
    );
    if (existingRequest) {
      return res.status(400).json({ success: false, message: "Request already pending for this category" });
    }

    profile.categoryRequests.push({ category, reason });
    await profile.save();

    // Notify admins
    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        role: "admin",
        type: "category-request",
        message: `🏷️ Category request: "${category}" from ${profile.shopName}`,
      });
    }

    res.json({ success: true, message: "Category request submitted" });
  } catch (error) {
    console.error("Request category error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── GET SELLER CATEGORIES (for Add Product dropdown) ───
const getSellerCategories = async (req, res) => {
  try {
    const userId = req.user.userId;
    const profile = await SellerProfile.findOne({ user: userId });

    if (!profile || profile.profileStatus !== "active") {
      return res.status(403).json({ success: false, message: "Seller profile not active", categories: [] });
    }

    res.json({ success: true, categories: profile.sellerCategories });
  } catch (error) {
    console.error("Get seller categories error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── ADMIN: GET SELLER APPLICATIONS ───
const getSellerApplications = async (req, res) => {
  try {
    const { status } = req.query; // pending, active, rejected, submitted
    const filter = {};
    if (status === "pending" || status === "submitted") {
      filter.profileStatus = "submitted";
    } else if (status) {
      filter.profileStatus = status;
    }

    const applications = await SellerProfile.find(filter)
      .populate("user", "username email profile createdAt")
      .sort({ submittedAt: -1 });

    res.json({ success: true, applications });
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── ADMIN: GET SINGLE APPLICATION ───
const getSingleApplication = async (req, res) => {
  try {
    const { profileId } = req.params;
    const profile = await SellerProfile.findById(profileId)
      .populate("user", "username email profile createdAt isVerified");

    if (!profile) return res.status(404).json({ success: false, message: "Application not found" });

    res.json({ success: true, profile });
  } catch (error) {
    console.error("Get single application error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── ADMIN: APPROVE SELLER ───
const approveSeller = async (req, res) => {
  try {
    const { profileId } = req.params;
    const adminId = req.user.userId;
    const admin = await User.findById(adminId);

    const profile = await SellerProfile.findById(profileId);
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

    profile.profileStatus = "active";
    profile.approvedAt = new Date();
    profile.rejectionReason = null;
    profile.adminMessage = null;
    profile.actionLogs.push({
      admin: adminId,
      adminName: admin.username,
      action: "approve",
      reason: "Application approved",
    });
    await profile.save();

    const user = await User.findById(profile.user);

    // Send approval email
    try {
      await transporter.sendMail({
        from: '"Team WonderCart🎋" <wondercarthelp@gmail.com>',
        to: user.email,
        subject: "Your seller account is approved! 🎉",
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 32px;">
            <h1 style="color: #141b2d; font-size: 22px;">Congratulations, ${user.username}! 🎉</h1>
            <p>Your seller account <b>${profile.shopName}</b> has been approved.</p>
            <p><b>Approved categories:</b> ${profile.sellerCategories.join(", ")}</p>
            <p>You can now start listing products on WonderCart.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/seller/dashboard" 
               style="display:inline-block; background:#141b2d; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold; margin-top:16px;">
              Go to Dashboard →
            </a>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Approval email failed:", emailErr);
    }

    // Notify seller
    await Notification.create({
      user: profile.user,
      role: "seller",
      type: "seller-approved",
      message: "🎉 Your seller account has been approved! Start listing products.",
    });
    if (global.io) {
      global.io.to(`seller-${profile.user}`).emit("notification", {
        type: "seller-approved",
        message: "🎉 Your seller account has been approved!",
      });
    }

    res.json({ success: true, message: "Seller approved" });
  } catch (error) {
    console.error("Approve seller error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── ADMIN: REJECT SELLER ───
const rejectSeller = async (req, res) => {
  try {
    const { profileId } = req.params;
    const { reason, note } = req.body;
    const adminId = req.user.userId;
    const admin = await User.findById(adminId);

    const profile = await SellerProfile.findById(profileId);
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

    profile.profileStatus = "rejected";
    profile.rejectionReason = reason || "Application rejected";
    profile.adminMessage = note || "";
    profile.actionLogs.push({
      admin: adminId,
      adminName: admin.username,
      action: "reject",
      reason: reason || "Application rejected",
    });
    await profile.save();

    const user = await User.findById(profile.user);

    // Send rejection email
    try {
      await transporter.sendMail({
        from: '"Team WonderCart🎋" <wondercarthelp@gmail.com>',
        to: user.email,
        subject: "Seller Application Update — WonderCart",
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 32px;">
            <h1 style="color: #141b2d; font-size: 22px;">Application Update</h1>
            <p>Hi ${user.username},</p>
            <p>Unfortunately, your seller application for <b>${profile.shopName}</b> was not approved.</p>
            <p><b>Reason:</b> ${reason}</p>
            ${note ? `<p><b>Note:</b> ${note}</p>` : ""}
            <p>You can edit your profile and resubmit from your seller dashboard.</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Rejection email failed:", emailErr);
    }

    await Notification.create({
      user: profile.user,
      role: "seller",
      type: "seller-rejected",
      message: `❌ Your seller application was not approved. Reason: ${reason}`,
    });

    res.json({ success: true, message: "Seller rejected" });
  } catch (error) {
    console.error("Reject seller error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── ADMIN: REQUEST INFO ───
const requestSellerInfo = async (req, res) => {
  try {
    const { profileId } = req.params;
    const { message } = req.body;
    const adminId = req.user.userId;
    const admin = await User.findById(adminId);

    const profile = await SellerProfile.findById(profileId);
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

    profile.profileStatus = "email_verified"; // Allow editing
    profile.adminMessage = message;
    profile.actionLogs.push({
      admin: adminId,
      adminName: admin.username,
      action: "request_info",
      reason: message,
    });
    await profile.save();

    const user = await User.findById(profile.user);

    // Send email
    try {
      await transporter.sendMail({
        from: '"Team WonderCart🎋" <wondercarthelp@gmail.com>',
        to: user.email,
        subject: "Additional Information Required — WonderCart Seller",
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 32px;">
            <h1 style="color: #141b2d; font-size: 22px;">More Info Needed</h1>
            <p>Hi ${user.username},</p>
            <p>Our team needs additional information for your seller application:</p>
            <blockquote style="border-left: 3px solid #004ac6; padding: 8px 16px; background: #f0f4ff; margin: 16px 0;">${message}</blockquote>
            <p>Please update your profile and resubmit.</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Request info email failed:", emailErr);
    }

    await Notification.create({
      user: profile.user,
      role: "seller",
      type: "seller-info-request",
      message: `📝 Admin requested more info: ${message}`,
    });

    res.json({ success: true, message: "Info requested from seller" });
  } catch (error) {
    console.error("Request info error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── ADMIN: APPROVE CATEGORY ───
const approveCategoryRequest = async (req, res) => {
  try {
    const { profileId, requestId } = req.params;
    const adminId = req.user.userId;
    const admin = await User.findById(adminId);

    const profile = await SellerProfile.findById(profileId);
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

    const request = profile.categoryRequests.id(requestId);
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });

    request.status = "approved";
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();

    if (!profile.sellerCategories.includes(request.category)) {
      profile.sellerCategories.push(request.category);
    }

    profile.actionLogs.push({
      admin: adminId,
      adminName: admin.username,
      action: "category_approve",
      reason: `Approved category: ${request.category}`,
    });

    await profile.save();

    res.json({ success: true, message: "Category approved" });
  } catch (error) {
    console.error("Approve category error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── ADMIN: REJECT CATEGORY ───
const rejectCategoryRequest = async (req, res) => {
  try {
    const { profileId, requestId } = req.params;
    const { reason } = req.body;
    const adminId = req.user.userId;
    const admin = await User.findById(adminId);

    const profile = await SellerProfile.findById(profileId);
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

    const request = profile.categoryRequests.id(requestId);
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });

    request.status = "rejected";
    request.adminNote = reason;
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();

    profile.actionLogs.push({
      admin: adminId,
      adminName: admin.username,
      action: "category_reject",
      reason: `Rejected category: ${request.category} — ${reason}`,
    });

    await profile.save();

    // Email seller
    const user = await User.findById(profile.user);
    try {
      await transporter.sendMail({
        from: '"Team WonderCart🎋" <wondercarthelp@gmail.com>',
        to: user.email,
        subject: "Category Request Update — WonderCart",
        html: `<p>Hi ${user.username}, your request to add "${request.category}" category was not approved. Reason: ${reason}</p>`,
      });
    } catch (emailErr) {
      console.error("Category email failed:", emailErr);
    }

    res.json({ success: true, message: "Category request rejected" });
  } catch (error) {
    console.error("Reject category error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  sellerDashboard,
  getSellerProfile,
  sendSellerOtp,
  verifySellerOtp,
  saveBusinessDetails,
  saveBankDetails,
  submitForReview,
  requestNewCategory,
  getSellerCategories,
  getSellerApplications,
  getSingleApplication,
  approveSeller,
  rejectSeller,
  requestSellerInfo,
  approveCategoryRequest,
  rejectCategoryRequest,
};