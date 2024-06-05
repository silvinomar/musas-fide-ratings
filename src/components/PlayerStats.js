import React, { useState, useEffect } from 'react';
import PlayerRow from './PlayerRow';
import musasData from '../data/musas-data.json'; // Importing the JSON data

const PlayerStats = () => {
    const [playersData, setPlayersData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sortColumn, setSortColumn] = useState("standard_elo");

    useEffect(() => {
        fetchPlayersData();
    }, []);

    const fetchPlayersData = async () => {
        try {
            const playerArray = Object.entries(musasData).map(([id, player]) => ({ id, ...player }));
            // Sort the playerArray by standard_elo initially
            playerArray.sort((a, b) => {
                const standardA = parseInt(a.elo.standard_elo) || 0;
                const standardB = parseInt(b.elo.standard_elo) || 0;
                return standardB - standardA;
            });
            setPlayersData(playerArray);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching players data:', error);
            setIsLoading(false);
        }
    };

    const handleSort = (column) => {
        // If a different column is clicked, set it as the new sort column
        if (column !== sortColumn) {
            setSortColumn(column);
            sortPlayersData(column);
        }
    };

    const sortPlayersData = (column) => {
        // Sort players client-side based on the selected column in descending order
        const sortedPlayers = [...playersData].sort((a, b) => {
            const valueA = a.elo[column] === "Notrated" ? 0 : parseInt(a.elo[column], 10);
            const valueB = b.elo[column] === "Notrated" ? 0 : parseInt(b.elo[column], 10);
            return valueB - valueA;
        });

        setPlayersData(sortedPlayers);
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
                            classical={player.elo.standard_elo} 
                            c_variation={player.standardDiff} 
                            newStandard={player.newStandard}
                            rapid={player.elo.rapid_elo} 
                            r_variation={player.rapidDiff} 
                            newRapid={player.newRapid}
                            blitz={player.elo.blitz_elo} 
                            b_variation={player.blitzDiff} 
                            newBlitz={player.newBlitz}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PlayerStats;
