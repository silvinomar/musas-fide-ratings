import React, { useState, useEffect } from 'react';
import PlayerRow from './PlayerRow';
import musasData from '../data/musas-data.json'; // Importing the JSON data

const PlayerStats = () => {
    const [playersData, setPlayersData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sortColumn, setSortColumn] = useState("standard");


    useEffect(() => {
        fetchPlayersData();
    }, []);

    const fetchPlayersData = async () => {
        try {
            // Convert the musasData object to an array for easier manipulation
            const playerArray = Object.entries(musasData).map(([id, player]) => ({ id, ...player }));

            // Sort the playerArray by standard_elo initially (Descending order)
            playerArray.sort((a, b) => {
                const standardA = parseInt(a.standard) || 0;  // Parse standard elo or set to 0 if "Not rated"
                const standardB = parseInt(b.standard) || 0;  // Same for b
                return standardB - standardA;  // Sort in descending order
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
        const sortedPlayers = [...playersData].sort((a, b) => {
            // Ensure correct handling of "Not rated" values
            const getEloValue = (eloValue) => {
                // Handle "Not rated" and convert it to 0, otherwise parse the number
                return eloValue === "Not rated" ? 0 : parseInt(eloValue, 10) || 0;
            };

            const valueA = getEloValue(a[column]);
            const valueB = getEloValue(b[column]);

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
                        <th onClick={() => handleSort("standard")} className={sortColumn === "standard" ? "active" : ""}>Classical</th>
                        <th onClick={() => handleSort("rapid")} className={sortColumn === "rapid" ? "active" : ""}>Rapid</th>
                        <th onClick={() => handleSort("blitz")} className={sortColumn === "blitz" ? "active" : ""}>Blitz</th>
                    </tr>
                </thead>
                <tbody>
                    {playersData.map(player => (
                        <PlayerRow
                            key={player.id}
                            id={player.id}
                            name={player.name}
                            classical={player.standard} 
                            c_variation={player.standardDiff} 
                            newStandard={player.newStandard}
                            rapid={player.rapid} 
                            r_variation={player.rapidDiff} 
                            newRapid={player.newRapid}
                            blitz={player.blitz} 
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
