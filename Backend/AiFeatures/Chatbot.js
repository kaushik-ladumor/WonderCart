const mongoose = require("mongoose");
const Product = require("../Models/Product.Model");
const MasterOrder = require("../Models/MasterOrder.Model");
const SubOrder = require("../Models/SubOrder.Model");
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
    if (!orderId) return null;

    // Try finding by MasterOrder first
    let order = await MasterOrder.findOne({
        $or: [
            { orderId: orderId.toUpperCase() },
            { _id: mongoose.Types.ObjectId.isValid(orderId) ? orderId : null }
        ].filter(Boolean)
    }).populate({
        path: "subOrders",
        populate: { path: "seller", select: "shopName" }
    });

    if (order) return { type: "master", data: order };

    // Try finding by SubOrder
    let subOrder = await SubOrder.findOne({
        $or: [
            { subOrderId: orderId.toUpperCase() },
            { _id: mongoose.Types.ObjectId.isValid(orderId) ? orderId : null }
        ].filter(Boolean)
    }).populate("masterOrder");

    if (subOrder) return { type: "sub", data: subOrder };

    return null;
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
            const result = await getOrder(intent.order_id);

            if (!result) {
                return res.json({
                    message: "Sorry, I couldn't find that order. Please check the order ID (e.g., ORD-1001) and try again."
                });
            }

            const { type, data } = result;
            const field = intent.requested_field;

            if (field === "totalAmount") {
                const amount = type === "master" ? data.totalAmount : data.subTotal + (data.shippingCost || 0);
                return res.json({
                    message: `The total payment for this ${type === "master" ? "order" : "package"} is ₹${amount}.`
                });
            }

            if (field === "status") {
                if (type === "sub") {
                    return res.json({ message: `Your package status is: ${data.status}.` });
                } else {
                    const statuses = data.subOrders.map(s => `${s.subOrderId}: ${s.status}`).join("; ");
                    return res.json({ message: `Order status summary: ${statuses}` });
                }
            }

            if (field === "paymentStatus") {
                return res.json({
                    message: `Payment status: ${data.paymentStatus}.`
                });
            }

            if (field === "trackingNumber") {
                if (type === "master") {
                    return res.json({ message: "This order contains multiple packages. Please ask for a specific sub-order (e.g., ORD-1001-A) to get its tracking number." });
                }
                return res.json({
                    message: data.trackingId
                        ? `Your tracking ID is: ${data.trackingId}`
                        : "Tracking ID is not available yet. Once the seller ships the item, it will show up here."
                });
            }

            if (field === "address") {
                const a = type === "master" ? data.address : data.masterOrder.address;
                return res.json({
                    message: `Delivery address: ${a.street}, ${a.city}, ${a.state}, ${a.country} (PIN: ${a.zipCode || a.zipcode})`
                });
            }

            if (field === "items") {
                const itemsList = data.items
                    .map(i => `${i.name || "Item"} (Qty: ${i.quantity})`)
                    .join(", ");

                return res.json({
                    message: `Items in this ${type === "master" ? "order" : "package"}: ${itemsList}`
                });
            }

            // Default order summary
            const summary = type === "master" 
                ? `Order ${data.orderId} status: ${data.paymentStatus}. Total: ₹${data.totalAmount}.`
                : `Package ${data.subOrderId} status: ${data.status}. Items: ${data.items.length}.`;
            
            return res.json({ message: summary });
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