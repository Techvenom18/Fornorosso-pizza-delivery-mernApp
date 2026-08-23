const express = require('express');
const router = express.Router();
const {
  getInventory,
  updateStock,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// Every route here requires both a valid login AND an admin role.
router.get('/inventory', protect, adminOnly, getInventory);
router.patch('/inventory/:id', protect, adminOnly, updateStock);
router.get('/orders', protect, adminOnly, getAllOrders);
router.patch('/orders/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;