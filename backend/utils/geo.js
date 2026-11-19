const toPoint = (location) => {
  if (!location) return null;

  let lng;
  let lat;

  if (Array.isArray(location.coordinates) && location.coordinates.length === 2) {
    [lng, lat] = location.coordinates.map(Number);
  } else if (location.lat !== undefined && location.lng !== undefined) {
    lat = Number(location.lat);
    lng = Number(location.lng);
  } else if (location.latitude !== undefined && location.longitude !== undefined) {
    lat = Number(location.latitude);
    lng = Number(location.longitude);
  }

  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

  return {
    type: 'Point',
    coordinates: [lng, lat],
  };
};

module.exports = { toPoint };