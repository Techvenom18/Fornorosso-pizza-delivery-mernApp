const Receipt = require('../models/Receipt');

// @route  POST /api/receipts
// Called by the frontend right when a PDF receipt is generated/downloaded,
// so we keep a record of it for the "Downloaded Bills" history page.
const logReceipt = async (req, res) => {
  try {
    const { orderId, amount, summary } = req.body;
    if (!orderId || amount === undefined || !summary) {
      return res.status(400).json({ message: 'orderId, amount, and summary are required' });
    }

    const receipt = await Receipt.create({
      user: req.user._id,
      order: orderId,
      amount,
      summary,
    });

    return res.status(201).json({ message: 'Receipt logged', receipt });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to log receipt', error: err.message });
  }
};

// @route  GET /api/receipts
const getMyReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json(receipts);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch receipts', error: err.message });
  }
};

module.exports = { logReceipt, getMyReceipts };