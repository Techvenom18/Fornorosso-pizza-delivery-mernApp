const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    summary: {
      type: String, // short human-readable description, e.g. "Thin Crust · Classic Tomato · Mozzarella"
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Receipt', receiptSchema);