import { useEffect, useState } from 'react';
import api, { errMsg } from '../../api';
import { inr } from '../../utils/helpers.js';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [collectors, setCollectors] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [s, c] = await Promise.all([api.get('/admin/stats'), api.get('/admin/collectors')]);
      setStats(s.data.stats);
      setCollectors(c.data.collectors);
    } catch (err) {
      setError(errMsg(err));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setVerified = async (id, verified) => {
    try {
      await api.patch(`/admin/collectors/${id}/verify`, { verified });
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <>
      <h1>Admin</h1>
      {error && <div className="alert alert-error">{error}</div>}

      {stats && (
        <div className="grid grid-4">
          <div className="card">
            <div className="muted small">Sellers</div>
            <div className="stat-num">{stats.users}</div>
          </div>
          <div className="card">
            <div className="muted small">Verified collectors</div>
            <div className="stat-num">{stats.collectors}</div>
          </div>
          <div className="card">
            <div className="muted small">Open / completed listings</div>
            <div className="stat-num">
              {stats.openListings} / {stats.completedListings}
            </div>
          </div>
          <div className="card">
            <div className="muted small">Commission earned</div>
            <div className="stat-num">{inr(stats.commissionEarned)}</div>
            <div className="muted small">on {inr(stats.grossValue)} traded</div>
          </div>
        </div>
      )}

      <h2>Collectors</h2>
      {collectors.length === 0 && <p className="muted">No collectors have registered yet.</p>}
      {collectors.map((c) => (
        <div className="card row between" key={c._id}>
          <div>
            <strong>{c.orgName || c.name}</strong>
            <div className="muted small">
              {c.email} {c.phone && `· ${c.phone}`}
            </div>
          </div>
          {c.verified ? (
            <button className="btn btn-sm btn-outline" onClick={() => setVerified(c._id, false)}>
              ✔ Verified · Revoke
            </button>
          ) : (
            <button className="btn btn-sm" onClick={() => setVerified(c._id, true)}>
              Verify collector
            </button>
          )}
        </div>
      ))}
    </>
  );
}
