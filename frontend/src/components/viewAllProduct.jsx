import React, { useState, useEffect } from 'react';
import '../css/customgrid.css';
import SortIconUp from '../icons/up-arrow.svg';
import SortIconDown from '../icons/down-arrow.svg';
import EditIcon from '../icons/edit-icon.svg';
import DeleteIcon from '../icons/delete-icon.svg';
import LoadingSpinner from './loadingSpinner';
import { Link } from 'react-router-dom';

import { fetchProducts, deleteProduct } from '../services/productService';

function ViewAllProduct() {
  const [products, setProducts] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [productName, setProductName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [popup, setPopup] = useState({ show: false, success: true, message: "" });

  const loadProducts = async (pageNumber, pageSize, productName) => {
    setLoading(true);
    try {
      const response = await fetchProducts({
        pageNumber,
        pageSize,
        productName,
        sortKey: sortConfig.key == null ? '' : sortConfig.key,
        sortDirection: sortConfig.direction == null ? '' : sortConfig.direction
      });
      const result = response.data;
      setProducts(result.products);
      setPageNumber(result.pageNumber);
      setPageSize(result.pageSize);
      setTotalCount(result.totalCount);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    loadProducts(pageNumber, pageSize, searchTerm);
  }, [pageNumber, pageSize, searchTerm, sortConfig]);

  const handleSearch = () => {
    setSearchTerm(productName);
    setPageNumber(1);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePrev = () => {
    if (pageNumber > 1) setPageNumber(pageNumber - 1);
  };

  const handleNext = () => {
    if (pageNumber < totalPages) setPageNumber(pageNumber + 1);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    if (sortConfig.direction === 'asc') {
      return <img src={SortIconUp} alt="Ascending" className="sort-icon" />;
    }
    if (sortConfig.direction === 'desc') {
      return <img src={SortIconDown} alt="Descending" className="sort-icon" />;
    }
    return null;
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = null;
      key = null;
    }
    setSortConfig({ key, direction });
    setPageNumber(1);
  };

  const handleDelete = async (product) => {
    setLoading(true);
    try {
      const resp = await deleteProduct(product["_id"]);
      setTimeout(() => {
        setLoading(false);
        setPopup({
          show: true,
          success: true,
          message: `Product "${product["Product Name"]}" deleted successfully.`
        });
      }, 500);
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.errors?.[0] || "Unknown error occurred.";
      setPopup({
        show: true,
        success: false,
        message: msg
      });
    }
  };

  const handlePopupOk = () => {
    setPopup({ show: false, success: true, message: "" });
    if (popup.success) {
      setPageNumber(1);
      setSearchTerm('');
      setProductName('');
      loadProducts(1, pageSize, '');
    }
  };

  return (
    <div>
      <LoadingSpinner showSpinner={loading} />
      <div className="table-container">
        <form className="search-container" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
          <input
            type="text"
            placeholder="Enter product name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="search-input"
          />
          <button onClick={handleSearch} className="search-button">Search</button>
        </form>
        <table className="custom-table">
          <thead>
            <tr className="header-row">
              <th className="sortable-header" onClick={() => requestSort('Product Name')}>Product Name {getSortIcon('Product Name')}</th>
              <th className="sortable-header" onClick={() => requestSort('Product Category')}>Product Category {getSortIcon('Product Category')}</th>
              <th className="sortable-header" onClick={() => requestSort('Units Sold')}>Units Sold {getSortIcon('Units Sold')}</th>
              <th className="sortable-header" onClick={() => requestSort('Returns')}>Returns {getSortIcon('Returns')}</th>
              <th className="sortable-header" onClick={() => requestSort('Revenue')}>Revenue {getSortIcon('Revenue')}</th>
              <th className="sortable-header" onClick={() => requestSort('Stock Level')}>Stock Level {getSortIcon('Stock Level')}</th>
              <th className="sortable-header" onClick={() => requestSort('Season')}>Season {getSortIcon('Season')}</th>
              <th className="sortable-header" onClick={() => requestSort('Trend Score')}>Trend Score {getSortIcon('Trend Score')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'even-row' : 'odd-row'}>
                <td>{product["Product Name"]}</td>
                <td>{product["Product Category"]}</td>
                <td>{product["Units Sold"]}</td>
                <td>{product["Returns"]}</td>
                <td>{product["Revenue"]}</td>
                <td>{product["Stock Level"]}</td>
                <td>{product["Season"]}</td>
                <td>{product["Trend Score"]}</td>
                <td>
                  <button className='grid-action-button' style={{ marginRight: "10px" }}>
                    <Link to={`/edit-product/${product["_id"]}`}><img src={EditIcon} alt="Edit" /></Link>
                  </button>
                  <button className='grid-action-button' onClick={() => handleDelete(product)}>
                    <img src={DeleteIcon} alt="Delete" />
                  </button>
                </td>
              </tr>
            ))}
            {!loading && products.length === 0 && (
              <tr>
                <td colSpan="100%" className="no-records">No products available</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="pagination">
          <button onClick={handlePrev} disabled={pageNumber === 1}>
            Previous
          </button>
          <span>
            Page {pageNumber} of {totalPages}
          </span>
          <button onClick={handleNext} disabled={pageNumber === totalPages}>
            Next
          </button>
        </div>
      </div>
      <div className={`form-popup${popup.show ? ' show' : ''}`}>
        <div className={`form-popup-inner${popup.success ? ' success' : ' error'}`}>
          <div className="popup-message">{popup.message}</div>
          <button className="popup-ok" onClick={handlePopupOk}>OK</button>
        </div>
      </div>
    </div>
  );
}

export default ViewAllProduct;

