import React, { useState, useEffect } from 'react';
import { fetchPlayerInfo } from '../api';
import PlayerRow from './PlayerRow';
import playerIds from '../playerIds';

const App = () => {
    const [playersData, setPlayersData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortColumn, setSortColumn] = useState("standard_elo");

    useEffect(() => {
        fetchPlayersData();
    }, []);

    const fetchPlayersData = async () => {
        try {
            const promises = playerIds.map(id => fetchPlayerInfo(id, true));
            const playersData = await Promise.allSettled(promises);

            const successfulPlayers = playersData
                .filter(result => result.value && result.value.name && (result.value.standard_elo !== "Notrated" || result.value.rapid_elo !== "Notrated" || result.value.blitz_elo !== "Notrated"))
                .map((result, index) => {
                    const player = {
                        ...result.value,
                        id: playerIds[index],
                        standard_elo: result.value.standard_elo === "Notrated" ? "-" : result.value.standard_elo,
                        rapid_elo: result.value.rapid_elo === "Notrated" ? "-" : result.value.rapid_elo,
                        blitz_elo: result.value.blitz_elo === "Notrated" ? "-" : result.value.blitz_elo,
                        standard_variation: "",
                        rapid_variation: "",
                        blitz_variation: ""
                    };

                   
                    // Calculate variations in rating
                    if (result.value.history.length >= 2) {
                        let c = parseInt(result.value.history[0].standard, 10) - parseInt(result.value.history[1].standard, 10);
                        let r = parseInt(result.value.history[0].rapid, 10) - parseInt(result.value.history[1].rapid, 10);
                        let b = parseInt(result.value.history[0].blitz, 10) - parseInt(result.value.history[1].blitz, 10);
    
                        if (c !== 0){
                            player.standard_variation = c;
                        }
                        if (r !== 0){
                            player.rapid_variation = r;
                        }
                        if (b !== 0){
                            player.blitz_variation = b;
                        }
                    }

                    return player;

                });

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
        return <div>Loading...</div>;
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
                            //c_variation={player.standard_variation}
                            rapid={player.rapid_elo}
                            //r_variation={player.rapid_variation}
                            blitz={player.blitz_elo}
                            //b_variation={player.blitz_variation}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default App;
