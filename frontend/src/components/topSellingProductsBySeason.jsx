import React, { useState, useEffect } from 'react';
import { fetchSeasons, fetchTopSellingProductsBySeason } from '../services/productService';
import LoadingSpinner from './loadingSpinner';
import '../css/customgrid.css';

function TopSellingProductsBySeason() {
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState('');
    const [unitsSoldMin, setUnitsSoldMin] = useState('');
    const [products, setProducts] = useState([]);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSeasons()
            .then(resp => {
                setSeasons(resp.data);
                if (resp.data[0]) setSelectedSeason(resp.data[0]);
            });
    }, []);

    const fetchProducts = (season, unitsSoldValue, pageNum) => {
        setLoading(true);
        setError('');
        fetchTopSellingProductsBySeason(season, unitsSoldValue, pageNum, pageSize)
            .then(resp => {
                setTimeout(() => {
                    setProducts(resp.data.products);
                    setTotalCount(resp.data.totalCount);
                    setLoading(false);
                }, 500);
            })
            .catch(err => {
                setProducts([]);
                setTotalCount(0);
                setLoading(false);
                const msg = err.response?.data?.errors?.[0] || 'Unknown error';
                setError(msg);
            });
    };

    useEffect(() => {
        if (selectedSeason) {
            fetchProducts(selectedSeason, unitsSoldMin, 1);
            setPageNumber(1);
        }
    }, [selectedSeason]);

    const handleUnitsSoldChange = e => {
        setUnitsSoldMin(e.target.value);
    };

    const handleUnitsSoldFilter = () => {
        if (selectedSeason) {
            fetchProducts(selectedSeason, unitsSoldMin, 1);
            setPageNumber(1);
        }
    };

    const handlePrev = () => {
        if (pageNumber > 1) {
            fetchProducts(selectedSeason, unitsSoldMin, pageNumber - 1);
            setPageNumber(pageNumber - 1);
        }
    };

    const handleNext = () => {
        const totalPages = Math.ceil(totalCount / pageSize);
        if (pageNumber < totalPages) {
            fetchProducts(selectedSeason, unitsSoldMin, pageNumber + 1);
            setPageNumber(pageNumber + 1);
        }
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div>
            <LoadingSpinner showSpinner={loading} />
            <div className="table-container">
                <form
                    className="search-container"
                    onSubmit={e => {
                        e.preventDefault();
                        handleUnitsSoldFilter();
                    }}
                    style={{ marginBottom: 22 }}
                >
                    <select
                        className="search-input"
                        style={{ width: 160, marginRight: 10 }}
                        value={selectedSeason}
                        onChange={e => setSelectedSeason(e.target.value)}
                    >
                        {seasons.map(season => (
                            <option value={season} key={season}>{season}</option>
                        ))}
                    </select>
                    <input
                        type="number"
                        className="search-input"
                        style={{ width: 250, marginRight: 10 }}
                        placeholder="Units Sold greater than"
                        value={unitsSoldMin}
                        onChange={handleUnitsSoldChange}
                        min={0}
                    />
                    <button type="submit" className="search-button">Filter</button>
                </form>
                <table className="custom-table">
                    <thead>
                        <tr className="header-row">
                            <th>Product Name</th>
                            <th>Product Category</th>
                            <th>Units Sold</th>
                            <th>Returns</th>
                            <th>Revenue</th>
                            <th>Customer Rating</th>
                            <th>Stock Level</th>
                            <th>Season</th>
                            <th>Trend Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="100%" style={{ textAlign: 'center' }}>Loading...</td></tr>
                        ) : error ? (
                            <tr><td colSpan="100%" className="no-records">{error}</td></tr>
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan="100%" className="no-records">
                                    No records found
                                </td>
                            </tr>
                        ) : (
                            products.map((product, idx) => (
                                <tr key={product._id} className={idx % 2 === 0 ? 'even-row' : 'odd-row'}>
                                    <td>{product["Product Name"]}</td>
                                    <td>{product["Product Category"]}</td>
                                    <td>{product["Units Sold"]}</td>
                                    <td>{product.Returns}</td>
                                    <td>{product.Revenue}</td>
                                    <td>{product["Customer Rating"]}</td>
                                    <td>{product["Stock Level"]}</td>
                                    <td>{product.Season}</td>
                                    <td>{product["Trend Score"]}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <div className="pagination">
                    <button onClick={handlePrev} disabled={pageNumber === 1}>
                        Previous
                    </button>
                    <span>
                        Page {pageNumber} of {totalPages || 1}
                    </span>
                    <button onClick={handleNext} disabled={pageNumber === totalPages || totalPages === 0}>
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TopSellingProductsBySeason;

