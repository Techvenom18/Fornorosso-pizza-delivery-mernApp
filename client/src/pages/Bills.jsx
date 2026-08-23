import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSidebar } from '../context/SidebarContext';
import jsPDF from 'jspdf';
import Avatar from '../components/Avatar';

const Bills = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { openSidebar } = useSidebar();

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const res = await API.get('/receipts');
        setReceipts(res.data);
      } catch (err) {
        showToast('Failed to load bills', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchReceipts();
  }, []);

  // Regenerates a simple PDF from the stored receipt record (summary + amount).
  // This is a lighter-weight version than the full itemized one on Dashboard,
  // since we only stored a summary string, not the full ingredient breakdown.
  const viewOrDownload = (receipt) => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(255, 75, 62);
    doc.rect(0, 0, pageWidth, 90, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('FornoRosso', 40, 45);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Order Receipt', 40, 65);

    let y = 130;
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(10);
    doc.text(`Downloaded: ${new Date(receipt.createdAt).toLocaleString()}`, 40, y);
    y += 40;

    doc.setDrawColor(230, 220, 200);
    doc.line(40, y, pageWidth - 40, y);
    y += 30;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    const wrapped = doc.splitTextToSize(receipt.summary, pageWidth - 80);
    doc.text(wrapped, 40, y);
    y += 24 * wrapped.length + 20;

    doc.setFontSize(16);
    doc.setTextColor(255, 75, 62);
    doc.text('Total', 40, y);
    doc.text(`Rs. ${receipt.amount}`, pageWidth - 40, y, { align: 'right' });

    doc.save(`bill-${receipt._id.slice(-6)}.pdf`);
  };

  return (
    <div className="page">
      <div className="navbar">
        <h2 style={{ margin: 0 }}>Downloaded Bills</h2>
        <div>
          <span className="navbar-user">Hi, {user?.name}</span>
          <button className="btn btn-small" onClick={() => navigate('/dashboard')}>My Orders</button>
          <button className="profile-trigger" onClick={openSidebar}>
            <Avatar name={user?.name} imageUrl={user?.avatar} size={38} />
          </button>
        </div>
      </div>

            {!loading && receipts.length > 0 && (
        <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', margin: '20px 0' }}>
          <div className="admin-stat-card">
            <div className="admin-stat-value">{receipts.length}</div>
            <div className="admin-stat-label">Bills Downloaded</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-value">₹{receipts.reduce((sum, r) => sum + r.amount, 0)}</div>
            <div className="admin-stat-label">Total Across Bills</div>
          </div>
        </div>
      )}

      {!loading && receipts.length > 0 && (
        <div className="dashboard-toolbar">
          <select className="select-status" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="priceHigh">Amount: High to Low</option>
            <option value="priceLow">Amount: Low to High</option>
          </select>
          <input
            className="input"
            style={{ marginBottom: 0, maxWidth: 220 }}
            placeholder="Search by ingredient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {loading && <p style={{ color: 'var(--text-muted)', marginTop: 20 }}>Loading bills...</p>}

      {!loading && receipts.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-title">No bills downloaded yet</div>
          <div className="empty-state-text">Download a receipt from My Orders and it'll show up here.</div>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Go to My Orders</button>
        </div>
      )}

      {receipts
        .filter((r) => r.summary.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
          if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
          if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
          if (sortBy === 'priceHigh') return b.amount - a.amount;
          if (sortBy === 'priceLow') return a.amount - b.amount;
          return 0;
        })
        .map((r) => (
        <div key={r._id} className="bill-row">
          <div>
            <div className="bill-summary">{r.summary}</div>
            <div className="bill-meta">
              {new Date(r.createdAt).toLocaleDateString()} at {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <div className="bill-amount">₹{r.amount}</div>
          <button className="btn btn-small" onClick={() => viewOrDownload(r)}>View / Download</button>
        </div>
      ))}
    </div>
  );
};

export default Bills;