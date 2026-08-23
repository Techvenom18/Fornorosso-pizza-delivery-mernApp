import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSidebar } from '../context/SidebarContext';
import PizzaPreview from '../components/PizzaPreview';
import Avatar from '../components/Avatar';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { openSidebar } = useSidebar();

  const fetchFavorites = async () => {
    try {
      const res = await API.get('/favorites');
      setFavorites(res.data);
    } catch (err) {
      showToast('Failed to load favorites', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleOrderThis = (fav) => {
    navigate('/builder', {
      state: {
        reorder: {
          baseId: fav.base?._id,
          sauceId: fav.sauce?._id,
          cheeseId: fav.cheese?._id,
          vegetableIds: fav.vegetables?.map((v) => v._id) || [],
        },
      },
    });
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/favorites/${id}`);
      showToast('Removed from favorites', 'info');
      fetchFavorites();
    } catch (err) {
      showToast('Failed to remove favorite', 'error');
    }
  };

  return (
    <div className="page">
      <div className="navbar">
        <h2 style={{ margin: 0 }}>My Favorites</h2>
        <div>
          <span className="navbar-user">Hi, {user?.name}</span>
          <button className="btn btn-small" onClick={() => navigate('/builder')}>Order More</button>
          <button className="profile-trigger" onClick={openSidebar}>
            <Avatar name={user?.name} imageUrl={user?.avatar} size={38} />
          </button>
        </div>
      </div>

      {loading && <p style={{ color: 'var(--text-muted)', marginTop: 20 }}>Loading favorites...</p>}

      {!loading && favorites.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-title">No favorites yet</div>
          <div className="empty-state-text">Save a combo from the Builder to see it here.</div>
          <button className="btn btn-primary" onClick={() => navigate('/builder')}>Build a Pizza</button>
        </div>
      )}

      <div className="favorites-grid">
        {favorites.map((fav) => (
          <div key={fav._id} className="favorite-card">
            <div className="favorite-card-preview">
              <PizzaPreview
                baseName={fav.base?.name}
                sauceName={fav.sauce?.name}
                cheeseName={fav.cheese?.name}
                vegetableNames={fav.vegetables?.map((v) => v.name) || []}
              />
            </div>
            <h3 style={{ margin: '10px 0 4px', justifyContent: 'center' }}>{fav.name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center', margin: '0 0 14px' }}>
              {fav.base?.name} · {fav.sauce?.name} · {fav.cheese?.name}
              {fav.vegetables?.length > 0 && ` · ${fav.vegetables.map((v) => v.name).join(', ')}`}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleOrderThis(fav)}>Order This</button>
              <button className="btn" onClick={() => handleDelete(fav._id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favorites;
