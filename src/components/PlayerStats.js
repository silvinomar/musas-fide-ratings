import React, { useState, useEffect } from 'react';
import PlayerRow from './PlayerRow';
import musasData from '../data/musas-data.json';

const PlayerStats = () => {
    const [playersData, setPlayersData] = useState(null);
    const [filteredPlayers, setFilteredPlayers] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sortColumn, setSortColumn] = useState("standard");
    const [displayCount, setDisplayCount] = useState(15);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPlayersData();
    }, []);

    useEffect(() => {
        if (playersData) {
            handleSearch(searchTerm);
        }
    }, [searchTerm, playersData]);

    const fetchPlayersData = async () => {
        try {
            const playerArray = Object.entries(musasData).map(([id, player]) => ({ id, ...player }));

            playerArray.sort((a, b) => {
                const standardA = getRatingValue(a.standard);
                const standardB = getRatingValue(b.standard);
                return standardB - standardA;
            });

            setPlayersData(playerArray);
            setFilteredPlayers(playerArray);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching players data:', error);
            setIsLoading(false);
        }
    };

    const getRatingValue = (ratingData) => {
        if (ratingData === "Not rated") return 0;
        if (typeof ratingData === 'object' && ratingData.rating) {
            return ratingData.rating;
        }
        return parseInt(ratingData, 10) || 0;
    };

    const handleSearch = (term) => {
        if (!term.trim()) {
            setFilteredPlayers(playersData);
            setDisplayCount(itemsPerPage);
            return;
        }

        const filtered = playersData.filter(player =>
            player.name.toLowerCase().includes(term.toLowerCase())
        );
        setFilteredPlayers(filtered);
        setDisplayCount(filtered.length); // Show all results when searching
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const clearSearch = () => {
        setSearchTerm('');
        setDisplayCount(itemsPerPage);
    };

    const handleSort = (column) => {
        if (column !== sortColumn) {
            setSortColumn(column);
            sortPlayersData(column);
        }
    };

    const sortPlayersData = (column) => {
        const sortedPlayers = [...filteredPlayers].sort((a, b) => {
            const valueA = getRatingValue(a[column]);
            const valueB = getRatingValue(b[column]);
            return valueB - valueA;
        });

        setFilteredPlayers(sortedPlayers);
    };

    const handleLoadMore = () => {
        setDisplayCount(prev => prev + itemsPerPage);
    };

    const handleShowAll = () => {
        setDisplayCount(filteredPlayers.length);
    };

    const handleShowLess = () => {
        setDisplayCount(itemsPerPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (isLoading) {
        return <div className='loading'>loading...<span className='animation'></span></div>;
    }

    const displayedPlayers = filteredPlayers.slice(0, displayCount);
    const hasMore = displayCount < filteredPlayers.length;
    const showingAll = displayCount >= filteredPlayers.length;
    const isSearching = searchTerm.trim() !== '';

    return (
        <div className='container'>
            {/* Header Section */}
            <div className="header-section my-4">
                <h1 className="title">Musas FIDE Ratings</h1>

                <p className="subtitle">
                    Ratings updated monthly by FIDE | Last update: <em>{new Date(playersData[0].fetchDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    })}</em>
                </p>
            </div>

            {/* Search and Controls */}
            <div className="controls-wrapper mb-3">
                <div className="search-bar mb-3">
                    <div className="input-group">
                        <span className="input-group-text">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        {searchTerm && (
                            <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={clearSearch}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                <div className="info-bar d-flex justify-content-between align-items-center">
                    <div className="player-count">
                        {isSearching ? (
                            <span className="text-muted">
                                {filteredPlayers.length} {filteredPlayers.length === 1 ? 'result' : 'results'} for "{searchTerm}"
                            </span>
                        ) : (
                            <span className="text-muted">
                               Showing {displayedPlayers.length} of {filteredPlayers.length} players
                            </span>
                        )}
                    </div>

                    {playersData && (
                        <div className="total-count">
                            <span className="badge bg-secondary">
                                Total: {playersData.length} players
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="table-responsive">
                <table id="playerTable" className='table table-hover mx-auto'>
                    <thead className='sticky-top'>
                        <tr>
                            <th className="name-column">Player</th>
                            <th
                                onClick={() => handleSort("standard")}
                                className={`rating-column ${sortColumn === "standard" ? "active" : ""}`}
                            >
                                Classical {sortColumn === "standard" && "↓"}
                            </th>
                            <th
                                onClick={() => handleSort("rapid")}
                                className={`rating-column ${sortColumn === "rapid" ? "active" : ""}`}
                            >
                                Rapid {sortColumn === "rapid" && "↓"}
                            </th>
                            <th
                                onClick={() => handleSort("blitz")}
                                className={`rating-column ${sortColumn === "blitz" ? "active" : ""}`}
                            >
                                Blitz {sortColumn === "blitz" && "↓"}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedPlayers.length > 0 ? (
                            displayedPlayers.map(player => (
                                <PlayerRow
                                    key={player.id}
                                    id={player.id}
                                    name={player.name}
                                    standard={player.standard}
                                    rapid={player.rapid}
                                    blitz={player.blitz}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center text-muted py-4">
                                    No players found for "{searchTerm}"
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Load More / Show All buttons */}
            {!isSearching && (
                <div className="text-center my-4">
                    {hasMore && (
                        <>
                            <button
                                className="btn btn-primary me-2"
                                onClick={handleLoadMore}
                            >
                                Load more {itemsPerPage}
                            </button>
                            <button
                                className="btn btn-outline-primary"
                                onClick={handleShowAll}
                            >
                                Show all ({filteredPlayers.length})
                            </button>
                        </>
                    )}

                    {showingAll && filteredPlayers.length > itemsPerPage && (
                        <button
                            className="btn btn-outline-primary"
                            onClick={handleShowLess}
                        >
                            Show less ↑
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default PlayerStats;