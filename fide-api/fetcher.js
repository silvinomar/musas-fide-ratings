import fetch from 'node-fetch';

export const fetchFideProfile = async (fideId) => {
  const url = `https://ratings.fide.com/profile/${fideId}/chart`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch FIDE profile for ID: ${fideId}`);
  }
  return await response.text();
};
