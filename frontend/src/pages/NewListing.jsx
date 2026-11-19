import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { getBrowserLocation, localToISO } from '../utils/helpers.js';

const categories = ['plastic', 'paper', 'cardboard', 'iron', 'aluminium', 'copper', 'ewaste', 'glass'];
const blankItem = () => ({ category: '', estimatedKg: '' });

export default function NewListing() {
  const navigate = useNavigate();
  const [items, setItems] = useState([blankItem()]);
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [location, setLocation] = useState({ lat: '', lng: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);

  const setItem = (index, key, value) => {
    setItems((current) => current.map((item, i) => i === index ? { ...item, [key]: value } : item));
    setErrors((current) => ({ ...current, [`item-${index}-${key}`]: '' }));
  };

  const locate = async () => {
    setLocating(true);
    setError('');
    try {
      const coords = await getBrowserLocation();
      setLocation({ lat: String(coords.lat), lng: String(coords.lng) });
      setErrors((current) => ({ ...current, location: '' }));
    } catch (err) {
      setError(err.message || 'Location access failed. Enter latitude and longitude manually.');
    } finally {
      setLocating(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const next = {};
    if (!items.length) next.items = 'Add at least one waste item.';
    items.forEach((item, index) => {
      if (!categories.includes(item.category)) next[`item-${index}-category`] = 'Choose a valid waste category.';
      const kg = Number(item.estimatedKg);
      if (item.estimatedKg === '' || !Number.isFinite(kg) || kg <= 0) next[`item-${index}-estimatedKg`] = 'Enter a weight greater than 0 kg.';
    });
    if (!address.trim()) next.address = 'Pickup address is required.';
    const lat = Number(location.lat);
    const lng = Number(location.lng);
    if (location.lat === '' || !Number.isFinite(lat) || lat < -90 || lat > 90) next.latitude = 'Latitude must be between -90 and 90.';
    if (location.lng === '' || !Number.isFinite(lng) || lng < -180 || lng > 180) next.longitude = 'Longitude must be between -180 and 180.';
    if (scheduledAt && (!Number.isFinite(new Date(scheduledAt).getTime()) || new Date(scheduledAt).getTime() <= Date.now())) next.scheduledAt = 'Pickup time must be in the future.';
    if (description.length > 500) next.description = 'Description must be 500 characters or fewer.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setError('');
    setSuccess('');
    setBusy(true);
    try {
      await api.post('/listings', {
        items: items.map((item) => ({ category: item.category, estimatedKg: Number(item.estimatedKg) })),
        address: address.trim(), description: description.trim(),
        location: { lat, lng }, scheduledAt: localToISO(scheduledAt),
      });
      setSuccess('Your listing was created successfully.');
      navigate('/dashboard');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card form" onSubmit={onSubmit} noValidate>
      <h2>List your waste</h2>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {success && <div className="alert alert-success" role="status">{success}</div>}
      {items.map((item, index) => <fieldset className="listing-form" key={index}>
        <legend>Waste item {index + 1}</legend>
        <label htmlFor={`item-${index}-category`}>Category</label>
        <select id={`item-${index}-category`} value={item.category} onChange={(e) => setItem(index, 'category', e.target.value)} aria-invalid={Boolean(errors[`item-${index}-category`])} aria-describedby={errors[`item-${index}-category`] ? `item-${index}-category-error` : undefined}>
          <option value="">Select a category</option>{categories.map((category) => <option value={category} key={category}>{category}</option>)}
        </select>
        {errors[`item-${index}-category`] && <small className="field-error" id={`item-${index}-category-error`}>{errors[`item-${index}-category`]}</small>}
        <label htmlFor={`item-${index}-weight`}>Estimated weight (kg)</label>
        <input id={`item-${index}-weight`} type="number" min="0" step="any" value={item.estimatedKg} onChange={(e) => setItem(index, 'estimatedKg', e.target.value)} aria-invalid={Boolean(errors[`item-${index}-estimatedKg`])} aria-describedby={errors[`item-${index}-estimatedKg`] ? `item-${index}-weight-error` : undefined} />
        {errors[`item-${index}-estimatedKg`] && <small className="field-error" id={`item-${index}-weight-error`}>{errors[`item-${index}-estimatedKg`]}</small>}
        {items.length > 1 && <button type="button" className="btn btn-outline" onClick={() => setItems((current) => current.filter((_, i) => i !== index))}>Remove item</button>}
      </fieldset>)}
      <button type="button" className="btn btn-outline" onClick={() => setItems((current) => [...current, blankItem()])}>Add another item</button>
      <label htmlFor="listing-address">Pickup address</label>
      <input id="listing-address" value={address} onChange={(e) => { setAddress(e.target.value); setErrors((current) => ({ ...current, address: '' })); }} aria-invalid={Boolean(errors.address)} aria-describedby={errors.address ? 'listing-address-error' : undefined} />
      {errors.address && <small className="field-error" id="listing-address-error">{errors.address}</small>}
      <div className="row"><button type="button" className="btn btn-outline" onClick={locate} disabled={locating}>{locating ? 'Getting location…' : 'Use my location'}</button></div>
      <div className="form-row">
        <div><label htmlFor="listing-lat">Latitude</label><input id="listing-lat" type="number" min="-90" max="90" step="any" value={location.lat} onChange={(e) => setLocation((current) => ({ ...current, lat: e.target.value }))} aria-invalid={Boolean(errors.latitude)} aria-describedby={errors.latitude ? 'listing-lat-error' : undefined} />{errors.latitude && <small className="field-error" id="listing-lat-error">{errors.latitude}</small>}</div>
        <div><label htmlFor="listing-lng">Longitude</label><input id="listing-lng" type="number" min="-180" max="180" step="any" value={location.lng} onChange={(e) => setLocation((current) => ({ ...current, lng: e.target.value }))} aria-invalid={Boolean(errors.longitude)} aria-describedby={errors.longitude ? 'listing-lng-error' : undefined} />{errors.longitude && <small className="field-error" id="listing-lng-error">{errors.longitude}</small>}</div>
      </div>
      <label htmlFor="listing-time">Pickup time (optional)</label>
      <input id="listing-time" type="datetime-local" value={scheduledAt} onChange={(e) => { setScheduledAt(e.target.value); setErrors((current) => ({ ...current, scheduledAt: '' })); }} aria-invalid={Boolean(errors.scheduledAt)} aria-describedby={errors.scheduledAt ? 'listing-time-error' : undefined} />
      {errors.scheduledAt && <small className="field-error" id="listing-time-error">{errors.scheduledAt}</small>}
      <label htmlFor="listing-description">Description (up to 500 characters)</label>
      <textarea id="listing-description" maxLength={500} value={description} onChange={(e) => { setDescription(e.target.value); setErrors((current) => ({ ...current, description: '' })); }} aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? 'listing-description-error' : undefined} />
      {errors.description && <small className="field-error" id="listing-description-error">{errors.description}</small>}
      <button className="btn" disabled={busy}>{busy ? 'Submitting…' : 'Create listing'}</button>
    </form>
  );
}
