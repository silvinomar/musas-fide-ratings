const API_BASE_URL = 'https://fide-ratings-scraper.onrender.com/';

export const fetchPlayerInfo = async (fideNumber, includeHistory) => {
  const response = await fetch(`${API_BASE_URL}/player/${fideNumber}/info?include_history=${includeHistory}`);
  return response.json();
};
