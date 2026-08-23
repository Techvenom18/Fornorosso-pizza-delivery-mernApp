import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import Avatar from './Avatar';

const Icon = {
  switch: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 014-4h14" /><path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 01-4 4H3" /></svg>,
    home: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path d="M9 22V12h6v10" /></svg>,
  pizza: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 20h20L12 2z" /><circle cx="12" cy="14" r="1" fill="currentColor" /><circle cx="9" cy="17" r="1" fill="currentColor" /></svg>,
  orders: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /></svg>,
  admin: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" /></svg>,
  cart: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" /></svg>,
  heart: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 000-7.8z" /></svg>,
  tag: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41L11 3.83A2 2 0 009.59 3.24L3 3v6.59a2 2 0 00.59 1.41l9.59 9.59a2 2 0 002.82 0l4.59-4.59a2 2 0 000-2.82z" /><circle cx="7.5" cy="7.5" r="1.5" /></svg>,
  receipt: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 2h16v20l-3-2-3 2-3-2-3 2-3-2-1 1z" /><line x1="8" y1="7" x2="16" y2="7" /><line x1="8" y1="11" x2="16" y2="11" /></svg>,
  user: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>,
  signout: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>,
};

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { open, closeSidebar } = useSidebar();

  const go = (path) => {
    navigate(path);
    // Sidebar deliberately stays open across in-app navigation - only
    // closes when the user clicks outside it (handled by the overlay).
  };

  const handleTodaysOffer = () => {
    navigate('/');
    // Landing page listens for this custom event to trigger its own blink animation.
    setTimeout(() => window.dispatchEvent(new Event('blink-offer')), 150);
  };

  const handleSignOut = () => {
    logout();
    closeSidebar();
    navigate('/');
  };

  if (!open || !user) return null;

  return (
    <>
      <div className="sidebar-click-catcher" onClick={closeSidebar} />
      <aside className="sidebar">
        <div className="sidebar-profile-row">
          <Avatar name={user?.name} imageUrl={user?.avatar} size={52} />
          <div className="sidebar-profile-info">
            <div className="sidebar-profile-name">{user?.name}</div>
            <div className="sidebar-profile-email">{user?.email}</div>
          </div>
          <div className="sidebar-switch-wrap">
            <button className="sidebar-switch-btn" onClick={(e) => e.currentTarget.nextSibling.classList.toggle('open')}>
              {Icon.switch}
            </button>
            <div className="sidebar-switch-popover">
              <button onClick={() => navigate('/login')}>
                {Icon.user} Switch account or add account
              </button>
            </div>
          </div>
        </div>

        <div className="sidebar-divider" />

        <button className="sidebar-item" onClick={() => go('/')}>{Icon.home} Home</button>
        <button className="sidebar-item" onClick={() => go('/builder')}>{Icon.pizza} Customize Pizza</button>
        <button className="sidebar-item" onClick={() => go('/dashboard')}>{Icon.orders} My Orders</button>
        {user?.role === 'admin' && (
          <button className="sidebar-item" onClick={() => go('/admin')}>{Icon.admin} Admin Access</button>
        )}
        <button className="sidebar-item" onClick={() => go('/builder')}>{Icon.cart} Order Now</button>
        <button className="sidebar-item" onClick={() => go('/favorites')}>{Icon.heart} My Favorites</button>
        <button className="sidebar-item" onClick={handleTodaysOffer}>{Icon.tag} Today's Offer</button>
        <button className="sidebar-item" onClick={() => go('/bills')}>{Icon.receipt} Downloaded Bills</button>
        <button className="sidebar-item" onClick={() => go('/profile')}>{Icon.user} Profile</button>

        <div className="sidebar-spacer" />

        <button className="sidebar-item sidebar-signout" onClick={handleSignOut}>{Icon.signout} Sign Out</button>
      </aside>
    </>
  );
};

export default Sidebar;