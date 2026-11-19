import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg } from '../api';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    phone: '',
    orgName: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const needsOrg = form.role === 'business' || form.role === 'collector';

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card form narrow" onSubmit={onSubmit}>
      <h2>Create your account</h2>
      {error && <div className="alert alert-error">{error}</div>}

      <label>
        I am a…
        <select name="role" value={form.role} onChange={onChange}>
          <option value="user">Household (I have waste to sell)</option>
          <option value="business">Business / institution (I have waste to sell)</option>
          <option value="collector">Recycler / NGO / scrap collector</option>
        </select>
      </label>

      {form.role === 'collector' && (
        <div className="alert alert-info">Collector accounts are reviewed by an admin before they can accept pickups.</div>
      )}

      <label>
        Your name
        <input name="name" value={form.name} onChange={onChange} required />
      </label>
      {needsOrg && (
        <label>
          Organisation name
          <input name="orgName" value={form.orgName} onChange={onChange} required />
        </label>
      )}
      <label>
        Email
        <input name="email" type="email" value={form.email} onChange={onChange} required />
      </label>
      <label>
        Phone
        <input name="phone" value={form.phone} onChange={onChange} />
      </label>
      <label>
        Password (min 6 characters)
        <input name="password" type="password" minLength={6} value={form.password} onChange={onChange} required />
      </label>

      <button className="btn" disabled={busy}>
        {busy ? 'Creating…' : 'Sign up'}
      </button>
      <p className="muted small">
        Already registered? <Link to="/login">Login</Link>
      </p>
    </form>
  );
}
