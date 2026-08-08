import React, { useState, useEffect } from 'react';
import { fetchSeasons, fetchSeasonSummary } from '../services/productService';
import '../css/seasonSummary.css';

function SeasonSummary() {
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState('');
    const [summary, setSummary] = useState({
        season: '',
        totalUnitsSold: 0,
        totalReturns: 0,
        totalRevenue: 0
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSeasons()
            .then(resp => {
                setSeasons(resp.data);
                if (resp.data.length > 0) {
                    setSelectedSeason(resp.data[0]);
                }
            });
    }, []);

    useEffect(() => {
        if (selectedSeason) {
            setLoading(true);
            setError('');
            fetchSeasonSummary(selectedSeason)
                .then(resp => {
                    setTimeout(() => {
                        setSummary({
                            season: resp.data.season,
                            totalUnitsSold: resp.data.totalUnitsSold,
                            totalReturns: resp.data.totalReturns,
                            totalRevenue: resp.data.totalRevenue
                        });
                        setLoading(false);
                        setError('');
                    }, 500);
                })
                .catch(err => {
                    setLoading(false);
                    const msg = err.response?.data?.error || 'Unknown error';
                    setError(msg);
                });
        }
    }, [selectedSeason]);

    return (
        <div className="season-summary-card">
            <h2>Season Summary</h2>
            <div className="season-summary-row">
                <label htmlFor="seasonSelect">Season:&nbsp;</label>
                <select
                    id="seasonSelect"
                    value={selectedSeason}
                    onChange={e => setSelectedSeason(e.target.value)}
                    className="season-summary-select"
                >
                    {seasons.map(season => (
                        <option key={season} value={season}>{season}</option>
                    ))}
                </select>
            </div>
            {loading ? (
                <div className="season-summary-loading">Loading...</div>
            ) : error ? (
                <div className="season-summary-error">{error}</div>
            ) : (
                <div className="season-summary-content">
                    <div className="season-summary-item">
                        <span className="season-summary-label">Units Sold:</span>
                        <span className="season-summary-value">{summary.totalUnitsSold}</span>
                    </div>
                    <div className="season-summary-item">
                        <span className="season-summary-label">Returns:</span>
                        <span className="season-summary-value">{summary.totalReturns}</span>
                    </div>
                    <div className="season-summary-item">
                        <span className="season-summary-label">Revenue:</span>
                        <span className="season-summary-value">{summary.totalRevenue}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SeasonSummary;
