import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Shows a fixed bottom bar once the user scrolls past the hero section.
// Only meant to be visible on smaller screens (hidden on desktop via CSS).
const StickyOrderBar = () => {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`sticky-order-bar ${visible ? 'visible' : ''}`}>
      <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/register')}>
        🍕 Order Now
      </button>
    </div>
  );
};

export default StickyOrderBar;