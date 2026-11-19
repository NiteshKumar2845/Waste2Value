import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { errMsg } from '../api';
import PassportCard from '../components/PassportCard.jsx';

export default function PublicPassport() {
  const { passportId } = useParams();
  const [passport, setPassport] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/passport/public/${passportId}`)
      .then((res) => setPassport(res.data.passport))
      .catch((err) => setError(errMsg(err)));
  }, [passportId]);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!passport) return <p className="muted">Loading…</p>;

  return <PassportCard passport={passport} />;
}
