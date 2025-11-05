import { Outlet, Link, useLocation } from 'react-router-dom';
import './Layout.css';

function Layout({ onLogout }) {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>The Tropical</h1>
          <p className="sidebar-subtitle">Admin Panel</p>
        </div>
        <nav className="sidebar-nav">
          <Link to="/" className={`nav-link ${isActive('/')}`}>
            Dashboard
          </Link>
          <Link to="/products" className={`nav-link ${isActive('/products')}`}>
            Products
          </Link>
          <Link to="/designs" className={`nav-link ${isActive('/designs')}`}>
            Designs
          </Link>
          <Link to="/orders" className={`nav-link ${isActive('/orders')}`}>
            Orders
          </Link>
          <Link to="/contacts" className={`nav-link ${isActive('/contacts')}`}>
            Contact Messages
          </Link>
          <Link to="/featured" className={`nav-link ${isActive('/featured')}`}>
            Wheel Items
          </Link>
          <Link to="/hero" className={`nav-link ${isActive('/hero')}`}>
            Hero Section
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
