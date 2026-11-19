import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import HowItWorks from '../components/home/HowItWorks.jsx';
import RateCard from '../components/home/RateCard.jsx';

export default function Home() {
  const [rates, setRates] = useState(null);
  const [ratesError, setRatesError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/meta/rates')
      .then(({ data }) => { if (active) setRates(data.rates); })
      .catch(() => { if (active) setRatesError('Indicative rates are temporarily unavailable.'); });
    return () => { active = false; };
  }, []);

  return (
    <>
      <section className="hero">
        <h1>Turn your waste into value.</h1>
        <p>Sell recyclables and e-waste to verified local collectors at a fair price, and build a Waste Passport that tracks your impact.</p>
        <div className="row center">
          <Link to="/register" className="btn">Start recycling</Link>
          <Link to="/login" className="btn btn-outline">I have an account</Link>
        </div>
      </section>
      <HowItWorks />
      <RateCard rates={rates} />
      {ratesError && <p className="muted small" role="status">{ratesError}</p>}
    </>
  );
}
