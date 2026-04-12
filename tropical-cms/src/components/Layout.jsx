import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import './Layout.css';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/products', label: 'Products', icon: '👕' },
  { to: '/designs', label: 'Designs', icon: '🎨' },
  { to: '/orders', label: 'Orders', icon: '📦' },
  { to: '/contacts', label: 'Contact Messages', icon: '✉️' },
  { to: '/featured', label: 'Wheel Items', icon: '⭐' },
  { to: '/hero', label: 'Hero Section', icon: '🖼️' },
];

function Layout({ onLogout }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="layout">
      {/* Mobile top bar */}
      <header className="mobile-header">
        <button
          className="hamburger-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation"
        >
          <span /><span /><span />
        </button>
        <span className="mobile-logo">The Tropical</span>
      </header>

      {/* Backdrop overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}

      <aside className={`sidebar${sidebarOpen ? ' sidebar--open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-header-row">
            <div>
              <h1>The Tropical</h1>
              <p className="sidebar-subtitle">Admin Panel</p>
            </div>
            <button
              className="sidebar-close-btn"
              onClick={closeSidebar}
              aria-label="Close navigation"
            >
              ✕
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={`nav-link ${isActive(to)}`}
              onClick={closeSidebar}
            >
              <span className="nav-icon">{icon}</span>
              <span className="nav-label">{label}</span>
            </Link>
          ))}
          <div className="nav-divider" />
          <Link
            to="/settings"
            className={`nav-link ${isActive('/settings')}`}
            onClick={closeSidebar}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-label">Settings</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button onClick={onLogout} className="btn btn-danger logout-btn">
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
