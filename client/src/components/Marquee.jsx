// Auto-scrolling horizontal strip. Content is duplicated so the loop is seamless.
// Pauses on hover/touch (CSS-driven), and remains manually scrollable via
// touchpad/trackpad since it's a real horizontally-scrollable container.
const Marquee = ({ items, renderItem, direction = 'left', duration = 32 }) => {
  return (
    <div className="marquee">
      <div
        className="marquee-track"
        style={{
          animationDirection: direction === 'right' ? 'reverse' : 'normal',
          animationDuration: `${duration}s`,
        }}
      >
        {items.map((item, i) => (
          <div className="marquee-item" key={`a-${i}`}>{renderItem(item, i)}</div>
        ))}
        {items.map((item, i) => (
          <div className="marquee-item" key={`b-${i}`}>{renderItem(item, i)}</div>
        ))}
      </div>
    </div>
  );
};

export default Marquee;