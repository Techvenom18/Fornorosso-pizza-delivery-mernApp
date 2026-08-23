const COLORS = ['#ff4b3e', '#ff9f43', '#ffc93c', '#2ec4b6', '#9b5de5', '#ff6b9d'];
const hashName = (name) => (name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

// Shared avatar - shows the user's uploaded image if present, otherwise a
// colored circle with their first initial. `size` controls diameter in px.
const Avatar = ({ name, imageUrl, size = 40, onClick, className = '' }) => {
  const initials = (name || '?')[0]?.toUpperCase();
  const color = COLORS[hashName(name) % COLORS.length];

  const style = {
    width: size,
    height: size,
    fontSize: size * 0.42,
  };

  if (imageUrl) {
    return (
      <div className={`avatar-img-wrap ${className}`} style={style} onClick={onClick}>
        <img src={imageUrl} alt={name} />
      </div>
    );
  }

  return (
    <div className={`avatar ${className}`} style={{ ...style, background: color }} onClick={onClick}>
      {initials}
    </div>
  );
};

export default Avatar;