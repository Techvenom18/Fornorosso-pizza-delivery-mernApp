import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import Avatar from '../components/Avatar';

const Admin = () => {
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [editingStock, setEditingStock] = useState({});
  const [statModal, setStatModal] = useState(null); // null | 'orders' | 'revenue' | 'pending' | 'lowstock'
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { openSidebar } = useSidebar();

  const fetchData = async () => {
    try {
      const [invRes, ordRes] = await Promise.all([
        API.get('/admin/inventory'),
        API.get('/admin/orders'),
      ]);
      setInventory(invRes.data);
      setOrders(ordRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin data');
    }
  };


    useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

    const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sortedInventory = [...inventory].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const bumpStock = async (id, currentStock, amount) => {
    try {
      await API.patch(`/admin/inventory/${id}`, { stock: currentStock + amount });
      fetchData();
    } catch (err) {
      setError('Failed to update stock');
    }
  };

  const handleStockChange = (id, value) => {
    setEditingStock({ ...editingStock, [id]: value });
  };

  const handleStockSave = async (id) => {
    const newStock = editingStock[id];
    if (newStock === undefined || newStock === '') return;

    try {
      await API.patch(`/admin/inventory/${id}`, { stock: Number(newStock) });
      fetchData();
      setEditingStock({ ...editingStock, [id]: undefined });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update stock');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await API.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const lowStock = (item) => item.stock <= item.lowStockThreshold;

  const statusClass = (status) => {
    if (status === 'Order Received') return 'status-received';
    if (status === 'In Kitchen') return 'status-kitchen';
    if (status === 'Sent to Delivery') return 'status-delivery';
    return '';
  };

  return (
    <div className="page" style={{ maxWidth: 900 }}>
      <div className="navbar">
        <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
        <div>
          <span className="navbar-user">Hi, {user?.name} (Admin)</span>
          <button className="btn btn-small" onClick={() => navigate('/dashboard')}>My Orders</button>
          <button className="profile-trigger" onClick={openSidebar}>
            <Avatar name={user?.name} imageUrl={user?.avatar} size={38} />
          </button>
        </div>
      </div>

            {error && <p className="error-text">{error}</p>}

            <div className="admin-stats-grid">
        <div className="admin-stat-card clickable" onClick={() => setStatModal('orders')}>
          <div className="admin-stat-value">{orders.length}</div>
          <div className="admin-stat-label">Total Orders</div>
        </div>
        <div className="admin-stat-card clickable" onClick={() => setStatModal('revenue')}>
          <div className="admin-stat-value">₹{orders.filter((o) => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.totalPrice, 0)}</div>
          <div className="admin-stat-label">Revenue</div>
        </div>
        <div className="admin-stat-card clickable" onClick={() => setStatModal('pending')}>
          <div className="admin-stat-value">{orders.filter((o) => o.paymentStatus === 'pending').length}</div>
          <div className="admin-stat-label">Pending Payment</div>
        </div>
        <div className="admin-stat-card admin-stat-alert clickable" onClick={() => setStatModal('lowstock')}>
          <div className="admin-stat-value">{inventory.filter((i) => i.stock <= i.lowStockThreshold).length}</div>
          <div className="admin-stat-label">Low Stock Items</div>
        </div>
      </div>

      {inventory.filter((i) => i.stock <= i.lowStockThreshold).length > 0 && (
        <div className="low-stock-panel">
          <div className="low-stock-panel-title">⚠ Needs Restocking</div>
          <div className="low-stock-chips">
            {inventory.filter((i) => i.stock <= i.lowStockThreshold).map((item) => (
              <span key={item._id} className="low-stock-chip">
                {item.name} — {item.stock} left
              </span>
            ))}
          </div>
        </div>
      )}

      <h3>Inventory</h3>
            <table className="admin-table">
        <thead>
          <tr>
            <th className="sortable" onClick={() => handleSort('name')}>
              Name {sortField === 'name' && (sortDir === 'asc' ? '▲' : '▼')}
            </th>
            <th className="sortable" onClick={() => handleSort('type')}>
              Type {sortField === 'type' && (sortDir === 'asc' ? '▲' : '▼')}
            </th>
            <th className="sortable" onClick={() => handleSort('stock')}>
              Stock {sortField === 'stock' && (sortDir === 'asc' ? '▲' : '▼')}
            </th>
            <th className="sortable" onClick={() => handleSort('price')}>
              Price {sortField === 'price' && (sortDir === 'asc' ? '▲' : '▼')}
            </th>
            <th>Update</th>
          </tr>
        </thead>
                <tbody>
          {sortedInventory.map((item) => (
            <tr key={item._id} className={lowStock(item) ? 'low-stock' : ''}>
              <td>{item.name}</td>
              <td style={{ color: 'var(--text-muted)' }}>{item.type}</td>
              <td>
                {item.stock}
                {lowStock(item) && <span className="low-tag">LOW</span>}
              </td>
              <td style={{ color: 'var(--text-muted)' }}>₹{item.price}</td>
              <td>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button className="btn btn-small preset-btn" onClick={() => bumpStock(item._id, item.stock, 10)}>+10</button>
                  <button className="btn btn-small preset-btn" onClick={() => bumpStock(item._id, item.stock, 25)}>+25</button>
                  <button className="btn btn-small preset-btn" onClick={() => bumpStock(item._id, item.stock, 50)}>+50</button>
                  <input
                    className="input input-small"
                    type="number"
                    min="0"
                    placeholder="Set"
                    value={editingStock[item._id] ?? ''}
                    onChange={(e) => handleStockChange(item._id, e.target.value)}
                  />
                  <button className="btn btn-small" onClick={() => handleStockSave(item._id)}>Save</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Orders</h3>
      {orders.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">No orders yet</div>
          <div className="empty-state-text">Orders will show up here as customers place them.</div>
        </div>
      )}
      {orders.map((order) => (
        <div key={order._id} className="order-card">
          <p><strong>Customer:</strong> {order.user?.name} ({order.user?.email})</p>
          <p>
            <strong>Pizza:</strong> {order.pizza.base?.name}, {order.pizza.sauce?.name}, {order.pizza.cheese?.name}
            {order.pizza.vegetables?.length > 0 && `, ${order.pizza.vegetables.map((v) => v.name).join(', ')}`}
          </p>
          <p>
            <span className="order-price">₹{order.totalPrice}</span> ·{' '}
            <strong>Payment:</strong> {order.paymentStatus}
          </p>
          <p>
            <span className={`status-badge ${statusClass(order.status)}`} style={{ marginRight: 10 }}>
              {order.status}
            </span>
            <select
              className="select-status"
              value={order.status}
              onChange={(e) => handleStatusChange(order._id, e.target.value)}
            >
              <option value="Order Received">Order Received</option>
              <option value="In Kitchen">In Kitchen</option>
              <option value="Sent to Delivery">Sent to Delivery</option>
            </select>
          </p>
        </div>
      ))}
          {statModal && (
        <div className="modal-overlay" onClick={() => setStatModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            {statModal === 'orders' && (
              <>
                <h2>All Orders ({orders.length})</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>Every order placed on the platform.</p>
                {orders.map((o) => (
                  <div key={o._id} className="modal-summary-row">
                    <span>{o.user?.name}</span>
                    <span>{o.pizza.base?.name} · ₹{o.totalPrice} · {o.status}</span>
                  </div>
                ))}
              </>
            )}

            {statModal === 'revenue' && (
              <>
                <h2>Revenue Breakdown</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>From {orders.filter((o) => o.paymentStatus === 'paid').length} paid orders.</p>
                {orders.filter((o) => o.paymentStatus === 'paid').map((o) => (
                  <div key={o._id} className="modal-summary-row">
                    <span>{o.user?.name}</span>
                    <span>₹{o.totalPrice}</span>
                  </div>
                ))}
                <div className="modal-total-row">
                  <span>Total</span>
                  <span className="modal-total-price">₹{orders.filter((o) => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.totalPrice, 0)}</span>
                </div>
              </>
            )}

            {statModal === 'pending' && (
              <>
                <h2>Pending Payment ({orders.filter((o) => o.paymentStatus === 'pending').length})</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>Orders awaiting payment confirmation.</p>
                {orders.filter((o) => o.paymentStatus === 'pending').length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>Nothing pending — all caught up.</p>
                ) : (
                  orders.filter((o) => o.paymentStatus === 'pending').map((o) => (
                    <div key={o._id} className="modal-summary-row">
                      <span>{o.user?.name}</span>
                      <span>{o.pizza.base?.name} · ₹{o.totalPrice}</span>
                    </div>
                  ))
                )}
              </>
            )}

            {statModal === 'lowstock' && (
              <>
                <h2>Low Stock Items</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>Items at or below their restock threshold.</p>
                {inventory.filter((i) => i.stock <= i.lowStockThreshold).length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>Everything's well stocked.</p>
                ) : (
                  inventory.filter((i) => i.stock <= i.lowStockThreshold).map((item) => (
                    <div key={item._id} className="modal-summary-row">
                      <span>{item.name}</span>
                      <span>{item.stock} left (threshold: {item.lowStockThreshold})</span>
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

export default Admin;