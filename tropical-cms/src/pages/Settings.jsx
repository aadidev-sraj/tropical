import { useState, useEffect } from 'react';
import api from '../utils/api';
import './Settings.css';

function Settings() {
  const [form, setForm] = useState({
    shippingFee: 0,
    shippingFeeType: 'fixed',
    customizationFee: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success'|'error', text }

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      const data = res.data.data;
      setForm({
        shippingFee: data.shippingFee ?? 0,
        shippingFeeType: data.shippingFeeType ?? 'fixed',
        customizationFee: data.customizationFee ?? 0,
      });
    } catch (err) {
      console.error('Failed to load settings', err);
      setMessage({ type: 'error', text: 'Failed to load current settings.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      await api.put('/settings', {
        shippingFee: form.shippingFee,
        shippingFeeType: form.shippingFeeType,
        customizationFee: form.customizationFee,
      });
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save settings.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading settings...</div>;
  }

  const isPercentage = form.shippingFeeType === 'percentage';

  return (
    <div className="settings-page">
      <h1>Store Settings</h1>
      <p className="settings-subtitle">
        Configure fees that will be applied at checkout for all customers.
      </p>

      <form onSubmit={handleSave} className="settings-form">

        {/* ── Shipping Fee ───────────────────────────── */}
        <section className="settings-section">
          <h2>Shipping Fee</h2>

          <div className="fee-type-toggle">
            <label className={`toggle-option ${form.shippingFeeType === 'fixed' ? 'active' : ''}`}>
              <input
                type="radio"
                name="shippingFeeType"
                value="fixed"
                checked={form.shippingFeeType === 'fixed'}
                onChange={handleChange}
              />
              <span>Fixed (₹)</span>
            </label>
            <label className={`toggle-option ${form.shippingFeeType === 'percentage' ? 'active' : ''}`}>
              <input
                type="radio"
                name="shippingFeeType"
                value="percentage"
                checked={form.shippingFeeType === 'percentage'}
                onChange={handleChange}
              />
              <span>Percentage (%)</span>
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="shippingFee">
              {isPercentage ? 'Shipping Rate (%)' : 'Shipping Fee (₹)'}
            </label>
            <div className="input-with-unit">
              <span className="unit-prefix">{isPercentage ? '%' : '₹'}</span>
              <input
                id="shippingFee"
                name="shippingFee"
                type="number"
                min="0"
                max={isPercentage ? 100 : undefined}
                step="0.01"
                value={form.shippingFee}
                onChange={handleChange}
              />
            </div>
            <p className="field-hint">
              {isPercentage
                ? `Shipping = ${form.shippingFee}% of the order subtotal. E.g. for a ₹500 order, shipping = ₹${((500 * form.shippingFee) / 100).toFixed(2)}.`
                : `A flat ₹${form.shippingFee} is added to every order, regardless of order size.`}
            </p>
          </div>
        </section>

        {/* ── Customization Fee ──────────────────────── */}
        <section className="settings-section">
          <h2>Customization Fee</h2>
          <div className="form-group">
            <label htmlFor="customizationFee">Fee per customized item (₹)</label>
            <div className="input-with-unit">
              <span className="unit-prefix">₹</span>
              <input
                id="customizationFee"
                name="customizationFee"
                type="number"
                min="0"
                step="0.01"
                value={form.customizationFee}
                onChange={handleChange}
              />
            </div>
            <p className="field-hint">
              Added once per order if the customer uploaded a custom design. Currently ₹{form.customizationFee}.
            </p>
          </div>
        </section>

        {/* ── Feedback & Submit ─────────────────────── */}
        {message && (
          <div className={`settings-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <button type="submit" className="btn btn-primary save-btn" disabled={saving}>
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}

export default Settings;
