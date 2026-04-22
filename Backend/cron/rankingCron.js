const cron = require("node-cron");
const { rankAllProducts } = require("../Services/RankingService");

/**
 * Initializes the Ranking Cron Job
 * Runs every hour (0 * * * *)
 */
const startRankingCron = () => {
    cron.schedule("0 * * * *", async () => {
        console.log(`[RANKING CRON] Started at ${new Date().toISOString()}`);
        await rankAllProducts();
        console.log(`[RANKING CRON] Finished at ${new Date().toISOString()}`);
    });
    console.log("[RANKING CRON] Product ranking job initialized (Running hourly).");
};

module.exports = startRankingCron;
