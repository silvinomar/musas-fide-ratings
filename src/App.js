import React, { useState, useEffect } from 'react';
import axios from 'axios';
import cheerio from 'cheerio';
import PlayerRow from './PlayerRow';

const url = "/profile/"; // Modified the URL to include the relative path
const ids = [
  1976508, 14173328, 1910116, 1928660, 1947745, 1971891, 34173153, 1915312, 1939823, 1969145, 1924893, 1970720, 1976494, 1969323, 1967495, 1914995, 1980599, 1980378, 1972332, 16267214, 1970399, 1912704, 1922610, 1922629, 1926888, 1929801, 1937839, 1954539, 1964585, 1965263, 1976613, 1976648, 1976656, 1976672, 1976680, 1976699, 1979833
];

const App = () => {
  const [playersData, setPlayersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState("classical");

  useEffect(() => {
    fetchPlayersData();
  }, []);

  useEffect(() => {
    sortPlayersData(sortColumn);
  }, [playersData]);

  const fetchPlayersData = async () => {
    try {
      const corsProxyUrl = 'https://cors-anywhere.herokuapp.com/';
      const promises = ids.map(id => axios.get(`${corsProxyUrl}https://ratings.fide.com/profile/${id}`));
      const responses = await Promise.all(promises);
      const playersData = responses.map(response => {
        const $ = cheerio.load(response.data);
        const name = $('.profile-top-title').text();

        let classical_rating = $('.profile-top-rating-data_gray').text();
        if (!classical_rating.includes("Not rated")) {
          classical_rating = classical_rating.replace(/\s+/g, '').substring(3);
        } else {
          classical_rating = "Not rated";
        }

        let rapid_rating = $('.profile-top-rating-data_red').text();
        if (!rapid_rating.includes("Not rated")) {
          rapid_rating = rapid_rating.replace(/\s+/g, '').substring(5);
        } else {
          rapid_rating = "Not rated";
        }

        let blitz_rating = $('.profile-top-rating-data_blue').text();
        if (!blitz_rating.includes("Not rated")) {
          blitz_rating = blitz_rating.replace(/\s+/g, '').substring(5);
        } else {
          blitz_rating = "Not rated";
        }

        return {
          id: response.config.url.substring(url.length),
          name,
          classical: classical_rating,
          rapid: rapid_rating,
          blitz: blitz_rating
        };
      });

      setPlayersData(playersData);
      setIsLoading(false);

    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const sortPlayersData = (column) => {

    if (sortColumn !== column) {

    setPlayersData(prevPlayersData => [...prevPlayersData].sort((a, b) => {
      if (a[column] === "Not rated") {
        return 1;
      } else if (b[column] === "Not rated") {
        return -1;
      } else {
        return b[column] - a[column];
      }
      setSortColumn(column);
    
    }));}
  };

  const sorting = (column) => {
    if (column === sortColumn) {
      setPlayersData([...playersData].reverse());
    } else {
      setSortColumn(column);
      sortPlayersData(column);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <main className='container'>
      <h1 className="my-2">Musas live FIDE ratings</h1>

      <table id="playerTable" className='table mx-auto'>
        <thead className='sticky-top bg-white'>
          <tr>
            <th>Player</th>
            <th onClick={() => sorting("classical")} className={sortColumn === "classical" ? "active" : ""}>Classical</th>
            <th onClick={() => sorting("rapid")} className={sortColumn === "rapid" ? "active" : ""}>Rapid</th>
            <th onClick={() => sorting("blitz")} className={sortColumn === "blitz" ? "active" : ""}>Blitz</th>
          </tr>
        </thead>
        <tbody>
          {playersData.map(player => (
            <PlayerRow
              key={player.id}
              id={player.id}
              name={player.name}
              classical={player.classical}
              rapid={player.rapid}
              blitz={player.blitz}
            />
          ))}
        </tbody>
      </table>
    </main>
  );
};

export default App;