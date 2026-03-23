const mongoose = require("mongoose");
const Product = require("../Models/Product.Model");
const Order = require("../Models/Order.Model");
const { userInput } = require("./AiService");
const { askResponse } = require("./AiModel");

const searchProducts = async (data) => {
    const query = {};

    if (data.category) {
        query.category = { $regex: data.category, $options: "i" };
    }

    if (data.max_price) {
        query["variants.sizes.sellingPrice"] = {
            $lte: Number(data.max_price)
        };
    }

    return await Product.find(query).limit(10);
};

const getCategories = async () => {
    return await Product.distinct("category");
};

const getOrder = async (orderId) => {
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) return null;
    return await Order.findById(orderId).populate("items.product");
};

const chatbotHandler = async (req, res) => {
    try {
        const userMessage = req.body.message;

        // Guard: reject empty messages
        if (!userMessage || !userMessage.trim()) {
            return res.status(400).json({ message: "Message is required." });
        }

        const intent = await userInput(userMessage);
        console.log("INTENT:", intent);

        // ================= PRODUCT SEARCH =================
        if (intent.intent === "search_product") {
            const products = await searchProducts(intent);

            const reply = await askResponse(`
User asked: ${userMessage}

Available products:
${JSON.stringify(products, null, 2)}

Recommend the best matching products from the list above.
Only reference products from the given list. Keep response concise and friendly.
`);

            return res.json({ message: reply, products });
        }

        // ================= CATEGORY LIST =================
        if (intent.intent === "list_categories") {
            const categories = await getCategories();
            return res.json({
                message: "Here are all available categories:",
                categories
            });
        }

        // ================= ORDER QUERY =================
        if (intent.intent === "order_query") {
            const order = await getOrder(intent.order_id);

            if (!order) {
                return res.json({
                    message: "Sorry, I couldn't find that order. Please check the order ID and try again."
                });
            }

            const field = intent.requested_field;

            if (field === "totalAmount") {
                return res.json({
                    message: `The total payment for this order is ₹${order.totalAmount}.`
                });
            }

            if (field === "status") {
                return res.json({
                    message: `Your order is currently: ${order.status}.`
                });
            }

            if (field === "paymentStatus") {
                return res.json({
                    message: `Payment status: ${order.paymentStatus}.`
                });
            }

            if (field === "trackingNumber") {
                return res.json({
                    message: order.trackingNumber
                        ? `Your tracking number is: ${order.trackingNumber}`
                        : "Tracking number is not available yet. Please check back later."
                });
            }

            if (field === "address") {
                const a = order.address;
                return res.json({
                    message: `Delivery address: ${a.street}, ${a.city}, ${a.state}, ${a.country}`
                });
            }

            if (field === "items") {
                // FIX: items.product is populated, so use i.product?.name with fallback to i.name
                const itemsList = order.items
                    .map(i => {
                        const name = i.product?.name || i.name || "Unknown item";
                        return `${name} (Qty: ${i.quantity})`;
                    })
                    .join(", ");

                return res.json({
                    message: `Items in your order: ${itemsList}`
                });
            }

            // Default order summary
            return res.json({
                message: `Order status: ${order.status}. Total: ₹${order.totalAmount}.`
            });
        }

        // ================= GENERAL CHAT =================
        const reply = await askResponse(userMessage);
        return res.json({ message: reply });

    } catch (err) {
        console.error("Chatbot Error:", err);
        return res.status(500).json({ message: "Something went wrong. Please try again." });
    }
};

module.exports = { chatbotHandler };