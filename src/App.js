import React from 'react';
import PlayerStats from './components/PlayerStats';
import musasData from './data/musas-data.json';

function App() {

  const lastUpdate = Object.values(musasData)?.[0]?.fetchDate || null;
  // Format date "YYYY-MM-DD"
  const formattedDate = lastUpdate ? new Date(lastUpdate).toISOString().split('T')[0] : 'N/A';

  return (
    <div>
      <PlayerStats />
      <footer>
        <p>
          FIDE ratings tracker for <a href="https://espacomusas.pt/" target='_blank' rel='noreferrer'>Musas</a> chess players
          <span className="separator">|</span>
          Built by <a href="https://github.com/silvinomar" target="_blank" rel="noreferrer">silvinomar</a>
        </p>
        <p className="last-update">Updated {formattedDate}</p>
      </footer>
    </div>
  );
}

export default App;
