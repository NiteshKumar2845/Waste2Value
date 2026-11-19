import { CATEGORY_ICONS, inr } from '../utils/helpers.js';

export default function PassportCard({ passport }) {
  const p = passport;
  const categories = Object.entries(p.byCategory || {});

  return (
    <div className="passport">
      <div className="passport-head">
        <div>
          <div className="passport-label">WASTE PASSPORT</div>
          <h2>{p.name}'s Waste Passport</h2>
          <div className="passport-id">{p.passportId}</div>
        </div>
        <div className="score">
          <div className="score-num">{p.greenScore}</div>
          <div className="score-label">Green Score</div>
          <div className="level">🏆 {p.level}</div>
        </div>
      </div>

      <div className="passport-stats">
        <div>
          <div className="stat-num">♻️ {p.totalKg} kg</div>
          <div className="muted small">recycled</div>
        </div>
        <div>
          <div className="stat-num">🌳 {p.impact.treesEquivalent}</div>
          <div className="muted small">trees' yearly CO₂ absorption saved</div>
        </div>
        <div>
          <div className="stat-num">🌍 {p.impact.co2SavedKg} kg</div>
          <div className="muted small">CO₂ emissions avoided</div>
        </div>
        {p.totalEarned !== undefined && (
          <div>
            <div className="stat-num">💰 {inr(p.totalEarned)}</div>
            <div className="muted small">earned</div>
          </div>
        )}
        <div>
          <div className="stat-num">🚚 {p.pickups}</div>
          <div className="muted small">pickups completed</div>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="chips">
          {categories.map(([cat, kg]) => (
            <span className="chip" key={cat}>
              {CATEGORY_ICONS[cat]} {cat} · {kg} kg
            </span>
          ))}
        </div>
      )}

      <p className="muted small">
        Impact figures are approximate estimates based on average emission factors, not audited measurements.
      </p>
    </div>
  );
}
