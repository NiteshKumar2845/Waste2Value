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

  const load = async () => {
    try {
      const [l, p] = await Promise.all([api.get('/listings/mine'), api.get('/passport/me')]);
      setListings(l.data.listings);
      setPassport(p.data.passport);
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
