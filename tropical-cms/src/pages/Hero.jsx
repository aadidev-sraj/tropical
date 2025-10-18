import { useState, useEffect } from 'react';
import { heroAPI, uploadAPI } from '../utils/api';
import './Hero.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Hero() {
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHero, setEditingHero] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    buttonText: 'Shop Now',
    buttonLink: '/products',
    backgroundImage: '',
    active: true
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHeroes();
  }, []);

  const fetchHeroes = async () => {
    try {
      const response = await heroAPI.getAll();
      setHeroes(response.data.data || []);
    } catch (error) {
      console.error('Error fetching heroes:', error);
      setError('Failed to load hero sections');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadAPI.single(file);
      const imageUrl = `${API_URL}${response.data.url}`;
      setFormData(prev => ({
        ...prev,
        backgroundImage: imageUrl
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingHero) {
        await heroAPI.update(editingHero._id, formData);
      } else {
        await heroAPI.create(formData);
      }
      fetchHeroes();
      closeModal();
    } catch (error) {
      console.error('Error saving hero:', error);
      setError(error.response?.data?.message || 'Failed to save hero section');
    }
  };

  const handleEdit = (hero) => {
    setEditingHero(hero);
    setFormData({
      title: hero.title,
      subtitle: hero.subtitle || '',
      buttonText: hero.buttonText || 'Shop Now',
      buttonLink: hero.buttonLink || '/products',
      backgroundImage: hero.backgroundImage || '',
      active: hero.active !== undefined ? hero.active : true
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this hero section?')) return;

    try {
      await heroAPI.delete(id);
      fetchHeroes();
    } catch (error) {
      console.error('Error deleting hero:', error);
      alert('Failed to delete hero section');
    }
  };

  const openModal = () => {
    setEditingHero(null);
    setFormData({ 
      title: '', 
      subtitle: '', 
      buttonText: 'Shop Now', 
      buttonLink: '/products',
      backgroundImage: '',
      active: true 
    });
    setShowModal(true);
    setError('');
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingHero(null);
    setFormData({ 
      title: '', 
      subtitle: '', 
      buttonText: 'Shop Now', 
      buttonLink: '/products',
      backgroundImage: '',
      active: true 
    });
    setError('');
  };

  if (loading) {
    return <div className="loading">Loading hero sections...</div>;
  }

  return (
    <div className="hero-page">
      <div className="page-header">
        <h1>Hero Section</h1>
        <button onClick={openModal} className="btn btn-primary">
          + Add Hero Section
        </button>
      </div>

      <p className="page-description">
        Manage the hero section that appears at the top of your homepage.
      </p>

      {heroes.length === 0 ? (
        <div className="empty-state">
          <p>No hero sections yet. Create your first one!</p>
        </div>
      ) : (
        <div className="hero-grid">
          {heroes.map((hero) => (
            <div key={hero._id} className="hero-card">
              <div className="hero-preview">
                {hero.backgroundImage ? (
                  <img src={hero.backgroundImage} alt={hero.title} />
                ) : (
                  <div className="no-image">No Background Image</div>
                )}
                <div className="hero-overlay">
                  <h2>{hero.title}</h2>
                  {hero.subtitle && <p>{hero.subtitle}</p>}
                  <button className="preview-btn">{hero.buttonText}</button>
                </div>
              </div>
              <div className="hero-info">
                <div className="hero-meta">
                  <span className={`status-badge ${hero.active ? 'active' : 'inactive'}`}>
                    {hero.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="hero-actions">
                <button onClick={() => handleEdit(hero)} className="btn btn-secondary">
                  Edit
                </button>
                <button onClick={() => handleDelete(hero._id)} className="btn btn-danger">
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
              <h2>{editingHero ? 'Edit Hero Section' : 'Add Hero Section'}</h2>
              <button onClick={closeModal} className="close-btn">&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="form-control"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="subtitle">Subtitle</label>
                <input
                  type="text"
                  id="subtitle"
                  name="subtitle"
                  className="form-control"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="buttonText">Button Text</label>
                <input
                  type="text"
                  id="buttonText"
                  name="buttonText"
                  className="form-control"
                  value={formData.buttonText}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="buttonLink">Button Link</label>
                <input
                  type="text"
                  id="buttonLink"
                  name="buttonLink"
                  className="form-control"
                  value={formData.buttonLink}
                  onChange={handleInputChange}
                  placeholder="/products"
                />
              </div>

              <div className="form-group">
                <label>Background Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                {uploading && <p>Uploading...</p>}
                {formData.backgroundImage && (
                  <div className="image-preview">
                    <img src={formData.backgroundImage} alt="Background preview" />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                  />
                  {' '}Set as active (will deactivate other hero sections)
                </label>
              </div>

              {error && <div className="error">{error}</div>}

              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingHero ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Hero;
