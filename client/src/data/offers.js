// 31 rotating daily offers, shared by Landing and Login pages.
// Which one shows is based on the real day-of-month in IST, so it
// automatically changes once every 24 hours at midnight IST.
export const DAILY_OFFERS = [
  '🎉 Day 1 Special: 20% off your first order!',
  '🍕 Day 2: Buy 1 Get 1 on Margherita Classic',
  '🧀 Day 3: Free cheese upgrade on any order',
  '🥤 Day 4: Free drink with every combo',
  '🌶️ Day 5: 15% off Spicy Fiesta today only',
  '🍟 Day 6: Free fries on orders above ₹400',
  '🎂 Day 7: Weekend Special — flat ₹50 off',
  '🥗 Day 8: 10% off all veggie-topped pizzas',
  '🚴 Day 9: Free delivery, no minimum order',
  '🍬 Day 10: Free dessert with every order',
  '🔥 Day 11: Spicy lovers combo — 20% off',
  '🧑‍🍳 Day 12: Chef\'s pick discounted today',
  '🎁 Day 13: Surprise topping added free',
  '🍕 Day 14: Two-topping pizzas at flat ₹199',
  '🥤 Day 15: Free refill with dine-in style combo',
  '🌿 Day 16: 15% off all vegan builds',
  '🧀 Day 17: Extra cheese, zero extra cost',
  '🎉 Day 18: Mid-month madness — 25% off',
  '🍟 Day 19: Free sides on orders above ₹350',
  '🥗 Day 20: Garden Veggie at a special price',
  '🚴 Day 21: Priority delivery, free upgrade',
  '🍬 Day 22: Buy 2 pizzas, get dessert free',
  '🔥 Day 23: Fiesta Friday — 20% off spicy range',
  '🧑‍🍳 Day 24: Build your own, 10% off',
  '🎁 Day 25: Loyalty bonus — free topping',
  '🍕 Day 26: Four Cheese Delight at best price',
  '🥤 Day 27: Combo deals start at ₹249',
  '🌿 Day 28: Gluten-free base, no extra charge',
  '🧀 Day 29: Cheese burst upgrade, half price',
  '🎉 Day 30: Month-end blowout — 30% off',
  '🍕 Day 31: Bonus day special — flat ₹75 off',
];

export const getTodaysOffer = () => {
  const istNow = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
  );
  const dayOfMonth = istNow.getDate();
  return DAILY_OFFERS[(dayOfMonth - 1) % DAILY_OFFERS.length];
};

// Milliseconds remaining until midnight IST (when the offer rotates).
export const getMsUntilMidnightIST = () => {
  const istNow = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
  );
  const midnight = new Date(istNow);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - istNow.getTime();
};