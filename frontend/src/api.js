const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function getListings() {
  const response = await fetch(`${API_BASE_URL}/listings`);
  if (!response.ok) {
    throw new Error('Failed to fetch listings');
  }
  return response.json();
}

export async function createListing(payload) {
  const response = await fetch(`${API_BASE_URL}/listings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create listing');
  }
  return response.json();
}
