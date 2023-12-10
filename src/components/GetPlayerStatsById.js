// src/components/PlayerStats.js
import React, { useState } from 'react';
import { fetchPlayerInfo } from '../api';

const GetPlayerStatsById = () => {
  const [fideNumber, setFideNumber] = useState('');
  const [includeHistory, setIncludeHistory] = useState(false);
  const [playerStats, setPlayerStats] = useState(null);

  const handleFetchStats = async () => {
    try {
      const data = await fetchPlayerInfo(fideNumber, includeHistory);
      setPlayerStats(data);
    } catch (error) {
      console.error('Error fetching player stats:', error);
      console.error('Response:', error.response); // Add this line
    }
  };

  return (
    <div>
      <h2>Player Stats</h2>
      <label>
        FIDE Number:
        <input type="text" value={fideNumber} onChange={(e) => setFideNumber(e.target.value)} />
      </label>
      <label>
        Include History:
        <input type="checkbox" checked={includeHistory} onChange={() => setIncludeHistory(!includeHistory)} />
      </label>
      <button onClick={handleFetchStats}>Fetch Stats</button>

      {playerStats && (
        <div>
          <h3>Player Information</h3>
          <pre>{JSON.stringify(playerStats, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default GetPlayerStatsById;
