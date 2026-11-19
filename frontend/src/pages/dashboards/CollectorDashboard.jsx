import { useEffect, useState } from 'react';
import api, { errMsg } from '../../api';
import { useAuth } from '../../context/AuthContext.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { CATEGORY_ICONS, fmtDateTime, getBrowserLocation, inr } from '../../utils/helpers.js';

export default function CollectorDashboard() {
  const { user, setUser } = useAuth();
  const [rates, setRates] = useState({});
  const [tab, setTab] = useState('nearby');
  const [nearby, setNearby] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [radius, setRadius] = useState(user.serviceRadiusKm || 10);
  const [weights, setWeights] = useState({}); // listingId -> { category: kg }
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const hasLocation = !!user.location;

  const load = async () => {
    setError('');
    if (!user.verified) {
      setAssigned([]);
      setNearby([]);
      setLoading(false);
      return;
    }
    try {
      const calls = [api.get('/listings/assigned')];
      if (hasLocation) calls.push(api.get('/listings/nearby'));
      const [a, n] = await Promise.all(calls);
      setAssigned(a.data.listings);
      setNearby(n ? n.data.listings : []);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get('/meta/rates').then((res) => setRates(res.data.rates)).catch((err) => setError(errMsg(err)));
  }, []);

  useEffect(() => {
    load();
  }, [user.verified, hasLocation, user.serviceRadiusKm]);

  const saveLocation = async () => {
    setError('');
    try {
      const location = await getBrowserLocation();
      const { data } = await api.put('/auth/profile', { location, serviceRadiusKm: Number(radius) });
      setUser(data.user);
      setMessage('Service area saved.');
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const accept = async (id) => {
    setError('');
    try {
      await api.patch(`/listings/${id}/accept`, {});
      setMessage('Pickup accepted. Find it under "My pickups".');
      setTab('mine');
      load();
    } catch (err) {
      setError(errMsg(err));
      load();
    }
  };

  const setKg = (listing, category, value) =>
    setWeights({ ...weights, [listing._id]: { ...(weights[listing._id] || {}), [category]: value } });

  const kgFor = (listing, item) => {
    const entered = weights[listing._id] && weights[listing._id][item.category];
    return entered !== undefined ? entered : item.estimatedKg;
  };

  const liveValue = (listing) =>
    listing.items.reduce((sum, i) => sum + (Number(kgFor(listing, i)) || 0) * (rates[i.category] || 0), 0);

  const verify = async (listing) => {
    setError('');
    try {
      const items = listing.items.map((i) => ({ category: i.category, actualKg: Number(kgFor(listing, i)) }));
      const { data } = await api.patch(`/listings/${listing._id}/complete`, { items });
      setMessage(`Verified. ${inr(data.payout)} credited to the seller (platform fee ${inr(data.commission)}).`);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const open = assigned.filter((l) => l.status === 'accepted');
  const done = assigned.filter((l) => l.status !== 'accepted');

  return (
    <>
      <h1>{user.orgName || user.name}</h1>

      {!user.verified && (
        <div className="alert alert-info">
          ⏳ Your account is waiting for admin verification. You will be able to accept pickups once approved.
        </div>
      )}
      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}
      {loading && <p className="muted" role="status">Loading collection information…</p>}

      <div className="card">
        <strong>Service area</strong>
        <p className="muted small">
          {hasLocation
            ? `Location saved. You see open listings within ${user.serviceRadiusKm} km.`
            : 'Set your location to see listings near you.'}
        </p>
        <div className="row">
          <label className="inline">
            Radius (km)
            <input type="number" min="1" max="100" value={radius} onChange={(e) => setRadius(e.target.value)} />
          </label>
          <button className="btn btn-sm" onClick={saveLocation}>
            📍 Use my current location
          </button>
        </div>
      </div>

      <div className="tabs">
        <button className={tab === 'nearby' ? 'tab active' : 'tab'} onClick={() => setTab('nearby')}>
          Nearby listings ({nearby.length})
        </button>
        <button className={tab === 'mine' ? 'tab active' : 'tab'} onClick={() => setTab('mine')}>
          My pickups ({assigned.length})
        </button>
      </div>

      {tab === 'nearby' && (
        <>
          {!loading && !error && nearby.length === 0 && <p className="muted">No open listings in your area right now.</p>}
          {nearby.map((l) => (
            <div className="card" key={l._id}>
              <div className="chips">
                {l.items.map((i) => (
                  <span className="chip" key={i.category}>
                    {CATEGORY_ICONS[i.category]} {i.category} · ~{i.estimatedKg} kg
                  </span>
                ))}
              </div>
              <p className="small">📍 {l.address}</p>
              <p className="small">
                🗓️ Requested: {fmtDateTime(l.scheduledAt)} · Seller: {l.user?.name}
              </p>
              <div className="row between">
                <strong>Est. value {inr(l.estimatedValue)}</strong>
                <button className="btn btn-sm" onClick={() => accept(l._id)}>
                  Accept pickup
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {tab === 'mine' && (
        <>
          {!loading && !error && assigned.length === 0 && <p className="muted">You have not accepted any pickups yet.</p>}

          {open.map((l) => (
            <div className="card" key={l._id}>
              <div className="row between">
                <StatusBadge status={l.status} />
                <span className="small muted">
                  {l.user?.name} {l.user?.phone && `· ${l.user.phone}`}
                </span>
              </div>
              <p className="small">📍 {l.address}</p>
              <p className="small">🗓️ {fmtDateTime(l.scheduledAt)}</p>

              <strong className="small">Weigh on site, then confirm actual weights:</strong>
              {l.items.map((i) => (
                <label className="inline" key={i.category}>
                  {CATEGORY_ICONS[i.category]} {i.category} (kg)
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={kgFor(l, i)}
                    onChange={(e) => setKg(l, i.category, e.target.value)}
                  />
                </label>
              ))}
              <div className="row between">
                <strong>Final value: {inr(liveValue(l))}</strong>
                <button className="btn btn-sm" onClick={() => verify(l)}>
                  ✅ Verify weight &amp; pay
                </button>
              </div>
            </div>
          ))}

          {done.map((l) => (
            <div className="card" key={l._id}>
              <div className="row between">
                <StatusBadge status={l.status} />
                <span className="small muted">{fmtDateTime(l.completedAt || l.updatedAt)}</span>
              </div>
              <div className="chips">
                {l.items.map((i) => (
                  <span className="chip" key={i.category}>
                    {CATEGORY_ICONS[i.category]} {i.category} · {i.actualKg ?? i.estimatedKg} kg
                  </span>
                ))}
              </div>
              {l.status === 'completed' && <p className="small">Paid {inr(l.finalValue)} · fee {inr(l.commission)}</p>}
            </div>
          ))}
        </>
      )}
    </>
  );
}
