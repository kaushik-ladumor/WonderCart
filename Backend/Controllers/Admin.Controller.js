const User = require("../Models/User.Model");
const Product = require("../Models/Product.Model");
const Order = require("../Models/Order.Model");
const cloudinary = require("../Utils/Cloudinary");
const Review = require("../Models/Review.Model");
const Cart = require("../Models/Cart.Model");
const Wishlist = require("../Models/WishList.Model");
const Notification = require("../Models/Notification.Model");

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

module.exports = {
    getUser,
    getProduct,
    getOrder,
    productApproval,
    rejectProduct,
    deleteUser,
};
