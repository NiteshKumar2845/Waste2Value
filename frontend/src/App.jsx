import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NewListing from './pages/NewListing.jsx';
import Passport from './pages/Passport.jsx';
import PublicPassport from './pages/PublicPassport.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/passport/:passportId" element={<PublicPassport />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/new-listing"
            element={
              <ProtectedRoute roles={['user', 'business']}>
                <NewListing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/passport"
            element={
              <ProtectedRoute roles={['user', 'business']}>
                <Passport />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="footer">Waste2Value · turning waste into value ♻️</footer>
    </>
  );
}
