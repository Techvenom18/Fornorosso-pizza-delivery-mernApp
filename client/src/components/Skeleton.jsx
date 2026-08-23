// Reusable shimmering placeholder blocks, shown while data is loading.
export const SkeletonBlock = ({ width = '100%', height = 16, style = {} }) => (
  <div className="skeleton-block" style={{ width, height, ...style }} />
);

// A whole placeholder ingredient card, matching the real card's shape
export const SkeletonIngredientCard = () => (
  <div className="ingredient-card skeleton-card">
    <SkeletonBlock width={16} height={16} style={{ borderRadius: '50%' }} />
    <SkeletonBlock width={70} height={14} />
  </div>
);

// A whole placeholder order card, matching the real order card's shape
export const SkeletonOrderCard = () => (
  <div className="order-card">
    <SkeletonBlock width="80%" height={14} style={{ marginBottom: 10 }} />
    <SkeletonBlock width="55%" height={14} style={{ marginBottom: 10 }} />
    <SkeletonBlock width="40%" height={14} style={{ marginBottom: 14 }} />
    <SkeletonBlock width="100%" height={30} style={{ borderRadius: 20 }} />
  </div>
);