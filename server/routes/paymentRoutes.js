const express = require('express');
const router = express.Router();
const { createPaymentOrder, verifyPayment, mockVerifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/create', protect, createPaymentOrder);
router.post('/verify', protect, verifyPayment);
router.post('/mock-verify', protect, mockVerifyPayment);

module.exports = router;