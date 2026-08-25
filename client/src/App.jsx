import { Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Builder from './pages/Builder';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import { useSidebar } from './context/SidebarContext';
import Favorites from './pages/Favorites';
import Bills from './pages/Bills';
import Profile from './pages/Profile';
import VerifyOtp from './pages/VerifyOtp';
import Legal from './pages/Legal';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

// Same as ProtectedRoute, but also requires role === 'admin'
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/builder" />;
  return children;
};

function App() {
  const { open } = useSidebar();

  return (
    <>
      <Sidebar />
      <div className={`app-shift ${open ? 'shifted' : ''}`}>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
      
      <Route
        path="/builder"
        element={
          <ProtectedRoute>
            <Builder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        }
      />
        <Route
        path="/favorites"
        element={
          <ProtectedRoute>
            <Favorites />
          </ProtectedRoute>
        }
      />
        <Route
        path="/bills"
        element={
          <ProtectedRoute>
            <Bills />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Landing />} />
      <Route path="/legal/:type" element={<Legal />} />
      </Routes>
      </div>
    </>
  );
}

export default App;