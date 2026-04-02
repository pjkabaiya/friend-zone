import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="nav">
        <div className="nav-container">
          <Link to="/" className="logo">
            <span className="logo-icon">🎯</span>
            FRIEND ZONE
          </Link>

          <ul className="nav-links">
            <li><Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link></li>
            <li><Link to="/crew" className={isActive('/crew') ? 'active' : ''}>Crew</Link></li>
            <li><Link to="/mood" className={isActive('/mood') ? 'active' : ''}>Mood</Link></li>
            <li><Link to="/chat" className={isActive('/chat') ? 'active' : ''}>Chat</Link></li>
            <li><Link to="/memories" className={isActive('/memories') ? 'active' : ''}>Memories</Link></li>
            <li><Link to="/entertainment" className={isActive('/entertainment') ? 'active' : ''}>Fun</Link></li>
            {user?.role === 'admin' && <li><Link to="/admin" className={isActive('/admin') ? 'active' : ''}>Admin</Link></li>}
            
            {user && (
              <li className="nav-profile">
                <Link to="/profile" className="nav-profile-link">
                  <img src={getImageUrl(user.avatar) || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName) + '&background=FF3366&color=fff'} alt={user.displayName} className="nav-avatar" />
                  <span className="nav-username">{user.displayName}</span>
                </Link>
                <button className="logout-btn" onClick={logout}>Logout</button>
              </li>
            )}
          </ul>

          <button className="nav-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
            ☰
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="mobile-nav active">
          <Link to="/" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link to="/crew" onClick={() => setMobileOpen(false)}>Crew</Link>
          <Link to="/mood" onClick={() => setMobileOpen(false)}>Mood</Link>
          <Link to="/chat" onClick={() => setMobileOpen(false)}>Chat</Link>
          <Link to="/memories" onClick={() => setMobileOpen(false)}>Memories</Link>
          <Link to="/entertainment" onClick={() => setMobileOpen(false)}>Entertainment</Link>
          {user?.role === 'admin' && <Link to="/admin" onClick={() => setMobileOpen(false)}>Admin</Link>}
          {user && <a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>Logout</a>}
        </div>
      )}
    </>
  );
}
