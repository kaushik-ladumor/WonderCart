const { askResponse } = require("./AiModel");

const userInput = async (message) => {

    const prompt = `
You are WonderCart ecommerce AI intent classifier.

VERY IMPORTANT:
Return ONLY valid JSON.
NO explanation.
NO markdown.
NO text outside JSON.

Format:
{
  "intent": "",
  "order_id": "",
  "category": "",
  "max_price": "",
  "requested_field": ""
}

Intent values:
- "search_product"   → user wants to find/browse products
- "list_categories"  → user wants to see all categories
- "order_query"      → user asks about a specific order
- "general_question" → anything else

requested_field values (only for order_query):
- "totalAmount"     → asking about price / total / cost / payment
- "status"          → asking about order status / where is my order
- "paymentStatus"   → asking about payment status / paid or not
- "trackingNumber"  → asking about tracking / shipment tracking
- "address"         → asking about delivery address / shipping address
- "items"           → asking about items / products in the order

Examples:

User: show me red shoes under 500
Output:
{"intent":"search_product","order_id":"","category":"shoes","max_price":"500","requested_field":""}

User: what categories do you have?
Output:
{"intent":"list_categories","order_id":"","category":"","max_price":"","requested_field":""}

User: total payment for order 683abc
Output:
{"intent":"order_query","order_id":"683abc","category":"","max_price":"","requested_field":"totalAmount"}

User: is order 999xyz delivered?
Output:
{"intent":"order_query","order_id":"999xyz","category":"","max_price":"","requested_field":"status"}

User: tracking number for order 111aaa
Output:
{"intent":"order_query","order_id":"111aaa","category":"","max_price":"","requested_field":"trackingNumber"}

User: what items are in order 222bbb
Output:
{"intent":"order_query","order_id":"222bbb","category":"","max_price":"","requested_field":"items"}

User: what is the delivery address for order 333ccc
Output:
{"intent":"order_query","order_id":"333ccc","category":"","max_price":"","requested_field":"address"}

User: has order 444ddd been paid?
Output:
{"intent":"order_query","order_id":"444ddd","category":"","max_price":"","requested_field":"paymentStatus"}

User message: ${message}
`;

    const res = await askResponse(prompt);

    try {
        const clean = res.replace(/```json|```/g, "").trim();
        return JSON.parse(clean);
    } catch (err) {
        console.log("Intent parse failed:", res);
        return { intent: "general_question" };
    }

};

module.exports = { userInput };