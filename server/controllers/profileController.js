const User = require('../models/User');
const Order = require('../models/Order');
const Favorite = require('../models/Favorite');

// @route  GET /api/profile/stats
// Powers the "Total Orders / Spent / Favorites" cards on the Profile page.
const getProfileStats = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    const totalOrders = orders.length;
    const totalSpent = orders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.totalPrice, 0);
    const favoritesCount = await Favorite.countDocuments({ user: req.user._id });

    return res.json({ totalOrders, totalSpent, favoritesCount });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch profile stats', error: err.message });
  }
};

// @route  PATCH /api/profile
// Updates bio and/or location. Kept separate from auth routes since this is
// profile data, not credentials.
const updateProfile = async (req, res) => {
  try {
    const { bio, location, avatar } = req.body;

    const updates = {};
    if (bio !== undefined) updates.bio = bio;
    if (location !== undefined) updates.location = location;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');

    return res.json({ message: 'Profile updated', user });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
};

module.exports = { getProfileStats, updateProfile };