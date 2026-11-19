import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api, { errMsg } from '../api.js';
import { getBrowserLocation } from '../utils/helpers.js';

export default function Settings() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user.name || '',
    phone: user.phone || '',
    address: user.address || '',
    orgName: user.orgName || '',
    serviceRadiusKm: user.serviceRadiusKm || 10,
  });
  const [location, setLocation] = useState(user.location || null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const updateLocation = async () => {
    setError('');
    try {
      setLocation(await getBrowserLocation());
      setMessage('Current location is ready to save.');
    } catch (locationError) {
      setError(locationError.message);
    }
  };

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        orgName: form.orgName.trim(),
      };
      if (user.role === 'collector') {
        payload.serviceRadiusKm = Number(form.serviceRadiusKm);
        if (location) payload.location = location;
      }
      const { data } = await api.put('/auth/profile', payload);
      setUser(data.user);
      setForm((current) => ({ ...current, ...data.user }));
      setLocation(data.user.location || null);
      setMessage('Profile saved.');
    } catch (saveError) {
      setError(errMsg(saveError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card form narrow" onSubmit={save}>
      <h1>Profile settings</h1>
      <p className="muted small">Update the profile details used across your Waste2Value account.</p>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {message && <div className="alert alert-success" role="status">{message}</div>}
      <label>Name<input name="name" value={form.name} onChange={update} maxLength={100} required /></label>
      <label>Email<input value={user.email || ''} type="email" disabled /></label>
      <label>Phone<input name="phone" value={form.phone} onChange={update} maxLength={40} /></label>
      {['business', 'collector'].includes(user.role) && <label>Organisation name<input name="orgName" value={form.orgName} onChange={update} maxLength={120} /></label>}
      {user.role !== 'collector' && <label>Address<textarea name="address" value={form.address} onChange={update} rows="3" maxLength={300} /></label>}
      {user.role === 'collector' && (
        <>
          <label>Service radius (km)<input name="serviceRadiusKm" type="number" min="1" max="100" value={form.serviceRadiusKm} onChange={update} required /></label>
          <div className="row between"><span className="small muted">{location ? 'Service location ready' : 'No service location saved'}</span><button type="button" className="btn btn-sm btn-outline" onClick={updateLocation}>Use current location</button></div>
        </>
      )}
      <button className="btn" disabled={busy || !form.name.trim()}>{busy ? 'Saving…' : 'Save profile'}</button>
    </form>
  );
}
