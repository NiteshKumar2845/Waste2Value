import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isSeller = user && ['user', 'business'].includes(user.role);
  const dashboardPath = user?.role === 'admin'
    ? '/dashboard/admin'
    : user?.role === 'collector'
      ? '/dashboard/collector'
      : '/dashboard/user';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          ♻️ Waste2Value
        </Link>
        <nav className="nav-links">
          {user && <NavLink to={dashboardPath}>Dashboard</NavLink>}
          {isSeller && <NavLink to="/overview">Overview</NavLink>}
          {user && <NavLink to="/settings">Settings</NavLink>}
          {isSeller && <NavLink to="/new-listing">Sell waste</NavLink>}
          {isSeller && <NavLink to="/passport">My Passport</NavLink>}
          {!user ? (
            <>
              <NavLink to="/login">Login</NavLink>
              <Link to="/register" className="btn btn-sm">
                Get started
              </Link>
            </>
          ) : (
            <>
              <span className="muted small">
                {user.name} · {user.role}
              </span>
              <button className="btn btn-sm btn-outline" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
