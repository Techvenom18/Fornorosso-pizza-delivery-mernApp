const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pizza: {
      base: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InventoryItem',
        required: true,
      },
      sauce: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InventoryItem',
        required: true,
      },
      cheese: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InventoryItem',
        required: true,
      },
      vegetables: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'InventoryItem',
        },
      ],
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    addons: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Order Received', 'In Kitchen', 'Sent to Delivery'],
      default: 'Order Received',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);