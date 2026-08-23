const InventoryItem = require('../models/InventoryItem');
const Order = require('../models/Order');

// @route  GET /api/admin/inventory
// Returns all inventory items, regardless of stock level (unlike the public /pizza/options endpoint)
const getInventory = async (req, res) => {
  try {
    const items = await InventoryItem.find().sort({ type: 1, name: 1 });
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch inventory', error: err.message });
  }
};

// @route  PATCH /api/admin/inventory/:id
// Manually update the stock level for a single item.
const updateStock = async (req, res) => {
  try {
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
      return res.status(400).json({ message: 'A valid, non-negative stock value is required' });
    }

    const item = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      { stock },
      { new: true } // return the updated document, not the old one
    );

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    return res.json({ message: 'Stock updated', item });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update stock', error: err.message });
  }
};

// @route  GET /api/admin/orders
// Returns ALL orders across all users, most recent first - the order management panel.
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate('pizza.base pizza.sauce pizza.cheese pizza.vegetables', 'name');

    return res.json(orders);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
};

// @route  PATCH /api/admin/orders/:id/status
// Updates an order's status - this is what the user's dashboard will poll and reflect.
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Order Received', 'In Kitchen', 'Sent to Delivery'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.json({ message: 'Order status updated', order });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update order status', error: err.message });
  }
};

module.exports = { getInventory, updateStock, getAllOrders, updateOrderStatus };