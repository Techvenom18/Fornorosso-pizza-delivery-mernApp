import { useState, useEffect } from 'react';

// Cycles through a list of messages every `interval` ms, with a fade transition.
const LoopingStat = ({ messages, interval = 2600 }) => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % messages.length);
        setVisible(true);
      }, 300);
    }, interval);
    return () => clearInterval(timer);
  }, [messages, interval]);

  return (
    <span className={`looping-stat-text ${visible ? 'visible' : ''}`}>
      {messages[index]}
    </span>
  );
};

export default LoopingStat;