const cron = require('node-cron');
const Deal = require('../Models/Deal.js');

const startDealCron = () => {
    // Job 1 — runs every minute: Find all deals where status === 'approved' AND startTime <= now -> Update to 'live'
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            const result = await Deal.updateMany(
                { status: 'approved', startTime: { $lte: now } },
                { $set: { status: 'live' } }
            );

            if (result.modifiedCount > 0) {
                console.log(`[DEAL CRON] ${result.modifiedCount} deals went live.`);
            }
        } catch (error) {
            console.error('[DEAL CRON] Error in Job 1:', error.message);
        }
    });

    // Job 2 — runs every minute: Find all deals where status === 'live' AND (endTime <= now OR claimedCount >= stockLimit) -> Update to 'expired'
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            const result = await Deal.updateMany(
                {
                    status: 'live',
                    $or: [
                        { endTime: { $lte: now } },
                        { $expr: { $gte: ['$claimedCount', '$stockLimit'] } }
                    ]
                },
                { $set: { status: 'expired' } }
            );

            if (result.modifiedCount > 0) {
                console.log(`[DEAL CRON] ${result.modifiedCount} deals expired.`);
            }
        } catch (error) {
            console.error('[DEAL CRON] Error in Job 2:', error.message);
        }
    });

    console.log('[DEAL CRON] Cron jobs initialized successfully.');
};

module.exports = startDealCron;
