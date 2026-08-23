const baseGradient = (name) => {
  if (!name) return ['#e8c98a', '#c9a05c'];
  if (name.includes('Wheat')) return ['#cfa568', '#a67d42'];
  if (name.includes('Thin')) return ['#f0d9a0', '#d4ac6a'];
  if (name.includes('Thick')) return ['#e8bd72', '#c2924a'];
  if (name.includes('Gluten')) return ['#ddc48f', '#b89960'];
  if (name.includes('Cheese Burst')) return ['#f7de91', '#dcae52'];
  return ['#e8c98a', '#c9a05c'];
};

const sauceColor = (name) => {
  if (!name) return null;
  if (name.includes('Pesto')) return '#5c7d43';
  if (name.includes('Alfredo')) return '#ece1c8';
  if (name.includes('BBQ')) return '#4a2c14';
  if (name.includes('Arrabbiata')) return '#b32e18';
  return '#c73b22';
};

const cheeseColor = (name) => {
  if (!name) return null;
  if (name.includes('Vegan')) return '#f0e2ac';
  if (name.includes('Cheddar')) return '#eeae3d';
  return '#fbe9a8';
};

const Topping = ({ type, x, y, rotation = 0, scale = 1 }) => {
  const g = `translate(${x} ${y}) rotate(${rotation}) scale(${scale})`;

  if (type.includes('Mushroom')) {
    return (
      <g transform={g}>
        <ellipse cx="0" cy="0" rx="8" ry="6" fill="#d9c7a3" stroke="#a68a5c" strokeWidth="1" />
        <path d="M -6 0 A 6 5 0 0 1 6 0 Z" fill="#c9b48a" opacity="0.6" />
        <line x1="-4" y1="1" x2="4" y2="1" stroke="#a68a5c" strokeWidth="0.6" />
        <line x1="-3" y1="3" x2="3" y2="3" stroke="#a68a5c" strokeWidth="0.6" />
      </g>
    );
  }
  if (type.includes('Onion')) {
    return (
      <g transform={g}>
        <path d="M -7 -3 A 7 4 0 0 1 7 -3" fill="none" stroke="#e0c8e8" strokeWidth="2.4" />
        <path d="M -5 1 A 5 3 0 0 1 5 1" fill="none" stroke="#c9a8d8" strokeWidth="2" />
      </g>
    );
  }
  if (type.includes('Bell Pepper')) {
    return (
      <g transform={g}>
        <rect x="-8" y="-3" width="16" height="6" rx="3" fill="none" stroke="#3fae4a" strokeWidth="2.4" />
      </g>
    );
  }
  if (type.includes('Olive')) {
    return (
      <g transform={g}>
        <circle r="5" fill="#2b2118" />
        <circle r="2" fill="#c73b22" opacity="0.4" />
      </g>
    );
  }
  if (type.includes('Corn')) {
    return (
      <g transform={g}>
        {[-4, 0, 4].map((dx) => (
          <ellipse key={dx} cx={dx} cy="0" rx="2" ry="3" fill="#f2c94c" stroke="#c99a2e" strokeWidth="0.5" />
        ))}
      </g>
    );
  }
  if (type.includes('Jalapeno')) {
    return (
      <g transform={g}>
        <rect x="-7" y="-2.5" width="14" height="5" rx="2.5" fill="none" stroke="#5ba832" strokeWidth="2.2" />
        <circle cx="0" cy="0" r="1.3" fill="#dfe8c8" />
      </g>
    );
  }
  if (type.includes('Tomato')) {
    return (
      <g transform={g}>
        <circle r="6.5" fill="#d2452a" opacity="0.85" />
        <circle cx="-2" cy="-1" r="0.9" fill="#f5d9b0" />
        <circle cx="2" cy="1.5" r="0.9" fill="#f5d9b0" />
        <circle cx="1" cy="-2.5" r="0.7" fill="#f5d9b0" />
      </g>
    );
  }
  return <circle cx={x} cy={y} r="5" fill="#999" />;
};

const scatterPoints = (count, cx, cy, radius, seedOffset = 0) => {
  const points = [];
  const goldenAngle = 137.5 * (Math.PI / 180);
  for (let i = 0; i < count; i++) {
    const idx = i + seedOffset;
    const r = radius * Math.sqrt((idx + 0.5) / (count + seedOffset));
    const angle = idx * goldenAngle;
    points.push([
      cx + r * Math.cos(angle),
      cy + r * Math.sin(angle),
      (angle * 180) / Math.PI,
    ]);
  }
  return points;
};

const CENTER_X = 110;
const CENTER_Y = 112;

