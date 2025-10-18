import { useState, useEffect } from 'react';
import { productsAPI, ordersAPI } from '../utils/api';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        productsAPI.getAll(),
        ordersAPI.getAll()
      ]);

      const products = productsRes.data.data || [];
      const orders = ordersRes.data.data || [];
      const pending = orders.filter(o => o.status === 'pending').length;
      const recent = orders.slice(0, 5);

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        pendingOrders: pending,
        recentOrders: recent
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <h3>Total Products</h3>
            <p className="stat-number">{stats.totalProducts}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-content">
            <h3>Total Orders</h3>
            <p className="stat-number">{stats.totalOrders}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-content">
            <h3>Pending Orders</h3>
            <p className="stat-number">{stats.pendingOrders}</p>
          </div>
        </div>
      </div>

      <div className="recent-orders">
        <h2>Recent Orders</h2>
        {stats.recentOrders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr key={order._id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.customerInfo?.name}</td>
                  <td>₹{order.pricing?.total?.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge status-${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
