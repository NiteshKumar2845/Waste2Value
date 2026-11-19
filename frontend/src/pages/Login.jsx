import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg } from '../api.js';

const validEmail = (value) => /^\S+@\S+\.\S+$/.test(value);

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: name === 'email' ? value.trim() : value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const nextErrors = {};
    const email = form.email.trim();
    if (!email) nextErrors.email = 'Email is required.';
    else if (!validEmail(email)) nextErrors.email = 'Enter a valid email address.';
    if (!form.password) nextErrors.password = 'Password is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setError('');
    setBusy(true);
    try {
      await login(email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card form narrow" onSubmit={onSubmit} noValidate>
      <h2>Welcome back</h2>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      <label htmlFor="login-email">Email</label>
      <input id="login-email" name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'login-email-error' : undefined} />
      {errors.email && <small className="field-error" id="login-email-error">{errors.email}</small>}
      <label htmlFor="login-password">Password</label>
      <input id="login-password" name="password" type="password" autoComplete="current-password" value={form.password} onChange={onChange} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'login-password-error' : undefined} />
      {errors.password && <small className="field-error" id="login-password-error">{errors.password}</small>}
      <button className="btn" disabled={busy}>{busy ? 'Signing in…' : 'Login'}</button>
      <p className="muted small">New here? <Link to="/register">Create an account</Link></p>
    </form>
  );
}
