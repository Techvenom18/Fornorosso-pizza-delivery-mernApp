import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSidebar } from '../context/SidebarContext';
import PizzaPreview from '../components/PizzaPreview';
import Avatar from '../components/Avatar';

const ADDONS = [
  { name: 'Coke (500ml)', price: 40 },
  { name: 'French Fries', price: 60 },
  { name: 'Garlic Bread', price: 70 },
  { name: 'Sweet Dice Dessert', price: 50 },
];

const SPICY_NAMES = ['Spicy Arrabbiata', 'Jalapeno'];
const POPULAR_NAMES = ['Thin Crust', 'Classic Tomato', 'Mozzarella', 'Onion'];

const Builder = () => {
  const [options, setOptions] = useState(null);
  const [baseId, setBaseId] = useState('');
  const [sauceId, setSauceId] = useState('');
  const [cheeseId, setCheeseId] = useState('');
  const [vegetableIds, setVegetableIds] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { openSidebar } = useSidebar();

    useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await API.get('/pizza/options');
        setOptions(res.data);

        // If we arrived here via "Order Again" from Dashboard, pre-fill the selections
        const reorder = location.state?.reorder;
        if (reorder) {
          setBaseId(reorder.baseId || '');
          setSauceId(reorder.sauceId || '');
          setCheeseId(reorder.cheeseId || '');
          setVegetableIds(reorder.vegetableIds || []);
          showToast('Loaded that order — adjust and place again', 'success');
        }
      } catch (err) {
        setError('Failed to load pizza options');
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await API.get('/favorites');
      setFavorites(res.data);
    } catch (err) {}
  };

  const fetchLastOrder = async () => {
    try {
      const res = await API.get('/orders/my');
      if (res.data.length > 0) setLastOrder(res.data[0]); // most recent, since backend sorts by createdAt desc
    } catch (err) {}
  };

  useEffect(() => {
    fetchFavorites();
    fetchLastOrder();
  }, []);

  const toggleVegetable = (id) => {
    setVegetableIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const toggleAddon = (addon) => {
    setSelectedAddons((prev) =>
      prev.some((a) => a.name === addon.name)
        ? prev.filter((a) => a.name !== addon.name)
        : [...prev, addon]
    );
  };

  const getSelectedNames = () => {
    if (!options) return { baseName: '', sauceName: '', cheeseName: '', vegNames: [] };
    const allItems = [...options.bases, ...options.sauces, ...options.cheeses, ...options.vegetables];
    const find = (id) => allItems.find((i) => i._id === id)?.name;
    return {
      baseName: find(baseId),
      sauceName: find(sauceId),
      cheeseName: find(cheeseId),
      vegNames: vegetableIds.map((id) => find(id)).filter(Boolean),
    };
  };

  const calculatePizzaPrice = () => {
    if (!options) return 0;
    const allItems = [...options.bases, ...options.sauces, ...options.cheeses, ...options.vegetables];
    const selectedIds = [baseId, sauceId, cheeseId, ...vegetableIds];
    return selectedIds.reduce((sum, id) => {
      const item = allItems.find((i) => i._id === id);
      return sum + (item ? item.price : 0);
    }, 0);
  };

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const grandTotal = calculatePizzaPrice() * quantity + addonsTotal;

  const getSpiceLevel = () => {
    const { sauceName, vegNames } = getSelectedNames();
    const spicyCount = [sauceName, ...vegNames].filter((n) => SPICY_NAMES.includes(n)).length;
    if (spicyCount >= 2) return { label: 'Spicy', className: 'spice-hot' };
    if (spicyCount === 1) return { label: 'Medium', className: 'spice-medium' };
    return { label: 'Mild', className: 'spice-mild' };
  };

  const estimateCalories = () => {
    // Rough, illustrative estimate only - not real nutrition data.
    let kcal = 0;
    if (baseId) kcal += 250;
    if (sauceId) kcal += 40;
    if (cheeseId) kcal += 180;
    kcal += vegetableIds.length * 20;
    kcal += selectedAddons.reduce((sum, a) => sum + (a.name.includes('Fries') ? 320 : a.name.includes('Coke') ? 180 : a.name.includes('Bread') ? 220 : 150), 0);
    return kcal * quantity;
  };

  const handleSurpriseMe = () => {
    if (!options) return;
    const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    setBaseId(randomFrom(options.bases)._id);
    setSauceId(randomFrom(options.sauces)._id);
    setCheeseId(randomFrom(options.cheeses)._id);
    const shuffledVeg = [...options.vegetables].sort(() => 0.5 - Math.random());
    const vegCount = Math.floor(Math.random() * 3) + 1;
    setVegetableIds(shuffledVeg.slice(0, vegCount).map((v) => v._id));
    showToast('Surprise combo loaded!', 'info');
  };

  const handleClearAll = () => {
    setBaseId('');
    setSauceId('');
    setCheeseId('');
    setVegetableIds([]);
    setSelectedAddons([]);
    setQuantity(1);
    showToast('Cleared', 'info');
  };

  const handlePlaceOrderClick = () => {
    setError('');
    if (!baseId || !sauceId || !cheeseId) {
      setError('Please select a base, sauce, and cheese');
      return;
    }
    setShowReviewModal(true);
  };

  const handleConfirmOrder = async () => {
    try {
      const res = await API.post('/orders', {
        baseId, sauceId, cheeseId, vegetableIds, quantity, addons: selectedAddons,
      });
      showToast('Pizza ordered! Head to checkout.', 'success');
      setShowReviewModal(false);
      navigate('/dashboard', { state: { newOrderId: res.data.order._id } });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create order';
      setError(msg);
      showToast(msg, 'error');
      setShowReviewModal(false);
    }
  };

  const isCurrentComboSaved = favorites.some(
    (fav) =>
      fav.base?._id === baseId &&
      fav.sauce?._id === sauceId &&
      fav.cheese?._id === cheeseId &&
      fav.vegetables?.length === vegetableIds.length &&
      fav.vegetables?.every((v) => vegetableIds.includes(v._id))
  );

  const handleSaveFavorite = async () => {
    if (!baseId || !sauceId || !cheeseId) {
      showToast('Select a base, sauce, and cheese first', 'error');
      return;
    }
    if (isCurrentComboSaved) {
      const existing = favorites.find(
        (fav) =>
          fav.base?._id === baseId &&
          fav.sauce?._id === sauceId &&
          fav.cheese?._id === cheeseId &&
          fav.vegetables?.length === vegetableIds.length &&
          fav.vegetables?.every((v) => vegetableIds.includes(v._id))
      );
      if (existing) {
        try {
          await API.delete(`/favorites/${existing._id}`);
          showToast('Removed from favorites', 'info');
          fetchFavorites();
        } catch (err) {
          showToast('Failed to remove favorite', 'error');
        }
      }
      return;
    }
    const name = window.prompt('Name this combo (e.g. "My Friday Special"):');
    if (!name) return;
    try {
      await API.post('/favorites', { name, baseId, sauceId, cheeseId, vegetableIds });
      showToast('Saved to favorites!', 'success');
      fetchFavorites();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save favorite', 'error');
    }
  };

  const handleLoadFavorite = (fav) => {
    setBaseId(fav.base._id);
    setSauceId(fav.sauce._id);
    setCheeseId(fav.cheese._id);
    setVegetableIds(fav.vegetables.map((v) => v._id));
    setShowFavorites(false);
    showToast(`Loaded "${fav.name}"`, 'success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReorderLast = () => {
    if (!lastOrder) return;
    setBaseId(lastOrder.pizza.base._id);
    setSauceId(lastOrder.pizza.sauce._id);
    setCheeseId(lastOrder.pizza.cheese._id);
    setVegetableIds(lastOrder.pizza.vegetables.map((v) => v._id));
    showToast('Loaded your last order', 'success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  

  const handleDeleteFavorite = async (id, e) => {
    e.stopPropagation();
    try {
      await API.delete(`/favorites/${id}`);
      fetchFavorites();
      showToast('Favorite removed', 'info');
    } catch (err) {
      showToast('Failed to remove favorite', 'error');
    }
  };

  // Each category has its own accent color class, applied to its tiles' selected state
  const IngredientOption = ({ item, selected, onSelect, type, accentClass }) => {
    const tag = POPULAR_NAMES.includes(item.name)
      ? { label: 'Popular', className: 'tag-popular' }
      : SPICY_NAMES.includes(item.name)
      ? { label: 'Spicy', className: 'tag-spicy' }
      : null;

    return (
      <label className={`ingredient-tile ${accentClass} ${selected ? 'selected' : ''}`}>
        <input type={type} checked={selected} onChange={onSelect} className="ingredient-input" />
        {tag && <span className={`ingredient-tag ${tag.className}`}>{tag.label}</span>}
        <span className="ingredient-tile-name">{item.name}</span>
        <span className="ingredient-tile-price">₹{item.price}</span>
      </label>
    );
  };

 const StepCard = ({ number, accent, title, subtitle, complete, collapsible, children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const prevComplete = useRef(false);

    // The instant this step transitions from incomplete to complete, auto-collapse it.
    useEffect(() => {
      if (collapsible && complete && !prevComplete.current) {
        setCollapsed(true);
      }
      if (!complete) {
        setCollapsed(false);
      }
      prevComplete.current = complete;
    }, [complete, collapsible]);

    const isCollapsed = collapsible && complete && collapsed;

    return (
      <div className="step-wrap" style={{ '--accent': `var(--${accent})` }}>
        <div
          className="step-wrap-header"
          style={{ cursor: collapsible && complete ? 'pointer' : 'default' }}
          onClick={() => collapsible && complete && setCollapsed((c) => !c)}
        >
          <span className={`step-wrap-badge ${complete ? 'done' : ''}`}>{complete ? '✓' : number}</span>
          <div style={{ flex: 1 }}>
            <div className="step-wrap-title">{title}</div>
            {subtitle && <div className="step-wrap-subtitle">{subtitle}</div>}
          </div>
          {collapsible && complete && (
            <span className="step-collapse-arrow">{isCollapsed ? '▸' : '▾'}</span>
          )}
        </div>
        {!isCollapsed && children}
      </div>
    );
  };

  if (loading) return <p className="page">Loading pizza options...</p>;
  if (error && !options) return <p className="page error-text">{error}</p>;

  const spice = getSpiceLevel();
  const { baseName, sauceName, cheeseName, vegNames } = getSelectedNames();
  const stepsComplete = [baseId, sauceId, cheeseId].filter(Boolean).length;

  return (
    <div className="page">
      <div className="navbar">
        <h2 style={{ margin: 0 }}>Build Your Pizza</h2>
        <div>
          <span className="navbar-user">Hi, {user?.name}</span>
          <button className="btn btn-small" onClick={() => navigate('/dashboard')}>My Orders</button>
          <button className="profile-trigger" onClick={openSidebar}>
            <Avatar name={user?.name} imageUrl={user?.avatar} size={38} />
          </button>
          
        </div>
      </div>

      <div className="builder-toolbar">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn" onClick={handleSurpriseMe}>Surprise Me</button>
          <button className="btn" onClick={() => setShowFavorites((s) => !s)}>
            My Favorites {favorites.length > 0 && `(${favorites.length})`}
          </button>
          {lastOrder && (
            <button className="btn" onClick={handleReorderLast}>Reorder Last</button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="builder-progress">
            <span className="builder-progress-count">{stepsComplete}/3</span> core steps done
          </div>
          <button className="btn btn-small" onClick={handleClearAll}>Clear All</button>
        </div>
      </div>

      {showFavorites && (
        <div className="favorites-panel">
          {favorites.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No saved favorites yet.</p>
          ) : (
            favorites.map((fav) => (
              <div key={fav._id} className="favorite-item" onClick={() => handleLoadFavorite(fav)}>
                <div>
                  <div className="favorite-name">{fav.name}</div>
                  <div className="favorite-desc">
                    {fav.base?.name} · {fav.sauce?.name} · {fav.cheese?.name}
                    {fav.vegetables?.length > 0 && ` · ${fav.vegetables.map((v) => v.name).join(', ')}`}
                  </div>
                </div>
                <button className="favorite-delete" onClick={(e) => handleDeleteFavorite(fav._id, e)}>✕</button>
              </div>
            ))
          )}
        </div>
      )}

      <div style={{ margin: '20px 0' }}>
        <PizzaPreview baseName={baseName} sauceName={sauceName} cheeseName={cheeseName} vegetableNames={vegNames} />
      </div>

      <div className="build-summary">
        <div className="build-summary-row">
          <span className="build-summary-label">Base</span>
          <span className={baseName ? 'build-summary-val' : 'build-summary-empty'}>{baseName || 'not selected'}</span>
        </div>
        <div className="build-summary-row">
          <span className="build-summary-label">Sauce</span>
          <span className={sauceName ? 'build-summary-val' : 'build-summary-empty'}>{sauceName || 'not selected'}</span>
        </div>
        <div className="build-summary-row">
          <span className="build-summary-label">Cheese</span>
          <span className={cheeseName ? 'build-summary-val' : 'build-summary-empty'}>{cheeseName || 'not selected'}</span>
        </div>
        <div className="build-summary-row">
          <span className="build-summary-label">Toppings</span>
          <span className={vegNames.length ? 'build-summary-val' : 'build-summary-empty'}>{vegNames.length ? vegNames.join(', ') : 'none'}</span>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
          <div className={`spice-badge ${spice.className}`}>{spice.label} spice level</div>
          {(baseId || sauceId || cheeseId) && (
            <div className="calorie-badge">~{estimateCalories()} kcal</div>
          )}
        </div>
      </div>

     <StepCard number={1} accent="red" title="Choose a Base" subtitle="Pick one crust style" complete={!!baseId} collapsible>
        <div className="ingredient-tile-grid">
          {options.bases.map((item) => (
            <IngredientOption key={item._id} item={item} type="radio" accentClass="accent-red" selected={baseId === item._id} onSelect={() => setBaseId(item._id)} />
          ))}
        </div>
      </StepCard>

      <StepCard number={2} accent="orange" title="Choose a Sauce" subtitle="Pick one sauce" complete={!!sauceId} collapsible>
        <div className="ingredient-tile-grid">
          {options.sauces.map((item) => (
            <IngredientOption key={item._id} item={item} type="radio" accentClass="accent-orange" selected={sauceId === item._id} onSelect={() => setSauceId(item._id)} />
          ))}
        </div>
      </StepCard>

      <StepCard number={3} accent="cheese" title="Choose a Cheese" subtitle="Pick one cheese" complete={!!cheeseId} collapsible>
        <div className="ingredient-tile-grid">
          {options.cheeses.map((item) => (
            <IngredientOption key={item._id} item={item} type="radio" accentClass="accent-yellow" selected={cheeseId === item._id} onSelect={() => setCheeseId(item._id)} />
          ))}
        </div>
      </StepCard>

      <StepCard number={4} accent="green" title="Add Vegetables" subtitle="Optional — pick as many as you like" complete={vegetableIds.length > 0}>
        <div className="ingredient-tile-grid">
          {options.vegetables.map((item) => (
            <IngredientOption key={item._id} item={item} type="checkbox" accentClass="accent-green" selected={vegetableIds.includes(item._id)} onSelect={() => toggleVegetable(item._id)} />
          ))}
        </div>
      </StepCard>

      <StepCard number={5} accent="purple" title="Add-ons" subtitle="Optional extras" complete={selectedAddons.length > 0}>
        <div className="ingredient-tile-grid">
          {ADDONS.map((addon) => (
            <label key={addon.name} className={`ingredient-tile accent-purple ${selectedAddons.some((a) => a.name === addon.name) ? 'selected' : ''}`}>
              <input type="checkbox" checked={selectedAddons.some((a) => a.name === addon.name)} onChange={() => toggleAddon(addon)} className="ingredient-input" />
              <span className="ingredient-tile-name">{addon.name}</span>
              <span className="ingredient-tile-price">₹{addon.price}</span>
            </label>
          ))}
        </div>
      </StepCard>

      <StepCard number={6} accent="cheese" title="Quantity" subtitle="How many pizzas?" complete={true}>
        <div className="quantity-selector">
          <button className="btn btn-small" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
          <span className="quantity-value">{quantity}</span>
          <button className="btn btn-small" onClick={() => setQuantity((q) => q + 1)}>+</button>
        </div>
      </StepCard>

      <div className="total-bar total-bar-sticky">
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</div>
          <div className="total-price">₹{grandTotal}</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className={`heart-btn ${isCurrentComboSaved ? 'saved' : ''}`} onClick={handleSaveFavorite} aria-label="Save as favorite">
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path d="M12 21s-6.7-4.35-9.3-8.2C1.1 10.4 1.6 7 4.3 5.5c2.1-1.15 4.6-.55 6 1.2.4.5.9 1.1 1.7 1.1s1.3-.6 1.7-1.1c1.4-1.75 3.9-2.35 6-1.2 2.7 1.5 3.2 4.9 1.6 7.3C18.7 16.65 12 21 12 21z" />
            </svg>
          </button>
          <button className="btn btn-primary" onClick={handlePlaceOrderClick}>Place Order</button>
        </div>
      </div>
      {error && <p className="error-text" style={{ marginTop: 12 }}>{error}</p>}

      {showReviewModal && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 4 }}>Review Your Order</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 20 }}>
              Double-check everything before we fire it up.
            </p>

            <div className="modal-summary-row"><span>Base</span><span>{baseName}</span></div>
            <div className="modal-summary-row"><span>Sauce</span><span>{sauceName}</span></div>
            <div className="modal-summary-row"><span>Cheese</span><span>{cheeseName}</span></div>
            <div className="modal-summary-row">
              <span>Toppings</span>
              <span>{vegNames.length ? vegNames.join(', ') : 'None'}</span>
            </div>

            {vegNames.length === 0 && (
              <div className="modal-nudge">Want to add some toppings? Go back and pick a few — or order as-is, that's fine too.</div>
            )}

            {selectedAddons.length > 0 && (
              <div className="modal-summary-row">
                <span>Add-ons</span>
                <span>{selectedAddons.map((a) => a.name).join(', ')}</span>
              </div>
            )}

            <div className="modal-summary-row"><span>Quantity</span><span>{quantity}</span></div>

            <div className="modal-total-row">
              <span>Total</span>
              <span className="modal-total-price">₹{grandTotal}</span>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn" style={{ flex: 1 }} onClick={() => setShowReviewModal(false)}>Go Back</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleConfirmOrder}>Confirm Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Builder;