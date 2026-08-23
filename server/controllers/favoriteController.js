const Favorite = require('../models/Favorite');

// @route  POST /api/favorites
const saveFavorite = async (req, res) => {
  try {
    const { name, baseId, sauceId, cheeseId, vegetableIds } = req.body;

    if (!name || !baseId || !sauceId || !cheeseId) {
      return res.status(400).json({ message: 'Name, base, sauce, and cheese are required' });
    }

    const favorite = await Favorite.create({
      user: req.user._id,
      name,
      base: baseId,
      sauce: sauceId,
      cheese: cheeseId,
      vegetables: vegetableIds || [],
    });

    return res.status(201).json({ message: 'Favorite saved', favorite });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to save favorite', error: err.message });
  }
};

// @route  GET /api/favorites
const getMyFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('base sauce cheese vegetables', 'name price');

    return res.json(favorites);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch favorites', error: err.message });
  }
};

// @route  DELETE /api/favorites/:id
const deleteFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOne({ _id: req.params.id, user: req.user._id });
    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }
    await favorite.deleteOne();
    return res.json({ message: 'Favorite removed' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete favorite', error: err.message });
  }
};

module.exports = { saveFavorite, getMyFavorites, deleteFavorite };
