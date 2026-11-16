import React, { useState, useMemo } from 'react';
import PlayerRow from './PlayerRow';
import musasData from '../data/musas-data.json';

const ITEMS_PER_PAGE = 15;

// Um jogador é válido se tiver nome e este não for "N/A" (jogadores que a FIDE não encontrou)
const isValidPlayer = (player) => {
    const name = typeof player.name === 'string' ? player.name.trim() : '';
    return name !== '' && name.toUpperCase() !== 'N/A';
};

const getRatingValue = (ratingData) => {
    if (ratingData === "Not rated") return 0;
    if (typeof ratingData === 'object' && ratingData.rating) {
        return ratingData.rating;
    }
    return parseInt(ratingData, 10) || 0;
};

// Os dados vêm de um JSON estático, por isso são preparados uma só vez, fora do componente
const allPlayers = Object.entries(musasData)
    .map(([id, player]) => ({ id, ...player }))
    .filter(isValidPlayer);

const PlayerStats = () => {
    const [sortColumn, setSortColumn] = useState("standard");
    const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
    const [searchTerm, setSearchTerm] = useState('');

    // Lista ordenada pela coluna escolhida
    const sortedPlayers = useMemo(
        () => [...allPlayers].sort((a, b) => getRatingValue(b[sortColumn]) - getRatingValue(a[sortColumn])),
        [sortColumn]
    );

    const isSearching = searchTerm.trim() !== '';

    // Lista filtrada pela pesquisa (mantém a ordenação)
    const filteredPlayers = useMemo(() => {
        if (!isSearching) return sortedPlayers;
        const term = searchTerm.trim().toLowerCase();
        return sortedPlayers.filter(player => player.name.toLowerCase().includes(term));
    }, [sortedPlayers, searchTerm, isSearching]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setDisplayCount(ITEMS_PER_PAGE);
    };

    const clearSearch = () => {
        setSearchTerm('');
        setDisplayCount(ITEMS_PER_PAGE);
    };

    const handleSort = (column) => {
        if (column !== sortColumn) {
            setSortColumn(column);
        }
    };

    const handleLoadMore = () => {
        setDisplayCount(prev => prev + ITEMS_PER_PAGE);
    };

    const handleShowAll = () => {
        setDisplayCount(filteredPlayers.length);
    };

    const handleShowLess = () => {
        setDisplayCount(ITEMS_PER_PAGE);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Ao pesquisar mostram-se todos os resultados
    const visibleCount = isSearching ? filteredPlayers.length : displayCount;
    const displayedPlayers = filteredPlayers.slice(0, visibleCount);
    const hasMore = visibleCount < filteredPlayers.length;
    const showingAll = visibleCount >= filteredPlayers.length;

    const lastUpdate = new Date(allPlayers.length > 0 ? allPlayers[0].fetchDate : Date.now());

    return (
        <div className='container'>
            {/* Header Section */}
            <div className="header-section my-4">
                <h1 className="title">Musas FIDE Ratings</h1>

                <p className="subtitle">
                    Ratings updated monthly by FIDE | Last update: <em>{lastUpdate.toLocaleDateString('en-GB', {
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

                    <div className="total-count">
                        <span className="badge bg-secondary">
                            Total: {allPlayers.length} players
                        </span>
                    </div>
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
                                Load more {ITEMS_PER_PAGE}
                            </button>
                            <button
                                className="btn btn-outline-primary"
                                onClick={handleShowAll}
                            >
                                Show all ({filteredPlayers.length})
                            </button>
                        </>
                    )}

                    {showingAll && filteredPlayers.length > ITEMS_PER_PAGE && (
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