require('dotenv').config();
const mongoose = require('mongoose');
const InventoryItem = require('./models/InventoryItem');

const items = [
  // Bases (5 options, per task requirement)
  { name: 'Thin Crust', type: 'base', stock: 50, price: 120 },
  { name: 'Thick Crust', type: 'base', stock: 50, price: 130 },
  { name: 'Wheat Base', type: 'base', stock: 50, price: 140 },
  { name: 'Cheese Burst Base', type: 'base', stock: 50, price: 180 },
  { name: 'Gluten-Free Base', type: 'base', stock: 30, price: 160 },

  // Sauces (5 options)
  { name: 'Classic Tomato', type: 'sauce', stock: 50, price: 20 },
  { name: 'Pesto', type: 'sauce', stock: 50, price: 30 },
  { name: 'BBQ', type: 'sauce', stock: 50, price: 30 },
  { name: 'Alfredo', type: 'sauce', stock: 50, price: 35 },
  { name: 'Spicy Arrabbiata', type: 'sauce', stock: 50, price: 25 },

  // Cheese
  { name: 'Mozzarella', type: 'cheese', stock: 60, price: 40 },
  { name: 'Cheddar', type: 'cheese', stock: 60, price: 40 },
  { name: 'Vegan Cheese', type: 'cheese', stock: 30, price: 50 },

  // Vegetables (multi-select)
  { name: 'Mushroom', type: 'vegetable', stock: 40, price: 15 },
  { name: 'Onion', type: 'vegetable', stock: 40, price: 10 },
  { name: 'Bell Pepper', type: 'vegetable', stock: 40, price: 15 },
  { name: 'Olives', type: 'vegetable', stock: 40, price: 20 },
  { name: 'Sweet Corn', type: 'vegetable', stock: 40, price: 15 },
  { name: 'Jalapeno', type: 'vegetable', stock: 40, price: 15 },
  { name: 'Tomato', type: 'vegetable', stock: 40, price: 10 },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    await InventoryItem.deleteMany({});
    console.log('Cleared existing inventory items.');

    await InventoryItem.insertMany(items);
    console.log(`Seeded ${items.length} inventory items successfully.`);

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
};

seedDatabase();