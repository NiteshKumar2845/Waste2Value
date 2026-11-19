import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg } from '../api.js';

const roles = ['user', 'business', 'collector'];
const validEmail = (value) => /^\S+@\S+\.\S+$/.test(value);

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user', phone: '', orgName: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const needsOrg = form.role === 'business' || form.role === 'collector';

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: name === 'email' ? value.trim() : value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setError('');
    setSuccess('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Name is required.';
    const email = form.email.trim();
    if (!email) nextErrors.email = 'Email is required.';
    else if (!validEmail(email)) nextErrors.email = 'Enter a valid email address.';
    if (form.password.length < 6) nextErrors.password = 'Password must be at least 6 characters.';
    if (!roles.includes(form.role)) nextErrors.role = 'Choose a supported account type.';
    if ((form.role === 'business' || form.role === 'collector') && !form.orgName.trim()) nextErrors.orgName = 'Organisation name is required for this account type.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setError('');
    setSuccess('');
    setBusy(true);
    try {
      await register({ ...form, name: form.name.trim(), email, orgName: form.orgName.trim(), phone: form.phone.trim() });
      setSuccess('Your account was created successfully.');
      navigate('/dashboard');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card form narrow" onSubmit={onSubmit} noValidate>
      <h2>Create your account</h2>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {success && <div className="alert alert-success" role="status">{success}</div>}
      <label htmlFor="register-role">I am a…</label>
      <select id="register-role" name="role" value={form.role} onChange={onChange} aria-invalid={Boolean(errors.role)} aria-describedby={errors.role ? 'register-role-error' : undefined}>
        <option value="user">Household (I have waste to sell)</option>
        <option value="business">Business / institution (I have waste to sell)</option>
        <option value="collector">Recycler / NGO / scrap collector</option>
      </select>
      {errors.role && <small className="field-error" id="register-role-error">{errors.role}</small>}
      {form.role === 'collector' && <div className="alert alert-info">Collector accounts are reviewed by an admin before they can accept pickups.</div>}
      <label htmlFor="register-name">Your name</label>
      <input id="register-name" name="name" autoComplete="name" value={form.name} onChange={onChange} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'register-name-error' : undefined} />
      {errors.name && <small className="field-error" id="register-name-error">{errors.name}</small>}
      {needsOrg && <>
        <label htmlFor="register-org">Organisation name</label>
        <input id="register-org" name="orgName" value={form.orgName} onChange={onChange} aria-invalid={Boolean(errors.orgName)} aria-describedby={errors.orgName ? 'register-org-error' : undefined} />
        {errors.orgName && <small className="field-error" id="register-org-error">{errors.orgName}</small>}
      </>}
      <label htmlFor="register-email">Email</label>
      <input id="register-email" name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'register-email-error' : undefined} />
      {errors.email && <small className="field-error" id="register-email-error">{errors.email}</small>}
      <label htmlFor="register-phone">Phone</label>
      <input id="register-phone" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={onChange} />
      <label htmlFor="register-password">Password (min 6 characters)</label>
      <input id="register-password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={onChange} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'register-password-error' : undefined} />
      {errors.password && <small className="field-error" id="register-password-error">{errors.password}</small>}
      <button className="btn" disabled={busy}>{busy ? 'Creating…' : 'Sign up'}</button>
      <p className="muted small">Already registered? <Link to="/login">Login</Link></p>
    </form>
  );
}
