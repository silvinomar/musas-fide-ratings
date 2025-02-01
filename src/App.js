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
        <p>User interface to display FIDE ratings from <a href="https://espacomusas.pt/" target='_blank' rel='noreferrer'>Musas</a> players by <a href="https://github.com/silvinomar" target="_blank" rel="noreferrer">silvinomar</a>.</p>
        <p>Data retrieved with the <a href="https://github.com/xRuiAlves/fide-ratings-scraper" target='_blank' rel="noreferrer">FIDE ratings scraper</a> by Rui Alves. </p>
        <p>Last update: <b>{formattedDate}</b></p>
      </footer>
    </div>
  );
}

export default App;
