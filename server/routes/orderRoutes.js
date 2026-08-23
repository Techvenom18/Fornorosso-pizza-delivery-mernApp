const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, cancelOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.delete('/:id', protect, cancelOrder);

module.exports = router;