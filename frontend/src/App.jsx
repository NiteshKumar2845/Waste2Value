import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminDashboard from './pages/dashboards/AdminDashboard.jsx';
import CollectorDashboard from './pages/dashboards/CollectorDashboard.jsx';
import UserDashboard from './pages/dashboards/UserDashboard.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import NewListing from './pages/NewListing.jsx';
import Overview from './pages/Overview.jsx';
import Passport from './pages/Passport.jsx';
import PublicPassport from './pages/PublicPassport.jsx';
import Register from './pages/Register.jsx';
import Settings from './pages/Settings.jsx';
import './styles.css';

function AppRoutes() {
  const { pathname } = useLocation();
  const isOverview = pathname === '/overview';

  return (
    <>
      {!isOverview && <Navbar />}
      <main className={isOverview ? undefined : 'container'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/overview" element={<ProtectedRoute roles={['user', 'business']}><Overview /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/passport/:passportId" element={<PublicPassport />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/user" element={<ProtectedRoute roles={['user', 'business']}><UserDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/collector" element={<ProtectedRoute roles={['collector']}><CollectorDashboard /></ProtectedRoute>} />
          <Route path="/new-listing" element={<ProtectedRoute roles={['user', 'business']}><NewListing /></ProtectedRoute>} />
          <Route path="/passport" element={<ProtectedRoute roles={['user', 'business']}><Passport /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return <BrowserRouter><AuthProvider><AppRoutes /></AuthProvider></BrowserRouter>;
}
