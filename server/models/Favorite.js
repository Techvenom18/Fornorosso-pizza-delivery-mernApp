const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    base: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
    sauce: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
    cheese: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
    vegetables: [{ type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Favorite', favoriteSchema);