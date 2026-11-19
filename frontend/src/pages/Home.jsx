import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { CATEGORY_ICONS, inr } from '../utils/helpers.js';

const STEPS = [
  ['📸', 'List your waste', 'Choose categories and approximate weight. See an instant value estimate.'],
  ['📍', 'Get matched', 'Verified recyclers, NGOs and scrap collectors near you can accept.'],
  ['🗓️', 'Schedule pickup', 'Pick a time that suits you. Reschedule anytime before pickup.'],
  ['⚖️', 'Weight verified', 'The collector weighs it on-site and confirms the final value.'],
  ['💰', 'Get rewarded', 'Earnings are credited to your wallet and added to your Waste Passport.'],
];

export default function Home() {
  const [rates, setRates] = useState(null);

  useEffect(() => {
    api.get('/meta/rates').then((res) => setRates(res.data.rates)).catch(() => {});
  }, []);

  return (
    <>
      <section className="hero">
        <h1>Turn your waste into value.</h1>
        <p>
          Sell recyclables and e-waste to verified local collectors at a fair price, and build a Waste Passport that
          tracks your impact.
        </p>
        <div className="row center">
          <Link to="/register" className="btn">
            Start recycling
          </Link>
          <Link to="/login" className="btn btn-outline">
            I have an account
          </Link>
        </div>
      </section>

      <section>
        <h2>How it works</h2>
        <div className="grid grid-5">
          {STEPS.map(([icon, title, text], i) => (
            <div className="card" key={title}>
              <div className="big">{icon}</div>
              <strong>
                {i + 1}. {title}
              </strong>
              <p className="muted small">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {rates && (
        <section>
          <h2>Indicative rate card</h2>
          <div className="chips">
            {Object.entries(rates).map(([cat, rate]) => (
              <span className="chip" key={cat}>
                {CATEGORY_ICONS[cat]} {cat} · {inr(rate)}/kg
              </span>
            ))}
          </div>
          <p className="muted small">Final price depends on the verified weight and quality at pickup.</p>
        </section>
      )}
    </>
  );
}
