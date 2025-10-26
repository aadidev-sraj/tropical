import { useState, useEffect } from 'react';
import { uploadAPI, toImageUrl } from '../utils/api';
import './Products.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Designs API
const designsAPI = {
  getAll: () => fetch(`${API_URL}/api/designs`).then(res => res.json()),
  create: (data) => fetch(`${API_URL}/api/designs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  update: (id, data) => fetch(`${API_URL}/api/designs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  delete: (id) => fetch(`${API_URL}/api/designs/${id}`, {
    method: 'DELETE'
  }).then(res => res.json())
};

function Designs() {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDesign, setEditingDesign] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    category: 'graphic',
    tags: '',
    applicableCategories: ['all'],
    isActive: true
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    try {
      console.log('Fetching designs from API...');
      const response = await designsAPI.getAll();
      console.log('Designs API Response:', response);
      
      const designsData = response.data || [];
      console.log('Setting designs:', designsData);
      setDesigns(designsData);
      setError('');
    } catch (error) {
      console.error('Error fetching designs:', error);
      console.error('Error details:', error.response || error.message);
      setError(`Failed to load designs: ${error.message}`);
      setDesigns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadAPI.single(file);
      // Store relative path, not absolute URL
      const imageUrl = response.data.url;
      setFormData(prev => ({ ...prev, imageUrl }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const toggleCategory = (cat) => {
    setFormData(prev => {
      const categories = prev.applicableCategories.includes(cat)
        ? prev.applicableCategories.filter(c => c !== cat)
        : [...prev.applicableCategories.filter(c => c !== 'all'), cat];
      
      // If no categories selected, default to 'all'
      return {
        ...prev,
        applicableCategories: categories.length === 0 ? ['all'] : categories
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const submitData = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      };

      if (editingDesign) {
        await designsAPI.update(editingDesign._id, submitData);
      } else {
        await designsAPI.create(submitData);
      }
      fetchDesigns();
      closeModal();
    } catch (error) {
      console.error('Error saving design:', error);
      setError(error.response?.data?.message || 'Failed to save design');
    }
  };

  const handleEdit = (design) => {
    setEditingDesign(design);
    setFormData({
      name: design.name,
      description: design.description || '',
      imageUrl: design.imageUrl,
      category: design.category || 'graphic',
      tags: (design.tags || []).join(', '),
      applicableCategories: design.applicableCategories || ['all'],
      isActive: design.isActive !== undefined ? design.isActive : true
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this design?')) return;

    try {
      await designsAPI.delete(id);
      fetchDesigns();
    } catch (error) {
      console.error('Error deleting design:', error);
      alert('Failed to delete design');
    }
  };

  const openModal = () => {
    setEditingDesign(null);
    setFormData({ 
      name: '', 
      description: '', 
      imageUrl: '', 
      category: 'graphic', 
      tags: '', 
      applicableCategories: ['all'],
      isActive: true 
    });
    setShowModal(true);
    setError('');
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDesign(null);
    setFormData({ 
      name: '', 
      description: '', 
      imageUrl: '', 
      category: 'graphic', 
      tags: '', 
      applicableCategories: ['all'],
      isActive: true 
    });
    setError('');
  };

  if (loading) {
    return <div className="loading">Loading designs...</div>;
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Approved Designs</h1>
        <button onClick={openModal} className="btn btn-primary">
          + Add Design
        </button>
      </div>

      <p style={{ marginBottom: '20px', color: '#666' }}>
        Manage graphics that customers can use for product customization
      </p>

      {error && (
        <div className="error" style={{ padding: '15px', marginBottom: '20px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '5px', color: '#c00' }}>
          {error}
        </div>
      )}

      {designs.length === 0 ? (
        <div className="empty-state">
          <p>No designs yet. Create your first approved design!</p>
        </div>
      ) : (
        <div className="products-grid">
          {designs.map((design) => (
            <div key={design._id} className="product-card">
              <div className="product-image">
                {design.imageUrl ? (
                  <img src={toImageUrl(design.imageUrl)} alt={design.name} />
                ) : (
                  <div className="no-image">No Image</div>
                )}
              </div>
              <div className="product-info">
                <h3>{design.name}</h3>
                <p className="product-description">{design.description}</p>
                <p style={{ fontSize: '12px', color: '#888' }}>
                  Category: {design.category}
                  {!design.isActive && <span style={{ color: 'red', marginLeft: '10px' }}>● Inactive</span>}
                </p>
              </div>
              <div className="product-actions">
                <button onClick={() => handleEdit(design)} className="btn btn-secondary">
                  Edit
                </button>
                <button onClick={() => handleDelete(design._id)} className="btn btn-danger">
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
              <h2>{editingDesign ? 'Edit Design' : 'Add Design'}</h2>
              <button onClick={closeModal} className="close-btn">&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Design Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  className="form-control"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="graphic">Graphic</option>
                  <option value="pattern">Pattern</option>
                  <option value="logo">Logo</option>
                  <option value="text">Text</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="tags">Tags (comma-separated)</label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  className="form-control"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="e.g., summer, abstract, cool"
                />
              </div>

              <div className="form-group">
                <label>Applicable Product Categories</label>
                <div className="size-options">
                  {['all', 'tshirts', 'shirts', 'hoodies'].map(cat => (
                    <label key={cat} className="size-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.applicableCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                      />
                      <span className="size-label">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  {' '}Active (visible to customers)
                </label>
              </div>

              <div className="form-group">
                <label>Design Image *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                {uploading && <p>Uploading...</p>}
                {formData.imageUrl && (
                  <div className="image-preview">
                    <div className="preview-item">
                      <img src={toImageUrl(formData.imageUrl)} alt="Design preview" />
                    </div>
                  </div>
                )}
              </div>

              {error && <div className="error">{error}</div>}

              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={!formData.imageUrl}>
                  {editingDesign ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Designs;
