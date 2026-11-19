import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../../api';
import { useAuth } from '../../context/AuthContext.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { CATEGORY_ICONS, fmtDateTime, inr, localToISO } from '../../utils/helpers.js';

export default function UserDashboard() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [passport, setPassport] = useState(null);
  const [error, setError] = useState('');
  const [newTime, setNewTime] = useState({}); // listingId -> datetime-local value

  const [coins, setCoins] = useState(user?.coins || 0);
  const [upiId, setUpiId] = useState('');
  const [redeemAmount, setRedeemAmount] = useState(1000);
  const [redeemMsg, setRedeemMsg] = useState('');

  const load = async () => {
    try {
      const [l, p, me] = await Promise.all([
        api.get('/listings/mine'),
        api.get('/passport/me'),
        api.get('/auth/me'),
      ]);
      setListings(l.data.listings);
      setPassport(p.data.passport);
      setCoins(me.data.user?.coins || 0);
    } catch (err) {
      setError(errMsg(err));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const reschedule = async (id) => {
    setError('');
    try {
      await api.patch(`/listings/${id}/schedule`, { scheduledAt: localToISO(newTime[id]) });
      setNewTime({ ...newTime, [id]: '' });
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const cancel = async (id) => {
    if (!window.confirm('Cancel this listing?')) return;
    try {
      await api.patch(`/listings/${id}/cancel`);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const handleRedeem = async (e) => {
    e.preventDefault();
    setRedeemMsg('');
    try {
      const { data } = await api.post('/auth/redeem', {
        upiId,
        coins: redeemAmount,
      });
      setCoins(data.coins);
      setRedeemMsg(data.message);
      setUpiId('');
    } catch (err) {
      setRedeemMsg(err.response?.data?.message || 'Transfer failed');
    }
  };

  return (
    <>
      <div className="row between">
        <h1>Hi, {user.name} 👋</h1>
        <Link to="/new-listing" className="btn">
          + Sell waste
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {passport && (
        <div className="grid grid-4">
          <div className="card">
            <div className="muted small">Wallet balance</div>
            <div className="stat-num">{inr(passport.walletBalance)}</div>
          </div>
          <div className="card">
            <div className="muted small">Recycled</div>
            <div className="stat-num">{passport.totalKg} kg</div>
          </div>
          <div className="card">
            <div className="muted small">Green Score</div>
            <div className="stat-num">
              {passport.greenScore} <span className="small muted">· {passport.level}</span>
            </div>
          </div>
          <div className="card">
            <div className="muted small">CO₂ avoided (est.)</div>
            <div className="stat-num">{passport.impact.co2SavedKg} kg</div>
            <Link to="/passport" className="small">
              View my Waste Passport →
            </Link>
          </div>
        </div>
      )}

      <div style={{ background: '#fff', padding: '16px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #d1fae5' }}>
        <h3>🪙 My Waste Coins: {coins} (₹{(coins / 1000).toFixed(2)})</h3>
        <p style={{ fontSize: '13px', color: '#555' }}>1000 Coins = ₹1 | Instant UPI Transfer</p>

        <form onSubmit={handleRedeem} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
          <input
            type="text"
            placeholder="Enter UPI ID (e.g. nitesh@ybl)"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            required
          />
          <input
            type="number"
            min="1000"
            step="1000"
            value={redeemAmount}
            onChange={(e) => setRedeemAmount(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary">
            Transfer to UPI
          </button>
        </form>

        {redeemMsg && <p style={{ marginTop: '10px', color: '#047857', fontWeight: 'bold' }}>{redeemMsg}</p>}
      </div>

      <h2>My listings</h2>
      {listings.length === 0 && (
        <p className="muted">
          No listings yet. <Link to="/new-listing">Create your first one</Link>.
        </p>
      )}

      {listings.map((l) => {
        const editable = ['open', 'accepted'].includes(l.status);
        return (
          <div className="card" key={l._id}>
            <div className="row between">
              <StatusBadge status={l.status} />
              <span className="muted small">Listed {fmtDateTime(l.createdAt)}</span>
            </div>

            <div className="chips">
              {l.items.map((i) => (
                <span className="chip" key={i.category}>
                  {CATEGORY_ICONS[i.category]} {i.category} · {l.status === 'completed' ? i.actualKg : i.estimatedKg} kg
                </span>
              ))}
            </div>

            <p className="small">📍 {l.address}</p>
            <p className="small">🗓️ Pickup: {fmtDateTime(l.scheduledAt)}</p>
            {l.collector && (
              <p className="small">
                🚚 Collector: {l.collector.orgName || l.collector.name}
                {l.collector.phone && ` · ${l.collector.phone}`}
              </p>
            )}
            <p>
              {l.status === 'completed' ? (
                <strong>Paid: {inr(l.finalValue)}</strong>
              ) : (
                <span>Estimated value: {inr(l.estimatedValue)}</span>
              )}
            </p>

            {editable && (
              <div className="row">
                <input
                  type="datetime-local"
                  value={newTime[l._id] || ''}
                  onChange={(e) => setNewTime({ ...newTime, [l._id]: e.target.value })}
                />
                <button className="btn btn-sm" disabled={!newTime[l._id]} onClick={() => reschedule(l._id)}>
                  {l.scheduledAt ? 'Reschedule' : 'Set pickup time'}
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => cancel(l._id)}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}