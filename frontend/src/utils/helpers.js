// Ask the browser for the current position -> { lat, lng }
export const getBrowserLocation = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Geolocation is not supported by your browser'));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => reject(new Error('Could not get your location. Please allow location access or type it in.')),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });

export const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

// <input type="datetime-local"> gives "2026-11-02T10:30" -> ISO string for the API
export const localToISO = (value) => (value ? new Date(value).toISOString() : undefined);

export const CATEGORY_ICONS = {
  plastic: '🧴',
  paper: '📄',
  cardboard: '📦',
  iron: '🔩',
  aluminium: '🥫',
  copper: '🔌',
  ewaste: '💻',
  glass: '🍾',
};
