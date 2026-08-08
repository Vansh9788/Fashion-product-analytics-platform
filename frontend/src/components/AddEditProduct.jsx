import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/addEditProduct.css';
import LoadingSpinner from './loadingSpinner';
import {
  fetchCategories,
  fetchSeasons,
  fetchProductById,
  addProduct,
  updateProduct
} from '../services/productService';

const AddEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [formData, setFormData] = useState({
    productCategory: '',
    productName: '',
    unitsSold: '',
    returns: '',
    revenue: '',
    customerRating: '',
    stockLevel: '',
    season: '',
    trendScore: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showCategoryOptions, setShowCategoryOptions] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [popup, setPopup] = useState({ show: false, success: true, message: "" });

  const fieldNamesMap = {
    productCategory: 'Product Category',
    productName: 'Product Name',
    unitsSold: 'Units Sold',
    returns: 'Returns',
    revenue: 'Revenue',
    customerRating: 'Customer Rating',
    stockLevel: 'Stock Level',
    season: 'Season',
    trendScore: 'Trend Score'
  };

  useEffect(() => {
    fetchCategories()
      .then(resp => {
        setCategories(resp.data);
        setFilteredCategories(resp.data);
      });
    fetchSeasons()
      .then(resp => {
        setSeasons(resp.data);
      });
  }, []);

  useEffect(() => {
    if (id) {
      setIsUpdateMode(true);
      setLoading(true);
      fetchProductById(id)
        .then(resp => {
          const data = resp.data;
          setFormData({
            productCategory: data['Product Category'] || '',
            productName: data['Product Name'] || '',
            unitsSold: data['Units Sold'] != null ? data['Units Sold'] : '',
            returns: data['Returns'] != null ? data['Returns'] : '',
            revenue: data['Revenue'] != null ? data['Revenue'] : '',
            customerRating: data['Customer Rating'] != null ? data['Customer Rating'] : '',
            stockLevel: data['Stock Level'] != null ? data['Stock Level'] : '',
            season: data['Season'] || '',
            trendScore: data['Trend Score'] != null ? data['Trend Score'] : ''
          });
          setFilteredCategories(categories.filter(cat =>
            cat.toLowerCase().includes((data['Product Category'] || '').toLowerCase())
          ));
          setTimeout(() => {
            setLoading(false);
          }, 500);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setIsUpdateMode(false);
      resetForm();
    }
  }, [id, categories]);

  const resetForm = () => {
    setFormData({
      productCategory: '',
      productName: '',
      unitsSold: '',
      returns: '',
      revenue: '',
      customerRating: '',
      stockLevel: '',
      season: '',
      trendScore: ''
    });
    setTouched({});
    setErrors({});
    setFilteredCategories(categories);
  };

  const validateField = (name, value) => {
    const displayName = fieldNamesMap[name] || name;
    switch (name) {
      case 'productCategory':
      case 'productName':
      case 'season':
        if (!value.trim()) return `${displayName} is required.`;
        break;
      case 'unitsSold':
      case 'returns':
      case 'revenue':
      case 'stockLevel':
      case 'trendScore':
        if (value === '') return `${displayName} is required.`;
        if (Number(value) < 0) return `${displayName} must be at least 0.`;
        break;
      case 'customerRating':
        if (value === '') return `${displayName} is required.`;
        if (Number(value) < 0 || Number(value) > 5) return `${displayName} must be between 0 and 5.`;
        break;
      default:
        break;
    }
    return '';
  };

  const handleCategoryChange = e => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, productCategory: value }));

    if (touched.productCategory) {
      const error = validateField('productCategory', value);
      setErrors(prev => ({ ...prev, productCategory: error }));
    }

    if (value.length > 0) {
      const filtered = categories.filter(cat =>
        cat.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCategories(filtered);
      setShowCategoryOptions(true);
    } else {
      setShowCategoryOptions(false);
    }
  };

  const handleCategorySelect = (category) => {
    setFormData(prev => ({ ...prev, productCategory: category }));
    setShowCategoryOptions(false);
    const error = validateField('productCategory', category);
    setErrors(prev => ({ ...prev, productCategory: error }));
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = e => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    if (name === 'productCategory') {
      setTimeout(() => setShowCategoryOptions(false), 150);
    }
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.entries(formData).forEach(([key, val]) => {
      const error = validateField(key, val);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = {
        ...formData,
        unitsSold: Number(formData.unitsSold),
        returns: Number(formData.returns),
        revenue: Number(formData.revenue),
        customerRating: Number(formData.customerRating),
        stockLevel: Number(formData.stockLevel),
        trendScore: Number(formData.trendScore)
      };
      setLoading(true);

      const apiCall = isUpdateMode
        ? updateProduct(id, submitData)
        : addProduct(submitData);

      apiCall
        .then(resp => {
          setTimeout(() => {
            setLoading(false);
            setPopup({
              show: true,
              success: true,
              message: `Product "${resp.data['Product Name']}" ${isUpdateMode ? 'updated' : 'added'} successfully.`
            });
          }, 500);
        })
        .catch(err => {
          setLoading(false);
          const msg = err.response?.data?.errors?.[0] || "Unknown error occurred.";
          setPopup({
            show: true,
            success: false,
            message: msg
          });
        });
    }
  };

  const handlePopupOk = () => {
    setPopup({ show: false, success: true, message: "" });
    if (popup.success) {
      navigate('/');
    }
  };

  return (
    <div className={`card`}>
      <div className="spinner-center"><LoadingSpinner showSpinner={loading} /></div>
      <form onSubmit={handleSubmit} noValidate className='form-add-edit-product'>
        <div className={`form-row`}>
          <div className={`form-group autocomplete-wrapper${showCategoryOptions && filteredCategories.length > 0 ? ' show-menu' : ''}`}>
            <label htmlFor="productCategory">Product Category</label>
            <input
              id="productCategory"
              name="productCategory"
              type="text"
              autoComplete="off"
              value={formData.productCategory}
              onChange={handleCategoryChange}
              onBlur={handleBlur}
              onFocus={() => {
                if (formData.productCategory.length > 0) setShowCategoryOptions(true);
              }}
              className={errors.productCategory ? 'input-error' : ''}
            />
            {showCategoryOptions && filteredCategories.length > 0 && (
              <ul className="autocomplete-list">
                {filteredCategories.map((category, index) => (
                  <li key={index} onMouseDown={() => handleCategorySelect(category)}>
                    {category}
                  </li>
                ))}
              </ul>
            )}
            <div className={`error-text ${errors.productCategory ? 'show' : ''}`}>
              {errors.productCategory || '\u00A0'}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="productName">Product Name</label>
            <input
              id="productName"
              name="productName"
              type="text"
              value={formData.productName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.productName ? 'input-error' : ''}
            />
            <div className={`error-text ${errors.productName ? 'show' : ''}`}>
              {errors.productName || '\u00A0'}
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="unitsSold">Units Sold</label>
            <input
              id="unitsSold"
              name="unitsSold"
              type="number"
              min="0"
              value={formData.unitsSold}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.unitsSold ? 'input-error' : ''}
            />
            <div className={`error-text ${errors.unitsSold ? 'show' : ''}`}>
              {errors.unitsSold || '\u00A0'}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="returns">Returns</label>
            <input
              id="returns"
              name="returns"
              type="number"
              min="0"
              value={formData.returns}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.returns ? 'input-error' : ''}
            />
            <div className={`error-text ${errors.returns ? 'show' : ''}`}>
              {errors.returns || '\u00A0'}
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="revenue">Revenue</label>
            <input
              id="revenue"
              name="revenue"
              type="number"
              min="0"
              step="0.01"
              value={formData.revenue}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.revenue ? 'input-error' : ''}
            />
            <div className={`error-text ${errors.revenue ? 'show' : ''}`}>
              {errors.revenue || '\u00A0'}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="customerRating">Customer Rating</label>
            <input
              id="customerRating"
              name="customerRating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={formData.customerRating}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.customerRating ? 'input-error' : ''}
            />
            <div className={`error-text ${errors.customerRating ? 'show' : ''}`}>
              {errors.customerRating || '\u00A0'}
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="stockLevel">Stock Level</label>
            <input
              id="stockLevel"
              name="stockLevel"
              type="number"
              min="0"
              value={formData.stockLevel}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.stockLevel ? 'input-error' : ''}
            />
            <div className={`error-text ${errors.stockLevel ? 'show' : ''}`}>
              {errors.stockLevel || '\u00A0'}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="season">Season</label>
            <select
              id="season"
              name="season"
              value={formData.season}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.season ? 'input-error' : ''}
            >
              <option value="">Select Season</option>
              {seasons.map((seasonOption) => (
                <option key={seasonOption} value={seasonOption}>{seasonOption}</option>
              ))}
            </select>
            <div className={`error-text ${errors.season ? 'show' : ''}`}>
              {errors.season || '\u00A0'}
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label htmlFor="trendScore">Trend Score</label>
            <input
              id="trendScore"
              name="trendScore"
              type="number"
              min="0"
              step="0.01"
              value={formData.trendScore}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.trendScore ? 'input-error' : ''}
            />
            <div className={`error-text ${errors.trendScore ? 'show' : ''}`}>
              {errors.trendScore || '\u00A0'}
            </div>
          </div>
        </div>
        <button type="submit">{isUpdateMode ? 'Update' : 'Add'}</button>
      </form>

      <div className={`form-popup${popup.show ? ' show' : ''}`}>
        <div className={`form-popup-inner${popup.success ? ' success' : ' error'}`}>
          <div className="popup-message">{popup.message}</div>
          <button className="popup-ok" onClick={handlePopupOk}>OK</button>
        </div>
      </div>
    </div>
  );
};

export default AddEditProduct;

