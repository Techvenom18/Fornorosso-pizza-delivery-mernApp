const crypto = require('crypto');
const razorpayInstance = require('../config/razorpay');
const Order = require('../models/Order');
const InventoryItem = require('../models/InventoryItem');

// Checks whether real Razorpay test keys are configured, or if we're still using placeholders.
const isRazorpayConfigured = () => {
  const keyId = process.env.RAZORPAY_KEY_ID || '';
  return keyId.startsWith('rzp_test_') && !keyId.includes('xxxx') && !keyId.includes('placeholder');
};

// @route  POST /api/payments/create
// Creates a Razorpay order (payment session) for an existing order in our DB.
// Falls back to a mock payment session if real Razorpay keys aren't configured yet.
const createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'This order does not belong to you' });
    }
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'This order has already been paid' });
    }

    // MOCK MODE: real Razorpay keys not yet configured (e.g. KYC/PAN verification pending).
    // Simulates a payment session so the rest of the app flow can still be built and demoed.
    if (!isRazorpayConfigured()) {
      const mockOrderId = `mock_order_${order._id}`;
      order.razorpayOrderId = mockOrderId;
      await order.save();

      return res.json({
        mock: true,
        razorpayOrderId: mockOrderId,
        amount: order.totalPrice * 100,
        currency: 'INR',
        keyId: 'mock_key',
        message: 'Running in mock payment mode - Razorpay test keys not yet configured',
      });
    }

    // REAL MODE: actual Razorpay API call
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: order.totalPrice * 100,
      currency: 'INR',
      receipt: order._id.toString(),
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return res.json({
      mock: false,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('PAYMENT CREATE ERROR:', err);
    return res.status(500).json({ message: 'Failed to create payment order', error: err.message });
  }
};

// @route  POST /api/payments/verify
// Verifies a REAL Razorpay payment signature. Only used when Razorpay is actually configured.
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed - signature mismatch' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.paymentStatus = 'paid';
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    await decrementStock(order);

    return res.json({ message: 'Payment verified successfully', order });
  } catch (err) {
    console.error('PAYMENT VERIFY ERROR:', err);
    return res.status(500).json({ message: 'Payment verification failed', error: err.message });
  }
};

// @route  POST /api/payments/mock-verify
// Simulates a successful payment for orders created in mock mode.
// Only works on orders that actually went through mock mode (safety check),
// so this can't be used to bypass payment on a real Razorpay order.
const mockVerifyPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'This order does not belong to you' });
    }
    if (!order.razorpayOrderId || !order.razorpayOrderId.startsWith('mock_order_')) {
      return res.status(400).json({ message: 'This order was not created in mock mode' });
    }
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'This order has already been paid' });
    }

    order.paymentStatus = 'paid';
    order.razorpayPaymentId = `mock_payment_${Date.now()}`;
    await order.save();

    await decrementStock(order);

    return res.json({ message: 'Mock payment verified successfully', order });
  } catch (err) {
    console.error('MOCK PAYMENT VERIFY ERROR:', err);
    return res.status(500).json({ message: 'Mock payment verification failed', error: err.message });
  }
};

// Shared helper: decrements stock for every ingredient in the order. Used by both
// real and mock payment verification, so stock logic stays in exactly one place.
const decrementStock = async (order) => {
  const allItemIds = [
    order.pizza.base,
    order.pizza.sauce,
    order.pizza.cheese,
    ...order.pizza.vegetables,
  ];

  await InventoryItem.updateMany(
    { _id: { $in: allItemIds } },
    { $inc: { stock: -1 } }
  );
};

module.exports = { createPaymentOrder, verifyPayment, mockVerifyPayment };