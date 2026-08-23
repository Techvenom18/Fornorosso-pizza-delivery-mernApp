import { useState, useEffect } from 'react';

const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Pune', 'Hyderabad', 'Chennai', 'Jaipur'];
const PIZZAS = ['Margherita Classic', 'Garden Veggie', 'Spicy Fiesta', 'a custom build'];

const randomMessage = () => {
  const city = CITIES[Math.floor(Math.random() * CITIES.length)];
  const pizza = PIZZAS[Math.floor(Math.random() * PIZZAS.length)];
  return `Someone in ${city} just ordered ${pizza} 🍕`;
};

const OrderTicker = () => {
  const [message, setMessage] = useState(randomMessage());
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMessage(randomMessage());
        setVisible(true);
      }, 400);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="order-ticker">
      <span className={`order-ticker-text ${visible ? 'visible' : ''}`}>{message}</span>
    </div>
  );
};

export default OrderTicker;