import { useState, useEffect } from 'react';
import { ordersAPI } from '../utils/api';
import './Orders.css';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="orders-page">
      <h1>Orders</h1>

      {orders.length === 0 ? (
        <div className="empty-state">
          <p>No orders yet.</p>
        </div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.customerInfo?.name}</td>
                  <td>{order.customerInfo?.email}</td>
                  <td>{order.customerInfo?.phone}</td>
                  <td>{order.items?.length || 0}</td>
                  <td>₹{order.pricing?.total?.toFixed(2)}</td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className={`status-select status-${order.status}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <span className={`payment-badge payment-${order.paymentStatus}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="order-actions">
                      <button
                        onClick={() => viewOrderDetails(order)}
                        className="btn btn-secondary btn-sm"
                      >
                        View
                      </button>
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <button
                          onClick={() => handleStatusChange(order._id, 'delivered')}
                          className="btn btn-success btn-sm"
                          title="Mark as Completed"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content order-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details - {selectedOrder.orderNumber}</h2>
              <button onClick={closeModal} className="close-btn">&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Customer Information</h3>
                <p><strong>Name:</strong> {selectedOrder.customerInfo?.name}</p>
                <p><strong>Email:</strong> {selectedOrder.customerInfo?.email}</p>
                <p><strong>Phone:</strong> {selectedOrder.customerInfo?.phone}</p>
                {selectedOrder.customerInfo?.address && (
                  <p>
                    <strong>Address:</strong>{' '}
                    {selectedOrder.customerInfo.address.street},{' '}
                    {selectedOrder.customerInfo.address.city},{' '}
                    {selectedOrder.customerInfo.address.state},{' '}
                    {selectedOrder.customerInfo.address.zipCode}
                  </p>
                )}
              </div>

              <div className="detail-section">
                <h3>Order Items</h3>
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-info">
                      {item.image && <img src={item.image} alt={item.name} />}
                      <div>
                        <p className="item-name">{item.name}</p>
                        {item.size && <p className="item-size">Size: {item.size}</p>}
                      </div>
                    </div>
                    <div className="item-pricing">
                      <p>₹{item.price} × {item.quantity}</p>
                      <p className="item-total">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="detail-section">
                <h3>Pricing</h3>
                <div className="pricing-details">
                  <div className="pricing-row">
                    <span>Subtotal:</span>
                    <span>₹{selectedOrder.pricing?.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="pricing-row">
                    <span>Shipping:</span>
                    <span>₹{selectedOrder.pricing?.shipping?.toFixed(2)}</span>
                  </div>
                  <div className="pricing-row total">
                    <span>Total:</span>
                    <span>₹{selectedOrder.pricing?.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Payment Information</h3>
                <p><strong>Status:</strong> {selectedOrder.paymentStatus}</p>
                {selectedOrder.paymentDetails?.razorpayOrderId && (
                  <p><strong>Razorpay Order ID:</strong> {selectedOrder.paymentDetails.razorpayOrderId}</p>
                )}
                {selectedOrder.paymentDetails?.razorpayPaymentId && (
                  <p><strong>Payment ID:</strong> {selectedOrder.paymentDetails.razorpayPaymentId}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
