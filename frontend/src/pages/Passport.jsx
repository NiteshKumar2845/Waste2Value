import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import PassportCard from '../components/PassportCard.jsx';

export default function Passport() {
  const [passport, setPassport] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api
      .get('/passport/me')
      .then((res) => setPassport(res.data.passport))
      .catch((err) => setError(errMsg(err)));
  }, []);

  const shareUrl = passport ? `${window.location.origin}/passport/${passport.passportId}` : '';

  const copy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!passport) return <p className="muted">Loading…</p>;

  return (
    <>
      <PassportCard passport={passport} />
      <div className="card row between">
        <div>
          <strong>Share your impact</strong>
          <div className="muted small">Your public link shows impact only, never your earnings.</div>
          <div className="small">{shareUrl}</div>
        </div>
        <button className="btn btn-sm" onClick={copy}>
          {copied ? 'Copied ✓' : 'Copy link'}
        </button>
      </div>
    </>
  );
}
