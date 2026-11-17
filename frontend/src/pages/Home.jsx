import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import HowItWorks from '../components/home/HowItWorks.jsx';
import RateCard from '../components/home/RateCard.jsx';

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
          <Link to="/register" className="btn">Start recycling</Link>
          <Link to="/login" className="btn btn-outline">I have an account</Link>
        </div>
      </section>
      <HowItWorks />
      <RateCard rates={rates} />
    </>
  );
}
