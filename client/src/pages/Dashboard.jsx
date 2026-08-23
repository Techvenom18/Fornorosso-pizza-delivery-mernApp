import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusStepper from '../components/StatusStepper';
import { SkeletonOrderCard } from '../components/Skeleton';
import jsPDF from 'jspdf';
import { useAuth as useAuthAlias } from '../context/AuthContext'; // placeholder, remove
import { useSidebar } from '../context/SidebarContext';
import Avatar from '../components/Avatar';

const STATUS_FILTERS = ['All', 'Order Received', 'In Kitchen', 'Sent to Delivery'];

// Rough, illustrative ETA per status - not tied to real delivery logistics.
const ETA_MINUTES = { 'Order Received': 28, 'In Kitchen': 18, 'Sent to Delivery': 8 };

const isSameDay = (a, b) =>
  new Date(a).toDateString() === new Date(b).toDateString();

const isYesterday = (dateStr) => {
  const d = new Date(dateStr);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(d, yesterday);
};

const groupByDate = (orders) => {
  const groups = { Today: [], Yesterday: [], Earlier: [] };
  const now = new Date();
  orders.forEach((order) => {
    if (isSameDay(order.createdAt, now)) groups.Today.push(order);
    else if (isYesterday(order.createdAt)) groups.Yesterday.push(order);
    else groups.Earlier.push(order);
  });
  return groups;
};

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [payingId, setPayingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [statModal, setStatModal] = useState(null); // null | 'orders' | 'spent' | 'favorites'
  const [favoritesList, setFavoritesList] = useState([]);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { openSidebar } = useSidebar();

  const fetchOrders = async () => {
    try {
      const res = await API.get('/orders/my');
      setOrders(res.data);
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchFavData = async () => {
      try {
        const res = await API.get('/favorites');
        setFavoritesCount(res.data.length);
        setFavoritesList(res.data);
      } catch (err) {}
    };
    fetchFavData();
  }, []);

  const handlePay = async (orderId) => {
    setPayingId(orderId);
    setError('');
    try {
      const createRes = await API.post('/payments/create', { orderId });
      if (createRes.data.mock) {
        await API.post('/payments/mock-verify', { orderId });
        showToast('Payment successful!', 'success');
        fetchOrders();
      } else {
        alert('Real Razorpay checkout would open here once live keys are configured.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Payment failed';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setPayingId(null);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this order? This cannot be undone.')) return;
    try {
      await API.delete(`/orders/${orderId}`);
      showToast('Order cancelled', 'info');
      fetchOrders();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel order', 'error');
    }
  };

  const handleReorder = (order) => {
    navigate('/builder', {
      state: {
        reorder: {
          baseId: order.pizza.base?._id,
          sauceId: order.pizza.sauce?._id,
          cheeseId: order.pizza.cheese?._id,
          vegetableIds: order.pizza.vegetables?.map((v) => v._id) || [],
        },
      },
    });
  };

  const statusClass = (status) => {
    if (status === 'Order Received') return 'status-received';
    if (status === 'In Kitchen') return 'status-kitchen';
    if (status === 'Sent to Delivery') return 'status-delivery';
    return '';
  };

    const filteredOrders = orders
    .filter((order) => {
      if (statusFilter !== 'All' && order.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const ingredientNames = [
          order.pizza.base?.name,
          order.pizza.sauce?.name,
          order.pizza.cheese?.name,
          ...(order.pizza.vegetables?.map((v) => v.name) || []),
        ].filter(Boolean).join(' ').toLowerCase();
        if (!ingredientNames.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'priceHigh') return b.totalPrice - a.totalPrice;
      if (sortBy === 'priceLow') return a.totalPrice - b.totalPrice;
      return 0;
    });

  const grouped = groupByDate(filteredOrders);

  const totalSpent = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalPrice, 0);

    const downloadReceipt = (order) => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 60;

    // Header
    doc.setFillColor(255, 75, 62); // brand red
    doc.rect(0, 0, pageWidth, 90, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('FornoRosso', 40, 45);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Order Receipt', 40, 65);

    y = 130;
    doc.setTextColor(40, 40, 40);

    // Order meta
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(`Order ID: ${order._id}`, 40, y);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 40, y + 16);
    y += 45;

    doc.setDrawColor(230, 220, 200);
    doc.line(40, y, pageWidth - 40, y);
    y += 30;

    // Line item helper
    const row = (label, value) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      doc.text(label, 40, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(90, 90, 90);
      const wrapped = doc.splitTextToSize(String(value), pageWidth - 200);
      doc.text(wrapped, 180, y);
      y += 20 * wrapped.length;
    };

    row('Base:', order.pizza.base?.name || '-');
    row('Sauce:', order.pizza.sauce?.name || '-');
    row('Cheese:', order.pizza.cheese?.name || '-');
    if (order.pizza.vegetables?.length > 0) {
      row('Vegetables:', order.pizza.vegetables.map((v) => v.name).join(', '));
    }
    if (order.addons?.length > 0) {
      row('Add-ons:', order.addons.map((a) => a.name).join(', '));
    }
    row('Quantity:', order.quantity || 1);

    y += 10;
    doc.line(40, y, pageWidth - 40, y);
    y += 30;

    // Total - larger, brand-colored
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 75, 62);
    doc.text('Total', 40, y);
    doc.text(`Rs. ${order.totalPrice}`, pageWidth - 40, y, { align: 'right' });
    y += 30;

    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'normal');
    doc.text(`Payment: ${order.paymentStatus}   |   Status: ${order.status}`, 40, y);

    y += 60;
    doc.setFontSize(9);
    doc.setTextColor(160, 160, 160);
    doc.text('Thank you for ordering with FornoRosso!', 40, y);

        doc.save(`receipt-${order._id.slice(-6)}.pdf`);

    // Log this download so it shows up in the "Downloaded Bills" history page
    API.post('/receipts', {
      orderId: order._id,
      amount: order.totalPrice,
      summary: `${order.pizza.base?.name} · ${order.pizza.sauce?.name} · ${order.pizza.cheese?.name}`,
    }).catch(() => {}); // non-critical if this fails - don't block the download itself
  };


  const OrderCard = ({ order }) => {
    const isExpanded = expandedId === order._id;
    return (
      <div className="order-card">
        <div className="order-card-top" onClick={() => setExpandedId(isExpanded ? null : order._id)}>
          <div>
            <p style={{ margin: 0, fontWeight: 700 }}>
              {order.pizza.base?.name} · {order.pizza.sauce?.name} · {order.pizza.cheese?.name}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              ₹{order.totalPrice} · {order.quantity > 1 ? `×${order.quantity} · ` : ''}{order.paymentStatus}
            </p>
          </div>
          <span className="order-expand-arrow">{isExpanded ? '▾' : '▸'}</span>
        </div>

        {isExpanded && (
          <>
            {order.pizza.vegetables?.length > 0 && (
              <p><strong>Vegetables:</strong> {order.pizza.vegetables.map((v) => v.name).join(', ')}</p>
            )}
            {order.addons?.length > 0 && (
              <p><strong>Add-ons:</strong> {order.addons.map((a) => a.name).join(', ')}</p>
            )}

            <StatusStepper status={order.status} />

            {order.paymentStatus === 'paid' && order.status !== 'Sent to Delivery' && (
              <div className="eta-badge">Estimated: ~{ETA_MINUTES[order.status]} min remaining</div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              {order.paymentStatus === 'pending' && (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={() => handlePay(order._id)}
                    disabled={payingId === order._id}
                  >
                    {payingId === order._id ? 'Processing...' : 'Pay Now'}
                  </button>
                  <button className="btn" onClick={() => handleCancelOrder(order._id)}>Cancel Order</button>
                </>
              )}
              <button className="btn" onClick={() => handleReorder(order)}>Order Again</button>
              <button
                className="btn"
                onClick={() => downloadReceipt(order)}
                disabled={order.paymentStatus !== 'paid'}
                title={order.paymentStatus !== 'paid' ? 'Complete payment to download receipt' : ''}
              >
                Download Receipt
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="page">
      <div className="navbar">
        <h2 style={{ margin: 0 }}>My Orders</h2>
        <div>
          <span className="navbar-user">Hi, {user?.name}</span>
          <button className="btn btn-small" onClick={() => navigate('/builder')}>Order More</button>
          <button className="profile-trigger" onClick={openSidebar}>
            <Avatar name={user?.name} imageUrl={user?.avatar} size={38} />
          </button>
        </div>
      </div>

      {orders.length > 0 && (
        <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', margin: '20px 0' }}>
          <div className="admin-stat-card clickable" onClick={() => setStatModal('orders')}>
            <div className="admin-stat-value">{orders.length}</div>
            <div className="admin-stat-label">Orders</div>
          </div>
          <div className="admin-stat-card clickable" onClick={() => setStatModal('spent')}>
            <div className="admin-stat-value">₹{totalSpent}</div>
            <div className="admin-stat-label">Spent</div>
          </div>
          <div className="admin-stat-card clickable" onClick={() => setStatModal('favorites')}>
            <div className="admin-stat-value">{favoritesCount}</div>
            <div className="admin-stat-label">Favorites</div>
          </div>
        </div>
      )}

      <div className="dashboard-toolbar">
        <div className="status-filter-pills">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              className={`status-pill ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select className="select-status" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="priceHigh">Price: High to Low</option>
            <option value="priceLow">Price: Low to High</option>
          </select>
          <input
            className="input"
            style={{ marginBottom: 0, maxWidth: 200 }}
            placeholder="Search by ingredient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      {loading && (
        <>
          <SkeletonOrderCard />
          <SkeletonOrderCard />
        </>
      )}

      {!loading && filteredOrders.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-title">
            {orders.length === 0 ? 'No orders yet' : 'No orders match your filters'}
          </div>
          <div className="empty-state-text">
            {orders.length === 0 ? "Your kitchen's empty — let's fix that." : 'Try a different status or search term.'}
          </div>
          {orders.length === 0 && (
            <button className="btn btn-primary" onClick={() => navigate('/builder')}>
              Build Your First Pizza
            </button>
          )}
        </div>
      )}

            {!loading && ['Today', 'Yesterday', 'Earlier'].map((label) =>
        grouped[label].length > 0 ? (
          <div key={label}>
            <h3>{label}</h3>
            {grouped[label].map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        ) : null
      )}

      {statModal && (
        <div className="modal-overlay" onClick={() => setStatModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            {statModal === 'orders' && (
              <>
                <h2>All Orders ({orders.length})</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>Everything you've ordered.</p>
                {orders.map((o) => (
                  <div key={o._id} className="modal-summary-row">
                    <span>{o.pizza.base?.name} · {o.pizza.sauce?.name}</span>
                    <span>₹{o.totalPrice} · {o.status}</span>
                  </div>
                ))}
              </>
            )}

            {statModal === 'spent' && (
              <>
                <h2>Spending Breakdown</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>From {orders.filter((o) => o.paymentStatus === 'paid').length} paid orders.</p>
                {orders.filter((o) => o.paymentStatus === 'paid').map((o) => (
                  <div key={o._id} className="modal-summary-row">
                    <span>{o.pizza.base?.name} · {o.pizza.sauce?.name}</span>
                    <span>₹{o.totalPrice}</span>
                  </div>
                ))}
                <div className="modal-total-row">
                  <span>Total Spent</span>
                  <span className="modal-total-price">₹{totalSpent}</span>
                </div>
              </>
            )}

            {statModal === 'favorites' && (
              <>
                <h2>My Favorites ({favoritesList.length})</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>Saved combos, ready to reorder anytime.</p>
                {favoritesList.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>No favorites saved yet.</p>
                ) : (
                  favoritesList.map((fav) => (
                    <div key={fav._id} className="modal-summary-row">
                      <span>{fav.name}</span>
                      <span>{fav.base?.name} · {fav.sauce?.name} · {fav.cheese?.name}</span>
                    </div>
                  ))
                )}
              </>
            )}

            <button className="btn" style={{ width: '100%', marginTop: 16 }} onClick={() => setStatModal(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;