const PizzaPreview = ({ baseName, sauceName, cheeseName, vegetableNames }) => {
  const [baseOuter, baseInner] = baseGradient(baseName);
  const sauce = sauceColor(sauceName);
  const cheese = cheeseColor(cheeseName);

  const toppingInstances = vegetableNames.flatMap((name, typeIndex) => {
    const count = vegetableNames.length <= 2 ? 7 : vegetableNames.length <= 4 ? 5 : 4;
    const points = scatterPoints(count, CENTER_X, CENTER_Y, 62, typeIndex * 3);
    return points.map(([x, y, angle], i) => ({
      key: `${name}-${i}`,
      type: name,
      x,
      y,
      rotation: angle,
      scale: 0.9 + ((i + typeIndex) % 3) * 0.12,
    }));
  });

  return (
    <svg viewBox="0 0 220 224" style={{ width: '100%', maxWidth: 260, margin: '0 auto', display: 'block' }}>
      <defs>
        <radialGradient id="crustGrad" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor={baseOuter} />
          <stop offset="100%" stopColor={baseInner} />
        </radialGradient>
        <radialGradient id="boardGrad" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#a06f3f" />
          <stop offset="100%" stopColor="#7a4f28" />
        </radialGradient>
        <filter id="dropShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000" floodOpacity="0.35" />
        </filter>
      </defs>

      <g opacity="0.35" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round">
        <path d="M 80 22 Q 74 12 80 4">
          <animate attributeName="d" dur="3s" repeatCount="indefinite"
            values="M 80 22 Q 74 12 80 4; M 80 22 Q 86 12 80 4; M 80 22 Q 74 12 80 4" />
        </path>
        <path d="M 135 18 Q 129 8 135 0">
          <animate attributeName="d" dur="3.4s" repeatCount="indefinite"
            values="M 135 18 Q 129 8 135 0; M 135 18 Q 141 8 135 0; M 135 18 Q 129 8 135 0" />
        </path>
      </g>

      {/* Square wooden board with rounded corners */}
      <rect
        x={CENTER_X - 100}
        y={CENTER_Y - 100}
        width="200"
        height="200"
        rx="22"
        fill="url(#boardGrad)"
        filter="url(#dropShadow)"
      />

      {/* Wood grain lines */}
      <g stroke="#6b4520" strokeWidth="1" opacity="0.25">
        <line x1={CENTER_X - 95} y1={CENTER_Y - 70} x2={CENTER_X + 95} y2={CENTER_Y - 70} />
        <line x1={CENTER_X - 95} y1={CENTER_Y - 40} x2={CENTER_X + 95} y2={CENTER_Y - 40} />
        <line x1={CENTER_X - 95} y1={CENTER_Y + 45} x2={CENTER_X + 95} y2={CENTER_Y + 45} />
        <line x1={CENTER_X - 95} y1={CENTER_Y + 75} x2={CENTER_X + 95} y2={CENTER_Y + 75} />
      </g>

      <circle cx={CENTER_X} cy={CENTER_Y} r="92" fill="url(#crustGrad)" stroke="#96683a" strokeWidth="3" />

      <g fill="#96683a" opacity="0.5">
        {scatterPoints(14, CENTER_X, CENTER_Y, 84).map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2" />
        ))}
      </g>

      {sauce && (
        <>
          <circle cx={CENTER_X} cy={CENTER_Y} r="76" fill={sauce} opacity="0.92" />
          <circle cx={CENTER_X - 4} cy={CENTER_Y - 4} r="74" fill={sauce} opacity="0.5" />
        </>
      )}

      {cheese && (
        <g opacity="0.9">
          <circle cx={CENTER_X} cy={CENTER_Y} r="70" fill={cheese} />
          <circle cx={CENTER_X - 20} cy={CENTER_Y - 20} r="18" fill={cheese} opacity="0.7" />
          <circle cx={CENTER_X + 25} cy={CENTER_Y + 20} r="20" fill={cheese} opacity="0.7" />
          <circle cx={CENTER_X + 30} cy={CENTER_Y - 30} r="14" fill={cheese} opacity="0.6" />
          <circle cx={CENTER_X - 30} cy={CENTER_Y + 25} r="16" fill={cheese} opacity="0.6" />
          <g fill="#c9871f" opacity="0.35">
            <ellipse cx={CENTER_X - 15} cy={CENTER_Y - 25} rx="4" ry="3" />
            <ellipse cx={CENTER_X + 20} cy={CENTER_Y - 15} rx="3" ry="4" />
            <ellipse cx={CENTER_X + 5} cy={CENTER_Y + 30} rx="4" ry="3" />
            <ellipse cx={CENTER_X - 30} cy={CENTER_Y + 10} rx="3" ry="3" />
          </g>
        </g>
      )}

      {toppingInstances.map((t) => (
        <Topping key={t.key} type={t.type} x={t.x} y={t.y} rotation={t.rotation} scale={t.scale} />
      ))}

      <g stroke="#00000018" strokeWidth="1.2">
        <line x1={CENTER_X} y1={CENTER_Y - 90} x2={CENTER_X} y2={CENTER_Y + 90} />
        <line x1={CENTER_X - 90} y1={CENTER_Y} x2={CENTER_X + 90} y2={CENTER_Y} />
        <line x1={CENTER_X - 63} y1={CENTER_Y - 63} x2={CENTER_X + 63} y2={CENTER_Y + 63} />
        <line x1={CENTER_X + 63} y1={CENTER_Y - 63} x2={CENTER_X - 63} y2={CENTER_Y + 63} />
      </g>
    </svg>
  );
};

export default PizzaPreview;