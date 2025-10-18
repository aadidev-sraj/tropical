import { useState, useEffect } from 'react';
import { featuredAPI, uploadAPI } from '../utils/api';
import './Featured.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Featured() {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    images: [],
    active: true
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeaturedItems();
  }, []);

  const fetchFeaturedItems = async () => {
    try {
      const response = await featuredAPI.getAll();
      setFeaturedItems(response.data.data || []);
    } catch (error) {
      console.error('Error fetching featured items:', error);
      setError('Failed to load featured items');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const response = await uploadAPI.multiple(files);
      const imageUrls = response.data.urls.map(url => `${API_URL}${url}`);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls]
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.images.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    try {
      if (editingItem) {
        await featuredAPI.update(editingItem._id, formData);
      } else {
        await featuredAPI.create(formData);
      }
      fetchFeaturedItems();
      closeModal();
    } catch (error) {
      console.error('Error saving featured item:', error);
      setError(error.response?.data?.message || 'Failed to save featured item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      images: item.images || [],
      active: item.active !== undefined ? item.active : true
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this wheel item?')) return;

    try {
      await featuredAPI.delete(id);
      fetchFeaturedItems();
    } catch (error) {
      console.error('Error deleting featured item:', error);
      alert('Failed to delete featured item');
    }
  };

  const toggleActive = async (item) => {
    try {
      await featuredAPI.update(item._id, { active: !item.active });
      fetchFeaturedItems();
    } catch (error) {
      console.error('Error toggling active status:', error);
      alert('Failed to update status');
    }
  };

  const openModal = () => {
    setEditingItem(null);
    setFormData({ images: [], active: true });
    setShowModal(true);
    setError('');
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({ images: [], active: true });
    setError('');
  };

  if (loading) {
    return <div className="loading">Loading wheel items...</div>;
  }

  return (
    <div className="featured-page">
      <div className="page-header">
        <h1>Wheel Items (Featured)</h1>
        <button onClick={openModal} className="btn btn-primary">
          + Add Wheel Item
        </button>
      </div>

      <p className="page-description">
        Manage the images that appear in the spinning wheel on your website.
      </p>

      {featuredItems.length === 0 ? (
        <div className="empty-state">
          <p>No wheel items yet. Create your first one!</p>
        </div>
      ) : (
        <div className="featured-grid">
          {featuredItems.map((item) => (
            <div key={item._id} className="featured-card">
              <div className="featured-images">
                {item.images && item.images.length > 0 ? (
                  <div className="image-carousel">
                    {item.images.map((img, index) => (
                      <img key={index} src={img} alt={`Wheel item ${index + 1}`} />
                    ))}
                  </div>
                ) : (
                  <div className="no-image">No Images</div>
                )}
              </div>
              <div className="featured-info">
                <div className="featured-meta">
                  <span className="image-count">{item.images?.length || 0} image(s)</span>
                  <span className={`status-badge ${item.active ? 'active' : 'inactive'}`}>
                    {item.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="featured-actions">
                <button
                  onClick={() => toggleActive(item)}
                  className={`btn ${item.active ? 'btn-secondary' : 'btn-success'}`}
                >
                  {item.active ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => handleEdit(item)} className="btn btn-secondary">
                  Edit
                </button>
                <button onClick={() => handleDelete(item._id)} className="btn btn-danger">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? 'Edit Wheel Item' : 'Add Wheel Item'}</h2>
              <button onClick={closeModal} className="close-btn">&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  />
                  {' '}Active (show in wheel)
                </label>
              </div>

              <div className="form-group">
                <label>Images *</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                {uploading && <p>Uploading...</p>}
                <p className="help-text">Upload images for the wheel. Multiple images can be added.</p>
                <div className="image-preview">
                  {formData.images.map((img, index) => (
                    <div key={index} className="preview-item">
                      <img src={img} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="remove-image-btn"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {error && <div className="error">{error}</div>}

              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Featured;
