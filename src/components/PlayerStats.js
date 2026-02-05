import React, { useState, useEffect } from 'react';
import PlayerRow from './PlayerRow';
import musasData from '../data/musas-data.json';

const PlayerStats = () => {
    const [playersData, setPlayersData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sortColumn, setSortColumn] = useState("standard");

    useEffect(() => {
        fetchPlayersData();
    }, []);

    const fetchPlayersData = async () => {
        try {
            // Convert the musasData object to an array
            const playerArray = Object.entries(musasData).map(([id, player]) => ({ id, ...player }));

            // Sort by standard rating initially (Descending order)
            playerArray.sort((a, b) => {
                const standardA = getRatingValue(a.standard);
                const standardB = getRatingValue(b.standard);
                return standardB - standardA;
            });

            setPlayersData(playerArray);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching players data:', error);
            setIsLoading(false);
        }
    };

    // Helper function to extract rating value
    const getRatingValue = (ratingData) => {
        if (ratingData === "Not rated") return 0;
        if (typeof ratingData === 'object' && ratingData.rating) {
            return ratingData.rating;
        }
        return parseInt(ratingData, 10) || 0;
    };

    const handleSort = (column) => {
        if (column !== sortColumn) {
            setSortColumn(column);
            sortPlayersData(column);
        }
    };

    const sortPlayersData = (column) => {
        const sortedPlayers = [...playersData].sort((a, b) => {
            const valueA = getRatingValue(a[column]);
            const valueB = getRatingValue(b[column]);
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
                            standard={player.standard}
                            rapid={player.rapid}
                            blitz={player.blitz}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PlayerStats;