import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg } from '../api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card form narrow" onSubmit={onSubmit}>
      <h2>Welcome back</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <label>
        Email
        <input name="email" type="email" value={form.email} onChange={onChange} required />
      </label>
      <label>
        Password
        <input name="password" type="password" value={form.password} onChange={onChange} required />
      </label>
      <button className="btn" disabled={busy}>
        {busy ? 'Signing in…' : 'Login'}
      </button>
      <p className="muted small">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </form>
  );
}
