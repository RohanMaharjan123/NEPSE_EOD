// lib/api.js
export async function fetchNepseData() {
  const response = await fetch('http://localhost:8000/api/nepse/');
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
}
