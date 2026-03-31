const cron = require("node-cron");
const calculateTopSellers = require("../Utils/calculateTopSellers");
const SubOrder = require("../Models/SubOrder.Model");
const Product = require("../Models/Product.Model");

const initTopSellerCron = () => {
  const runForAllCategories = async () => {
    try {
        console.log("Starting hourly Top Sellers calculation...");
        // 1. Compute for global (All)
        await calculateTopSellers();
  
        // 2. Compute per category found in recent sub-orders
        const categories = await SubOrder.distinct("items.category");
        
        // 3. Alternatively, get all unique categories from Products if recently used is empty
        let activeCategories = categories.filter(c => !!c);
        if (activeCategories.length === 0) {
            const productCategories = await Product.distinct("category");
            activeCategories = productCategories.filter(c => !!c);
        }

        for (const cat of activeCategories) {
             await calculateTopSellers(cat);
        }
        console.log("Hourly Top Sellers calculation completed successfully.");
    } catch (err) {
        console.error("Hourly calculation failed:", err);
    }
  }

  // Run automatically when the app starts
  setTimeout(() => {
    runForAllCategories();
  }, 5000); 

  // Run every 1 hour
  cron.schedule("0 * * * *", runForAllCategories);
};

module.exports = initTopSellerCron;
