// Converts { lat, lng } from the client into a GeoJSON Point ([lng, lat] order!).
// Returns null if the input is missing or out of range.
const toPoint = (loc) => {
  if (!loc) return null;
  const lat = Number(loc.lat);
  const lng = Number(loc.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { type: 'Point', coordinates: [lng, lat] };
};

module.exports = { toPoint };
