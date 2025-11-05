import { useState, useEffect } from 'react';
import { contactsAPI } from '../utils/api';
import './Contacts.css';

function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, [filter]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await contactsAPI.getAll(params);
      setContacts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      alert('Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await contactsAPI.updateStatus(id, newStatus);
      // Update local state
      setContacts(contacts.map(c => 
        c._id === id ? { ...c, status: newStatus } : c
      ));
      if (selectedContact?._id === id) {
        setSelectedContact({ ...selectedContact, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact message?')) {
      return;
    }

    try {
      await contactsAPI.delete(id);
      setContacts(contacts.filter(c => c._id !== id));
      if (selectedContact?._id === id) {
        setSelectedContact(null);
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Failed to delete contact');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'new': return 'status-new';
      case 'read': return 'status-read';
      case 'replied': return 'status-replied';
      case 'archived': return 'status-archived';
      default: return '';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Loading contacts...</div>;
  }

  return (
    <div className="contacts-page">
      <div className="contacts-header">
        <h1>Contact Messages</h1>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({contacts.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'new' ? 'active' : ''}`}
            onClick={() => setFilter('new')}
          >
            New
          </button>
          <button 
            className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
            onClick={() => setFilter('read')}
          >
            Read
          </button>
          <button 
            className={`filter-btn ${filter === 'replied' ? 'active' : ''}`}
            onClick={() => setFilter('replied')}
          >
            Replied
          </button>
          <button 
            className={`filter-btn ${filter === 'archived' ? 'active' : ''}`}
            onClick={() => setFilter('archived')}
          >
            Archived
          </button>
        </div>
      </div>

      {contacts.length === 0 ? (
        <div className="no-contacts">
          <p>No contact messages found.</p>
        </div>
      ) : (
        <div className="contacts-container">
          <div className="contacts-list">
            {contacts.map((contact) => (
              <div 
                key={contact._id}
                className={`contact-card ${selectedContact?._id === contact._id ? 'selected' : ''} ${contact.status === 'new' ? 'unread' : ''}`}
                onClick={() => setSelectedContact(contact)}
              >
                <div className="contact-card-header">
                  <h3>{contact.name}</h3>
                  <span className={`status-badge ${getStatusBadgeClass(contact.status)}`}>
                    {contact.status}
                  </span>
                </div>
                <p className="contact-email">{contact.email}</p>
                <p className="contact-preview">{contact.message.substring(0, 100)}...</p>
                <p className="contact-date">{formatDate(contact.createdAt)}</p>
              </div>
            ))}
          </div>

          {selectedContact && (
            <div className="contact-details">
              <div className="contact-details-header">
                <h2>Message Details</h2>
                <button 
                  className="btn-close"
                  onClick={() => setSelectedContact(null)}
                >
                  ✕
                </button>
              </div>

              <div className="contact-info">
                <div className="info-row">
                  <label>Name:</label>
                  <span>{selectedContact.name}</span>
                </div>
                <div className="info-row">
                  <label>Email:</label>
                  <a href={`mailto:${selectedContact.email}`}>{selectedContact.email}</a>
                </div>
                <div className="info-row">
                  <label>Date:</label>
                  <span>{formatDate(selectedContact.createdAt)}</span>
                </div>
                <div className="info-row">
                  <label>Status:</label>
                  <select 
                    value={selectedContact.status}
                    onChange={(e) => handleStatusChange(selectedContact._id, e.target.value)}
                    className="status-select"
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="message-content">
                <h3>Message:</h3>
                <div className="message-text">
                  {selectedContact.message}
                </div>
              </div>

              <div className="contact-actions">
                <a 
                  href={`mailto:${selectedContact.email}?subject=Re: Your message to The Tropical&body=Hi ${selectedContact.name},%0D%0A%0D%0AThank you for contacting us.%0D%0A%0D%0A`}
                  className="btn btn-primary"
                >
                  📧 Reply via Email
                </a>
                <button 
                  className="btn btn-danger"
                  onClick={() => handleDelete(selectedContact._id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Contacts;
