import axios from 'axios';

const API_KEY = process.env.REACT_APP_API_KEY;

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    headers: {
        'x-api-key': API_KEY
    }
});
export const fetchProducts = async ({ pageNumber, pageSize, productName, sortKey, sortDirection }) => {
    return apiClient.get(`/searchproducts`, {
        params: { pageNumber, pageSize, productName, sortKey, sortDirection }
    });
};

export const deleteProduct = async (id) => {
    return apiClient.post(`/deleteproduct/${id}`);
};

export const fetchCategories = () => {
    return apiClient.get(`/categories`);
};
export const fetchSeasons = () => {
    return apiClient.get(`/seasons`);
};
export const fetchProductById = (id) => {
    return apiClient.get(`/products/${id}`);
};
export const addProduct = (data) => {
    return apiClient.post(`/AddProduct`, data);
};
export const updateProduct = (id, data) => {
    return apiClient.post(`/updateproduct/${id}`, data);
};
export const fetchSeasonSummary = (season) => {
    return apiClient.get(`/seasonsummary/${season}`);
};
export const fetchTopSellingProductsBySeason = (season, unitsSoldMin = '', pageNumber = 1, pageSize = 10) => {
    let url = `/top-selling-products/${season}?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    if (unitsSoldMin && !isNaN(unitsSoldMin)) {
        url += `&unitsSoldMin=${unitsSoldMin}`;
    }
    return apiClient.get(url);
};
export const fetchTopRatedProductsBySeason = (season, minRating = '', pageNumber = 1, pageSize = 10) => {
    let url = `/top-rated-products/${season}?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    if (minRating && !isNaN(minRating)) {
        url += `&minRating=${minRating}`;
    }
    return apiClient.get(url);
};
