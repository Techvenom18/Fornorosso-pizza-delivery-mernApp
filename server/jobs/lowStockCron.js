const cron = require('node-cron');
const InventoryItem = require('../models/InventoryItem');
const sendEmail = require('../config/mailer');

// Runs every hour, on the hour. Cron format: minute hour day month weekday
// '0 * * * *' = at minute 0 of every hour
const startLowStockJob = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('[cron] Running low stock check...');

      // Find every item where current stock has fallen at or below its own threshold
      const lowStockItems = await InventoryItem.find({
        $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      });

      if (lowStockItems.length === 0) {
        console.log('[cron] No low stock items found.');
        return;
      }

      const itemListHtml = lowStockItems
        .map((item) => `<li>${item.name} (${item.type}) - ${item.stock} units left</li>`)
        .join('');

      await sendEmail({
        to: process.env.ADMIN_ALERT_EMAIL,
        subject: `Low Stock Alert - ${lowStockItems.length} item(s) need restocking`,
        html: `<p>The following items are running low:</p><ul>${itemListHtml}</ul>`,
      });

      console.log(`[cron] Low stock alert sent for ${lowStockItems.length} item(s).`);
    } catch (err) {
      console.error('[cron] Low stock check failed:', err.message);
    }
  });

  console.log('[cron] Low stock monitoring job scheduled (runs hourly).');
};

module.exports = startLowStockJob;