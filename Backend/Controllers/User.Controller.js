const User = require("../Models/User.Model");
const Order = require("../Models/Order.Model");
const Product = require("../Models/Product.Model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Cart = require("../Models/Cart.Model");
const Wishlist = require("../Models/WishList.Model");
const Notification = require("../Models/Notification.Model");
const Review = require("../Models/Review.Model");
const cloudinary = require("../Utils/Cloudinary");

const {
  sendVerificationCode,
  sendWelcomeEmail,
  sendResendCode,
  sendForgatPasswordCode,
  contactSupport,
} = require("../Middlewares/email");

const getPublicId = (url) => {
  const parts = url.split("/");
  const uploadIndex = parts.indexOf("upload");
  if (uploadIndex === -1) return null;
  const startIndex = parts[uploadIndex + 1]?.startsWith("v") ? uploadIndex + 2 : uploadIndex + 1;
  const publicIdWithExt = parts.slice(startIndex).join("/");
  return publicIdWithExt.split(".")[0];
};

const signup = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password, !role) {
      return res.status(400).json({
        success: false,
        message: "All fields (username, email, password, role) are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const expireCode = new Date(Date.now() + 10 * 60 * 1000);

    const newUser = await User.create({
      username,
      email,
      role,
      password: hashedPassword,
      verificationCode,
      expireCode,
    });

    await sendVerificationCode(newUser.email, verificationCode);

    const token = jwt.sign(
      {
        userId: newUser._id,
        role: newUser.role,
        email: newUser.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(201).json({
      success: true,
      message: "User created successfully. Please verify your email.",
      token,
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        isVerified: newUser.isVerified,
        hasPassword: true,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email or username already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email })
      .select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in",
      });
    }

    if (!user.password) {
      return res.status(500).json({
        success: false,
        message: "Password not found",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        user: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    sendWelcomeEmail(user.email, user.username)
      .catch(err =>
        console.error("Welcome Email Error:", err)
      );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isVerified: user.isVerified,
        googleId: user.googleId || null,
        hasPassword: !!user.password,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const googleAuth = async (req, res) => {
  try {
    const { username, email, photoURL, uid, selectedRole } = req.body;

    if (!email || !uid) {
      return res.status(400).json({
        success: false,
        message: "Email and Google ID required",
      });
    }

    let user = await User.findOne({ email });
    let isNewUser = false;

    if (user) {
      if (!user.googleId) user.googleId = uid;
      if (photoURL && user.profile !== photoURL) {
        user.profile = photoURL;
      }
      await user.save();
    } else {
      isNewUser = true;

      const role =
        selectedRole === "seller" ? "seller" : "user";

      const safeUsername = (username || email.split("@")[0])
        .toLowerCase()
        .trim()
        .replace(/[.\s-]+/g, "_");
      console.log(safeUsername);

      user = await User.create({
        username: safeUsername,
        email,
        googleId: uid,
        role,
        profile: photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        isVerified: true,
      });
    }

    sendWelcomeEmail(user.email, user.username).catch((err) =>
      console.error("Welcome Email Error:", err)
    );

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(isNewUser ? 201 : 200).json({
      success: true,
      token,
      isNewUser,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isVerified: user.isVerified,
        googleId: user.googleId || null,
        hasPassword: !!user.password,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const verify = async (req, res) => {
  try {
    const { verificationCode } = req.body;

    if (!verificationCode) {
      return res.status(400).json({
        success: false,
        message: "Verification code is required",
      });
    }

    const user = await User.findOne({ verificationCode });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    if (user.expireCode && user.expireCode < Date.now()) {
      return res.status(410).json({
        success: false,
        message: "Verification code expired. Please request a new one.",
      });
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.expireCode = null;

    await user.save();
    await sendWelcomeEmail(user.email, user.username);

    res.status(200).json({
      success: true,
      message: "Account verified successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const resendCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(409).json({
        success: false,
        message: "Account is already verified. Please login.",
      });
    }

    const newCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    user.verificationCode = newCode;
    user.expireCode = expiry;

    await user.save();
    await sendResendCode(user.email, user.verificationCode);

    res.status(200).json({
      success: true,
      message: "New verification code sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const forgatPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before resetting password",
      });
    }

    const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    user.verificationCode = resetCode;
    user.expireCode = expiry;

    await user.save();
    await sendForgatPasswordCode(user.email, user.verificationCode);

    res.status(200).json({
      success: true,
      message: "Password reset code sent to your email",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, verificationCode, newPassword } = req.body;

    if (!email || !verificationCode || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, verification code and new password are required",
      });
    }

    const user = await User.findOne({ email, verificationCode });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid verification code or email",
      });
    }

    if (user.expireCode && user.expireCode < Date.now()) {
      return res.status(410).json({
        success: false,
        message: "Verification code expired. Please request a new one.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.verificationCode = null;
    user.expireCode = null;

    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password reset successful. You can now login with new password.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 🔹 CASE 1: GOOGLE USER → SET PASSWORD (NO CURRENT PASSWORD NEEDED)
    if (!user.password) {
      const hashed = await bcrypt.hash(newPassword, 10);
      user.password = hashed;
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Password set successfully",
        hasPassword: true,
      });
    }

    // 🔹 CASE 2: NORMAL USER → UPDATE PASSWORD (CURRENT PASSWORD REQUIRED)
    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password is required",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
      hasPassword: true,
    });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const profile = async (req, res) => {
  try {
    const id = req.user.userId; // 👈 JWT payload

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      success: true,
      user: {
        ...userObj,
        hasPassword: !!user.password,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const contact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, email, subject, message) are required",
      });
    }
    await contactSupport(name, email, subject, message);
    res.status(200).json({
      success: true,
      message: "Your message has been received. We will get back to you shortly.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//Address function to be added here

const addAddress = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isDefault =
      user.addresses.length === 0 ? true : Boolean(req.body.isDefault);

    if (isDefault) {
      user.addresses.forEach(a => (a.isDefault = false));
    }

    user.addresses.push({
      fullName: req.body.fullName,
      phone: req.body.phone,
      street: req.body.street,
      city: req.body.city,
      state: req.body.state,
      zipCode: req.body.zipCode,
      country: req.body.country || "India",
      isDefault,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      addresses: user.addresses,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const address = user.addresses.id(req.params.addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    Object.assign(address, req.body);
    await user.save();

    res.json({ success: true, message: "Address updated", addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const address = user.addresses.id(req.params.addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    user.addresses.forEach(a => (a.isDefault = false));
    address.isDefault = true;

    await user.save();

    res.json({ success: true, message: "Default address updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const address = user.addresses.id(req.params.addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    const wasDefault = address.isDefault;
    user.addresses.pull(req.params.addressId);

    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.json({ success: true, message: "Address deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;

    const ACTIVE_ORDER_STATUS = [
      /^pending$/i,
      /^processing$/i,
      /^shipped$/i,
    ];

    const user = await User.findById(userId);
    console.log("User:", userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const activeUserOrder = await Order.findOne({
      user: userId,
      status: { $in: ACTIVE_ORDER_STATUS },
    });

    console.log("Active User Order:", activeUserOrder);

    if (activeUserOrder) {
      return res.status(400).json({
        success: false,
        message: `You cannot delete account. Order is currently ${activeUserOrder.status}.`,
      });
    }

    if (user.role === "seller") {
      const orders = await Order.find({
        status: { $in: ACTIVE_ORDER_STATUS },
      }).populate({
        path: "items.product",
        select: "owner",
      });

      let sellerHasActiveOrder = false;

      for (const order of orders) {
        const hasSellerProduct = order.items.some(
          (item) =>
            item.product &&
            item.product.owner.toString() === userId.toString()
        );

        if (hasSellerProduct) {
          sellerHasActiveOrder = true;
          break;
        }
      }

      console.log("Seller Has Active Order:", sellerHasActiveOrder);

      if (sellerHasActiveOrder) {
        return res.status(400).json({
          success: false,
          message:
            "You have active orders as a seller. Complete or cancel them first.",
        });
      }

      const products = await Product.find({ owner: userId });
      console.log("Seller Products Count:", products.length);

      for (const product of products) {
        if (product.images?.length) {
          for (const image of product.images) {
            if (image) {
              try {
                const publicId = getPublicId(image);
                await cloudinary.uploader.destroy(publicId);
                console.log("Deleted Cloudinary Image:", publicId);
              } catch (err) {
                console.log("Cloudinary Error:", err);
              }
            }
          }
        }
      }

      await Product.deleteMany({ owner: userId });
      console.log("Seller Products Deleted");
    }

    const userReviews = await Review.find({ user: userId });
    console.log("User Reviews:", userReviews.length);

    const productIds = [
      ...new Set(userReviews.map((r) => r.product.toString())),
    ];

    await Review.deleteMany({ user: userId });
    console.log("User Reviews Deleted");

    for (const productId of productIds) {
      const reviews = await Review.find({ product: productId });

      let avgRating = 0;
      let numReviews = reviews.length;

      if (numReviews > 0) {
        avgRating =
          reviews.reduce((acc, item) => acc + item.rating, 0) /
          numReviews;
      }

      await Product.findByIdAndUpdate(productId, {
        averageRating: parseFloat(avgRating.toFixed(1)),
        numReviews,
      });

      console.log("Updated Product Rating:", productId);
    }

    await Cart.deleteMany({ user: userId });
    await Wishlist.deleteMany({ user: userId });
    await Notification.deleteMany({ user: userId });

    console.log("Cart, Wishlist, Notifications Deleted");

    await User.findByIdAndDelete(userId);
    console.log("User Deleted Successfully");

    res.json({
      success: true,
      message: "Account and all related data deleted permanently",
    });
  } catch (error) {
    console.log("Delete Account Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  signup,
  login,
  verify,
  resendCode,
  forgatPassword,
  resetPassword,
  updatePassword,
  profile,
  contact,
  addAddress,
  getAddresses,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
  googleAuth,
  deleteAccount,
};
