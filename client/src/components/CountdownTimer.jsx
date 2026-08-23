import { useState, useEffect } from 'react';
import { getMsUntilMidnightIST } from '../data/offers';

const formatDuration = (ms) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
};

// Live countdown to midnight IST, when today's offer rotates to the next one.
const CountdownTimer = () => {
  const [remaining, setRemaining] = useState(getMsUntilMidnightIST());

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(getMsUntilMidnightIST());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { hours, minutes, seconds } = formatDuration(remaining);
  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="countdown">
      <div className="countdown-unit">
        <span className="countdown-num">{pad(hours)}</span>
        <span className="countdown-label">HRS</span>
      </div>
      <span className="countdown-colon">:</span>
      <div className="countdown-unit">
        <span className="countdown-num">{pad(minutes)}</span>
        <span className="countdown-label">MIN</span>
      </div>
      <span className="countdown-colon">:</span>
      <div className="countdown-unit">
        <span className="countdown-num">{pad(seconds)}</span>
        <span className="countdown-label">SEC</span>
      </div>
    </div>
  );
};

export default CountdownTimer;