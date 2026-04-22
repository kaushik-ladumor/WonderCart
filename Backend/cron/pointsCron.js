const cron = require('node-cron');
const { expirePoints } = require('../Services/GamificationService');

/**
 * Initializes the Points Expiry Cron Job
 * Runs every day at 00:00 (Midnight)
 */
const startPointsCron = () => {
    cron.schedule('0 0 * * *', async () => {
        console.log('[POINTS CRON] Starting daily point expiry check...');
        try {
            await expirePoints();
        } catch (error) {
            console.error('[POINTS CRON] Error during point expiry execution:', error.message);
        }
    });

    console.log('[POINTS CRON] Reward points expiry job initialized (Running daily at midnight).');
};

module.exports = startPointsCron;
