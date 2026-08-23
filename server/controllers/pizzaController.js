const InventoryItem = require('../models/InventoryItem');

// @route  GET /api/pizza/options
// Returns all available ingredients, grouped by type, for the pizza builder UI.
// Only shows items with stock > 0 so users can't select something that's out.
const getPizzaOptions = async (req, res) => {
  try {
    const items = await InventoryItem.find({ stock: { $gt: 0 } });

    const grouped = {
      bases: items.filter((item) => item.type === 'base'),
      sauces: items.filter((item) => item.type === 'sauce'),
      cheeses: items.filter((item) => item.type === 'cheese'),
      vegetables: items.filter((item) => item.type === 'vegetable'),
    };

    return res.json(grouped);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch pizza options', error: err.message });
  }
};

module.exports = { getPizzaOptions };