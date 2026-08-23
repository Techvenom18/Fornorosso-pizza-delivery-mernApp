import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSidebar } from '../context/SidebarContext';
import Avatar from '../components/Avatar';

// Leaflet's default marker icon path breaks under bundlers like Vite unless
// manually reconfigured to load from a CDN instead of local assets.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const { openSidebar } = useSidebar();

  const [stats, setStats] = useState({ totalOrders: 0, totalSpent: 0, favoritesCount: 0 });
  const [showEditModal, setShowEditModal] = useState(false);
  const [bioDraft, setBioDraft] = useState(user?.bio || '');
  const [locationLabelDraft, setLocationLabelDraft] = useState(user?.location?.label || '');
  const [coords, setCoords] = useState(
    user?.location?.lat ? { lat: user.location.lat, lng: user.location.lng } : null
  );
  const [fetchingLocation, setFetchingLocation] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/profile/stats');
        setStats(res.data);
      } catch (err) {}
    };
    fetchStats();
  }, []);

  const [avatarDraft, setAvatarDraft] = useState(user?.avatar || '');

  const handleRemoveAvatar = () => {
    setAvatarDraft('');
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Image too large - please use one under 2MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      // Resize/compress before storing, to keep the base64 string reasonably small
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 300;
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setAvatarDraft(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleFetchLiveLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by this browser', 'error');
      return;
    }
    setFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setFetchingLocation(false);
        showToast('Location fetched', 'success');
      },
      () => {
        setFetchingLocation(false);
        showToast('Could not access your location - check browser permissions', 'error');
      }
    );
  };

  const handleSaveProfile = async () => {
    try {
      const res = await API.patch('/profile', {
        bio: bioDraft,
        avatar: avatarDraft,
        location: {
          label: locationLabelDraft,
          lat: coords?.lat ?? null,
          lng: coords?.lng ?? null,
        },
      });
      updateUser(res.data.user);
      showToast('Profile updated successfully', 'success');
      setShowEditModal(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    }
  };

  return (
    <div className="page">
      <div className="navbar">
        <h2 style={{ margin: 0 }}>Profile</h2>
        <div>
          <button className="btn btn-small" onClick={() => navigate('/dashboard')}>My Orders</button>
          <button className="profile-trigger" onClick={openSidebar}>
            <Avatar name={user?.name} imageUrl={user?.avatar} size={34} />
          </button>
        </div>
      </div>

      <div className="profile-hero">
        <Avatar name={user?.name} imageUrl={user?.avatar} size={100} className="profile-avatar-large" />
        <h2 style={{ margin: '14px 0 4px' }}>{user?.name}</h2>
        {user?.bio && <p className="profile-bio-text">{user.bio}</p>}
      </div>

      <div className="profile-stats-row">
        <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', flex: 1 }}>
          <div className="admin-stat-card">
            <div className="admin-stat-value">{stats.totalOrders}</div>
            <div className="admin-stat-label">Total Orders</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-value">₹{stats.totalSpent}</div>
            <div className="admin-stat-label">Spent</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-value">{stats.favoritesCount}</div>
            <div className="admin-stat-label">Favorites</div>
          </div>
        </div>
        <button className="btn" onClick={() => setShowEditModal(true)}>Edit</button>
      </div>

      <div className="profile-detail-card">
        <div className="profile-detail-row">
          <span className="profile-detail-label">Email</span>
          <span>{user?.email}</span>
        </div>
        <div className="profile-detail-row">
          <span className="profile-detail-label">Bio</span>
          <span>{user?.bio || <em style={{ color: 'var(--text-muted)' }}>Not set</em>}</span>
        </div>
        <div className="profile-detail-row profile-detail-row-map">
          <span className="profile-detail-label">Current Location</span>
          <span>{user?.location?.label || <em style={{ color: 'var(--text-muted)' }}>Not set</em>}</span>
        </div>
        {user?.location?.lat && (
          <div className="profile-map-wrap">
            <MapContainer center={[user.location.lat, user.location.lng]} zoom={13} style={{ height: 220, width: '100%', borderRadius: 14 }}>
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[user.location.lat, user.location.lng]}>
                <Popup>{user.location.label || 'Your location'}</Popup>
              </Marker>
            </MapContainer>
          </div>
        )}
      </div>

      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Profile</h2>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <label className="avatar-upload-label">
                <Avatar name={user?.name} imageUrl={avatarDraft} size={80} />
                <div className="avatar-upload-overlay">Change</div>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
              </label>
              {avatarDraft && (
                <button
                  type="button"
                  className="avatar-remove-link"
                  onClick={handleRemoveAvatar}
                >
                  Remove photo
                </button>
              )}
            </div>

            <label className="auth-label">Bio</label>
            <textarea
              className="input"
              rows={3}
              maxLength={200}
              value={bioDraft}
              onChange={(e) => setBioDraft(e.target.value)}
              placeholder="Tell us a bit about yourself..."
            />
            <label className="auth-label">Location Label</label>
            <input
              className="input"
              value={locationLabelDraft}
              onChange={(e) => setLocationLabelDraft(e.target.value)}
              placeholder="e.g. Delhi, India"
            />
            <button className="btn" style={{ width: '100%', marginBottom: 14 }} onClick={handleFetchLiveLocation} disabled={fetchingLocation}>
              {fetchingLocation ? 'Fetching...' : coords ? 'Location Fetched ✓' : 'Fetch Live Location'}
            </button>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="btn" onClick={handleSaveProfile}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
