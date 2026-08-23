// Backend copy of the 31 rotating daily offers, mirroring client/src/data/offers.js
// Kept in sync manually since frontend and backend are separate codebases.
const DAILY_OFFERS = [
  '20% off your first order!',
  'Buy 1 Get 1 on Margherita Classic',
  'Free cheese upgrade on any order',
  'Free drink with every combo',
  '15% off Spicy Fiesta today only',
  'Free fries on orders above Rs.400',
  'Weekend Special - flat Rs.50 off',
  '10% off all veggie-topped pizzas',
  'Free delivery, no minimum order',
  'Free dessert with every order',
  'Spicy lovers combo - 20% off',
  "Chef's pick discounted today",
  'Surprise topping added free',
  'Two-topping pizzas at flat Rs.199',
  'Free refill with dine-in style combo',
  '15% off all vegan builds',
  'Extra cheese, zero extra cost',
  'Mid-month madness - 25% off',
  'Free sides on orders above Rs.350',
  'Garden Veggie at a special price',
  'Priority delivery, free upgrade',
  'Buy 2 pizzas, get dessert free',
  'Fiesta Friday - 20% off spicy range',
  'Build your own, 10% off',
  'Loyalty bonus - free topping',
  'Four Cheese Delight at best price',
  'Combo deals start at Rs.249',
  'Gluten-free base, no extra charge',
  'Cheese burst upgrade, half price',
  'Month-end blowout - 30% off',
  'Bonus day special - flat Rs.75 off',
];

const getTodaysOffer = () => {
  const istNow = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
  );
  const dayOfMonth = istNow.getDate();
  return DAILY_OFFERS[(dayOfMonth - 1) % DAILY_OFFERS.length];
};

module.exports = { DAILY_OFFERS, getTodaysOffer };