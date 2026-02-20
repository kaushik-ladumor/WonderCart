const User = require("../Models/User.Model");
const Product = require("../Models/Product.Model");
const Order = require("../Models/Order.Model");
const cloudinary = require("../Utils/Cloudinary");
const Review = require("../Models/Review.Model");
const Cart = require("../Models/Cart.Model");
const Wishlist = require("../Models/WishList.Model");
const Notification = require("../Models/Notification.Model");
const Coupon = require("../Models/Coupon.Model");

const getUser = async (req, res) => {
    try {
        const users = await User.find();
        const userCount = await User.countDocuments();

        res.status(200).json({
            message: "Users retrieved successfully",
            data: {
                users,
                userCount,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

const getProduct = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const skip = (page - 1) * limit;

        const productCount = await Product.countDocuments();
        const products = await Product.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            message: "Products retrieved successfully",
            data: {
                products,
                productCount,
                pagination: {
                    total: productCount,
                    page,
                    limit,
                    pages: Math.ceil(productCount / limit),
                },
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

const getOrder = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user")
            .populate("products.product");

        const orderCount = await Order.countDocuments();

        res.status(200).json({
            message: "Orders retrieved successfully",
            data: {
                orders,
                orderCount,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

const productApproval = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (product.status !== "pending") {
            return res
                .status(400)
                .json({ message: "Product is not pending approval" });
        }

        product.status = "approved";
        await product.save();

        global.io.emit("admin-dashboard-update");
        global.io.emit("seller-dashboard-update");

        global.io.to(`seller-${product.owner}`).emit("notification", {
            type: "product-approved",
            message: `✅ Your product "${product.name}" approved`,
            productId: product._id,
        });

        res.status(200).json({
            message: "Product approved successfully",
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

const rejectProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (product.status !== "pending") {
            return res
                .status(400)
                .json({ message: "Product is not pending approval" });
        }

        const getPublicId = (url) => {
            const parts = url.split("/");
            const uploadIndex = parts.indexOf("upload");
            if (uploadIndex === -1) return null;
            const startIndex = parts[uploadIndex + 1]?.startsWith("v") ? uploadIndex + 2 : uploadIndex + 1;
            const publicIdWithExt = parts.slice(startIndex).join("/");
            return publicIdWithExt.split(".")[0];
        };

        for (const variant of product.variants) {
            for (const image of variant.images) {
                const publicId = getPublicId(image);
                await cloudinary.uploader.destroy(publicId);
            }
        }

        await Product.findByIdAndDelete(productId);

        global.io.emit("admin-dashboard-update");
        global.io.emit("seller-dashboard-update");

        global.io.to(`seller-${product.owner}`).emit("notification", {
            type: "product-rejected",
            message: `❌ Your product "${product.name}" was rejected`,
        });

        res.status(200).json({
            message: "Product rejected successfully",
        });

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

const deleteUser = async (req, res) => {
    try {
        const userId = req.body.userId;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const ACTIVE_ORDER_STATUS = [
            /^pending$/i,
            /^processing$/i,
            /^shipped$/i,
        ];

        const activeUserOrder = await Order.findOne({
            user: userId,
            status: { $in: ACTIVE_ORDER_STATUS },
        });
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
            message: "User and all related data deleted permanently",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
}



const createCoupon = async (req, res) => {
    try {

        let {
            code,
            name,
            description,
            dealType,
            discount,
            maxDiscount,
            perUserLimit,
            startDate,
            expirationDate,
            targetType,
            targetRole,
            targetCategory,
            minCompletedOrders,
            minOrderValue,
            isFirstOrderOnly,
            allowedUsers,
            randomUserCount
        } = req.body;

        if (!code || !dealType || (dealType !== 'free_shipping' && (discount === undefined || discount === null || discount === ""))) {
            return res.status(400).json({
                message: "Required fields missing"
            });
        }

        code = code.toUpperCase().trim();

        if (Number(discount) < 0 || (maxDiscount && Number(maxDiscount) < 0) || Number(perUserLimit) < 0 || (minCompletedOrders && Number(minCompletedOrders) < 0) || (minOrderValue && Number(minOrderValue) < 0) || (randomUserCount && Number(randomUserCount) < 0)) {
            return res.status(400).json({
                message: "Numeric values cannot be negative"
            });
        }

        const existingCoupon = await Coupon.findOne({ code });
        if (existingCoupon) {
            return res.status(400).json({
                message: "Coupon code already exists"
            });
        }

        // Handle dates automatically
        const finalStartDate = startDate ? new Date(startDate) : new Date();
        const finalExpirationDate = expirationDate ? new Date(expirationDate) : null;

        if (finalExpirationDate && finalStartDate >= finalExpirationDate) {
            return res.status(400).json({
                message: "Expiration date must be after start date"
            });
        }

        let finalAllowedUsers = allowedUsers || [];

        if (targetType === "specific_users" && randomUserCount) {
            const randomUsers = await User.aggregate([
                { $match: { role: targetRole || 'user' } },
                { $sample: { size: Number(randomUserCount) } }
            ]);
            finalAllowedUsers = randomUsers.map(user => user._id);
        } else if (targetType === "loyal_users" && minCompletedOrders) {
            const loyalUsers = await Order.aggregate([
                { $match: { status: 'delivered' } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'userData'
                    }
                },
                { $unwind: '$userData' },
                { $match: { 'userData.role': targetRole || 'user' } },
                { $group: { _id: "$user", count: { $sum: 1 } } },
                { $match: { count: { $gte: Number(minCompletedOrders) } } }
            ]);
            finalAllowedUsers = loyalUsers.map(user => user._id);
        } else if (targetType === "all") {
            const allUsers = await User.find({ role: targetRole || 'user' }).select("_id");
            finalAllowedUsers = allUsers.map(user => user._id);
        } else if (targetType === "new_users") {
            // Assign to users who have placed 0 successful/processing orders
            const usersWithOrders = await Order.distinct("user");
            const eligibleUsers = await User.find({
                role: targetRole || 'user',
                _id: { $nin: usersWithOrders }
            }).select("_id");
            finalAllowedUsers = eligibleUsers.map(user => user._id);
        }

        const coupon = new Coupon({
            code,
            name,
            description,
            dealType,
            discount,
            maxDiscount: dealType === 'percentage' ? maxDiscount : undefined,
            perUserLimit,
            startDate: finalStartDate,
            expirationDate: finalExpirationDate,
            targetType,
            targetRole: targetType === 'specific_users' ? targetRole : (targetRole || 'user'),
            targetCategory: targetCategory || null,
            minCompletedOrders: targetType === 'loyal_users' ? minCompletedOrders : 0,
            minOrderValue: minOrderValue || 0,
            isFirstOrderOnly: !!isFirstOrderOnly,
            allowedUsers: finalAllowedUsers
        });

        await coupon.save();

        res.status(201).json({
            message: "Coupon created successfully",
            data: coupon
        });

    } catch (error) {
        console.error("Create Coupon Error:", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};



const getCoupon = async (req, res) => {
    try {

        const coupon = await Coupon.find().sort({ createdAt: -1 });
        const couponCount = await Coupon.countDocuments();

        res.status(200).json({
            message: "Coupons retrieved successfully",
            data: { coupon, couponCount }
        });

    } catch (error) {
        console.error("Get Coupon Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};


const getSingleCoupon = async (req, res) => {
    try {
        const { couponId } = req.params;
        const coupon = await Coupon.findById(couponId);

        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        res.status(200).json({
            message: "Coupon retrieved successfully",
            data: coupon
        });
    } catch (error) {
        console.error("Get Single Coupon Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
const updateCoupon = async (req, res) => {
    try {
        const { couponId } = req.params;
        const updateData = req.body;

        const coupon = await Coupon.findById(couponId);
        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        const numericFields = ['discount', 'maxDiscount', 'perUserLimit', 'minCompletedOrders', 'minOrderValue', 'randomUserCount'];
        for (const field of numericFields) {
            if (updateData[field] !== undefined && Number(updateData[field]) < 0) {
                return res.status(400).json({ message: `${field} cannot be negative` });
            }
        }

        if (updateData.code) {
            const exist = await Coupon.findOne({
                code: updateData.code.toUpperCase().trim(),
                _id: { $ne: couponId }
            });

            if (exist) {
                return res.status(400).json({ message: "Coupon code already exists" });
            }
            updateData.code = updateData.code.toUpperCase().trim();
        }

        if (updateData.startDate && updateData.expirationDate) {
            if (new Date(updateData.startDate) >= new Date(updateData.expirationDate)) {
                return res.status(400).json({ message: "Invalid date range" });
            }
        }

        Object.assign(coupon, updateData);

        if (coupon.dealType !== 'percentage') {
            coupon.maxDiscount = undefined;
        }

        await coupon.save();

        res.status(200).json({
            message: "Coupon updated successfully",
            data: coupon
        });

    } catch (error) {
        console.error("Update Coupon Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};


const deleteCoupon = async (req, res) => {
    try {

        const { couponId } = req.params;

        const coupon = await Coupon.findByIdAndDelete(couponId);

        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        res.status(200).json({
            message: "Coupon deleted successfully"
        });

    } catch (error) {
        console.error("Delete Coupon Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    getUser,
    getProduct,
    getOrder,
    productApproval,
    rejectProduct,
    deleteUser,
    createCoupon,
    getCoupon,
    getSingleCoupon,
    updateCoupon,
    deleteCoupon
};
