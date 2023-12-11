import React, { useState, useEffect } from 'react';
import { fetchPlayerInfo } from '../api';
import PlayerRow from './PlayerRow';
import playerIds from '../playerIds';

const calculateVariation = (current, previous) => {
    const variation = parseInt(current, 10) - parseInt(previous, 10);
    return variation !== 0 && !isNaN(variation) ? variation : "";
};

const replaceNotRated = (elo) => (elo === "Notrated" ? "-" : elo);

const hasNonDashElo = (player) => (
    player.standard_elo !== '-' || player.rapid_elo !== '-' || player.blitz_elo !== '-'
);

const App = () => {
    const [playersData, setPlayersData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sortColumn, setSortColumn] = useState("standard_elo");

    useEffect(() => {
        fetchPlayersData();
    }, []);

    const fetchPlayersData = async () => {
        try {
            // Check if data is already in localStorage
            const cachedData = localStorage.getItem('playersData');
            if (cachedData) {
                setPlayersData(JSON.parse(cachedData));
                setIsLoading(false);
                return;
            }

            const promises = playerIds.map((id) => fetchPlayerInfo(id, true));
            const playersData = await Promise.allSettled(promises);

            const successfulPlayers = playerIds.map((playerId, index) => {
                const result = playersData[index];
                if (result.status === 'fulfilled' && result.value.name) {
                    const { standard_elo = "Notrated", rapid_elo = "Notrated", blitz_elo = "Notrated" } = result.value;

                    const player = {
                        ...result.value,
                        id: playerId,
                        standard_elo: replaceNotRated(standard_elo),
                        rapid_elo: replaceNotRated(rapid_elo),
                        blitz_elo: replaceNotRated(blitz_elo),
                        standard_variation: calculateVariation(result.value.history[0].standard, result.value.history[1].standard),
                        rapid_variation: calculateVariation(result.value.history[0].rapid, result.value.history[1].rapid),
                        blitz_variation: calculateVariation(result.value.history[0].blitz, result.value.history[1].blitz),
                    };

                    return player;
                }
                return null;
            }).filter(player => player !== null && hasNonDashElo(player));

            const failedPlayers = playersData
                .filter(result => result.status === 'rejected')
                .map((result, index) => playerIds[index]);

            if (failedPlayers.length > 0) {
                console.log(`Failed to fetch data for players with IDs: ${failedPlayers.join(', ')}`);
            }

            // Sort players based on the selected column in descending order
            successfulPlayers.sort((a, b) => {
                const valueA = a[sortColumn] === "-" ? 0 : parseInt(a[sortColumn], 10);
                const valueB = b[sortColumn] === "-" ? 0 : parseInt(b[sortColumn], 10);
                return valueB - valueA;
            });

            // Store data in localStorage for future use
            localStorage.setItem('playersData', JSON.stringify(successfulPlayers));

            setPlayersData(successfulPlayers);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching players data:', error);
            setIsLoading(false);
        }
    };

    const handleSort = (column) => {
        // If a different column is clicked, set it as the new sort column
        if (column !== sortColumn) {
            // Sort players client-side based on the selected column in descending order
            const sortedPlayers = [...playersData].sort((a, b) => {
                const valueA = a[column] === "-" ? 0 : parseInt(a[column], 10);
                const valueB = b[column] === "-" ? 0 : parseInt(b[column], 10);
                return valueB - valueA;
            });

            setPlayersData(sortedPlayers);
            setSortColumn(column);
        }
    };

    if (isLoading) {
        return <div className='loading'>loading...<span className='animation'></span></div>;
    }

    return (
        <div className='container'>
            <h1 className="my-2">Musas FIDE ratings</h1>

            <table id="playerTable" className='table mx-auto'>
                <thead className='sticky-top'>
                    <tr>
                        <th></th>
                        <th onClick={() => handleSort("standard_elo")} className={sortColumn === "standard_elo" ? "active" : ""}>Classical</th>
                        <th onClick={() => handleSort("rapid_elo")} className={sortColumn === "rapid_elo" ? "active" : ""}>Rapid</th>
                        <th onClick={() => handleSort("blitz_elo")} className={sortColumn === "blitz_elo" ? "active" : ""}>Blitz</th>
                    </tr>
                </thead>
                <tbody>
                    {playersData.map(player => (
                        <PlayerRow
                            key={player.id}
                            id={player.id}
                            name={player.name}
                            classical={player.standard_elo}
                            c_variation={player.standard_variation}
                            rapid={player.rapid_elo}
                            r_variation={player.rapid_variation}
                            blitz={player.blitz_elo}
                            b_variation={player.blitz_variation}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default App;
