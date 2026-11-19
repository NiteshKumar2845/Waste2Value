import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import { CATEGORY_ICONS, getBrowserLocation, inr, localToISO } from '../utils/helpers.js';

export default function NewListing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [rates, setRates] = useState({});
  const [items, setItems] = useState([{ category: 'plastic', estimatedKg: '' }]);
  const [address, setAddress] = useState(user.address || '');
  const [coords, setCoords] = useState({ lat: '', lng: '' });
  const [scheduledAt, setScheduledAt] = useState('');
  const [description, setDescription] = useState('');
  const [nearbyCount, setNearbyCount] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/meta/rates').then((res) => setRates(res.data.rates));
  }, []);

  const estimate = items.reduce((sum, i) => sum + (Number(i.estimatedKg) || 0) * (rates[i.category] || 0), 0);

  const updateItem = (index, field, value) =>
    setItems(items.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  const addItem = () => setItems([...items, { category: 'paper', estimatedKg: '' }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const checkNearby = async (lat, lng) => {
    try {
      const { data } = await api.get('/collectors/nearby', { params: { lat, lng, radius: 15 } });
      setNearbyCount(data.collectors.length);
    } catch {
      setNearbyCount(null);
    }
  };

  const useMyLocation = async () => {
    setError('');
    try {
      const loc = await getBrowserLocation();
      setCoords({ lat: loc.lat.toFixed(5), lng: loc.lng.toFixed(5) });
      checkNearby(loc.lat, loc.lng);
    } catch (err) {
      setError(err.message);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post('/listings', {
        items: items.map((i) => ({ category: i.category, estimatedKg: Number(i.estimatedKg) })),
        address,
        description,
        location: { lat: Number(coords.lat), lng: Number(coords.lng) },
        scheduledAt: localToISO(scheduledAt),
      });
      navigate('/dashboard');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card form" onSubmit={onSubmit}>
      <h2>Sell your waste</h2>
      {error && <div className="alert alert-error">{error}</div>}

      <h3>1. What do you have?</h3>
      {items.map((item, index) => (
        <div className="row" key={index}>
          <select value={item.category} onChange={(e) => updateItem(index, 'category', e.target.value)}>
            {Object.keys(rates).map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_ICONS[cat]} {cat} ({inr(rates[cat])}/kg)
              </option>
            ))}
          </select>
          <input
            type="number"
            min="0.1"
            step="0.1"
            placeholder="approx kg"
            value={item.estimatedKg}
            onChange={(e) => updateItem(index, 'estimatedKg', e.target.value)}
            required
          />
          {items.length > 1 && (
            <button type="button" className="btn btn-sm btn-outline" onClick={() => removeItem(index)}>
              ✕
            </button>
          )}
        </div>
      ))}
      <button type="button" className="btn btn-sm btn-outline" onClick={addItem}>
        + Add another category
      </button>
      <div className="alert alert-success">
        Estimated value: <strong>{inr(estimate)}</strong>{' '}
        <span className="small">(final amount is set by the verified weight at pickup)</span>
      </div>

      <h3>2. Where should we pick it up?</h3>
      <label>
        Address
        <textarea rows="2" value={address} onChange={(e) => setAddress(e.target.value)} required />
      </label>
      <div className="row">
        <input
          type="number"
          step="any"
          placeholder="Latitude"
          value={coords.lat}
          onChange={(e) => setCoords({ ...coords, lat: e.target.value })}
          required
        />
        <input
          type="number"
          step="any"
          placeholder="Longitude"
          value={coords.lng}
          onChange={(e) => setCoords({ ...coords, lng: e.target.value })}
          required
        />
        <button type="button" className="btn btn-sm" onClick={useMyLocation}>
          📍 Use my location
        </button>
      </div>
      {nearbyCount !== null && (
        <p className="small muted">
          {nearbyCount > 0
            ? `✅ ${nearbyCount} verified collector(s) operate within 15 km of you.`
            : 'No verified collectors found nearby yet — your listing will wait until one joins.'}
        </p>
      )}

      <h3>3. When?</h3>
      <label>
        Preferred pickup time (you can change it later)
        <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
      </label>
      <label>
        Notes for the collector (optional)
        <textarea rows="2" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} />
      </label>

      <button className="btn" disabled={busy}>
        {busy ? 'Posting…' : 'Post listing'}
      </button>
    </form>
  );
}
