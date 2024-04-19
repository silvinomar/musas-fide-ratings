import React from 'react';
import PlayerStats from './components/PlayerStats';

function App() {
  return (
    <div>
      <PlayerStats />
      <footer>
        <p>User interface to display FIDE ratings from <a href="http://musas.pegada.net/" target='_blank' rel='noreferrer'>Musas</a> players by <a href="https://github.com/silvinomar" target="_blank" rel="noreferrer">silvinomar</a>.</p>
        <p>Data retrieved with the <a href="https://github.com/xRuiAlves/fide-ratings-scraper" target='_blank' rel="noreferrer">FIDE ratings scraper</a> by Rui Alves. </p>
      </footer>
    </div>
  );
}

export default App;
