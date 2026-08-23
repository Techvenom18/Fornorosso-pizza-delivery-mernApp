const Subscriber = require('../models/Subscriber');
const sendEmail = require('../config/mailer');
const { getTodaysOffer } = require('../config/dailyOffers');
const { offerEmailHtml } = require('../config/emailTemplates');

// @route  POST /api/subscribers
// Subscribes an email and immediately sends today's offer as a welcome email.
const subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const existing = await Subscriber.findOne({ email });
    if (!existing) {
      await Subscriber.create({ email });
    }

    const offer = getTodaysOffer();
    await sendEmail({
      to: email,
      subject: `Today's Offer at FornoRosso: ${offer}`,
      html: offerEmailHtml(offer, email),
    });

    return res.status(201).json({ message: 'Subscribed! Check your inbox for today\'s offer.' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to subscribe', error: err.message });
  }
};

module.exports = { subscribe };