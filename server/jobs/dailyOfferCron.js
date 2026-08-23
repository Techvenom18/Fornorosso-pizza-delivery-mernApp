const cron = require('node-cron');
const Subscriber = require('../models/Subscriber');
const sendEmail = require('../config/mailer');
const { getTodaysOffer } = require('../config/dailyOffers');
const { offerEmailHtml } = require('../config/emailTemplates');

// Runs once a day, right after midnight IST, emailing every subscriber that
// day's rotating offer automatically - no manual triggering needed.
const startDailyOfferJob = () => {
  // '1 0 * * *' = at 00:01 every day (server's local time - see note below)
  cron.schedule('1 0 * * *', async () => {
    try {
      console.log('[cron] Sending daily offer emails...');
      const subscribers = await Subscriber.find();
      if (subscribers.length === 0) {
        console.log('[cron] No subscribers to email.');
        return;
      }

    const offer = getTodaysOffer();
      for (const sub of subscribers) {
        await sendEmail({
          to: sub.email,
          subject: `Today's Offer at FornoRosso: ${offer}`,
          html: offerEmailHtml(offer, sub.email),
        });
      }
      console.log(`[cron] Daily offer email sent to ${subscribers.length} subscriber(s).`);
    } catch (err) {
      console.error('[cron] Daily offer email job failed:', err.message);
    }
  });

  console.log('[cron] Daily offer email job scheduled (runs once daily).');
};

module.exports = startDailyOfferJob;