import { CATEGORY_ICONS, inr } from '../../utils/helpers.js';

export default function RateCard({ rates }) {
  if (!rates || Object.keys(rates).length === 0) return null;

  return (
    <section aria-labelledby="rate-card-heading">
      <h2 id="rate-card-heading">Indicative rate card</h2>
      <div className="chips">
        {Object.entries(rates).map(([category, rate]) => (
          <span className="chip" key={category}>
            {CATEGORY_ICONS[category]} {category} · {inr(rate)}/kg
          </span>
        ))}
      </div>
      <p className="muted small">Final price depends on the verified weight and quality at pickup.</p>
    </section>
  );
}
