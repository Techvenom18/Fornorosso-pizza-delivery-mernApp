const Order = require('../models/Order');
const InventoryItem = require('../models/InventoryItem');

// @route  POST /api/orders
// Creates a new order from the user's pizza selections and calculates the total price.
// This is the "order summary" step - happens BEFORE payment.
const createOrder = async (req, res) => {
  try {
    const { baseId, sauceId, cheeseId, vegetableIds, quantity, addons } = req.body;

    if (!baseId || !sauceId || !cheeseId) {
      return res.status(400).json({ message: 'Base, sauce, and cheese are required' });
    }

    const qty = Number(quantity) > 0 ? Number(quantity) : 1;
    const selectedAddons = Array.isArray(addons) ? addons : [];

    const allIds = [baseId, sauceId, cheeseId, ...(vegetableIds || [])];
    const items = await InventoryItem.find({ _id: { $in: allIds } });

    if (items.length !== allIds.length) {
      return res.status(400).json({ message: 'One or more selected ingredients no longer exist' });
    }

    const outOfStock = items.find((item) => item.stock <= 0);
    if (outOfStock) {
      return res.status(409).json({ message: `${outOfStock.name} is currently out of stock` });
    }

    const pizzaPrice = items.reduce((sum, item) => sum + item.price, 0);
    const addonsPrice = selectedAddons.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
    const totalPrice = pizzaPrice * qty + addonsPrice;

    const order = await Order.create({
      user: req.user._id,
      pizza: {
        base: baseId,
        sauce: sauceId,
        cheese: cheeseId,
        vegetables: vegetableIds || [],
      },
      quantity: qty,
      addons: selectedAddons,
      totalPrice,
      status: 'Order Received',
      paymentStatus: 'pending',
    });

    return res.status(201).json({ message: 'Order created', order });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create order', error: err.message });
  }
};

// @route  GET /api/orders/my
// Returns the logged-in user's orders, most recent first - powers their dashboard.
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('pizza.base pizza.sauce pizza.cheese pizza.vegetables', 'name');

    return res.json(orders);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
};

// @route  DELETE /api/orders/:id
// Only allows cancelling orders that haven't been paid yet - once paid,
// stock has already been decremented and the kitchen may be preparing it.
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Paid orders cannot be cancelled from here' });
    }
    await order.deleteOne();
    return res.json({ message: 'Order cancelled' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to cancel order', error: err.message });
  }
};

module.exports = { createOrder, getMyOrders, cancelOrder };