# Fashion Product Analytics Platform

A full-stack application for managing fashion-product data and analysing seasonal sales, returns, revenue and customer ratings.

## Features

- Create, view, update and delete products
- Search products by name
- Sort and paginate product records
- Filter top-selling and top-rated products by season
- Aggregate seasonal units sold, returns and revenue
- Validate product data through a Mongoose schema
- Protect API routes with a configurable API key

## Technology stack

**Frontend:** React, React Router, Axios, CSS  
**Backend:** Node.js, Express, Mongoose  
**Database:** MongoDB

## Project structure

```text
frontend/   React user interface
backend/    Express REST API and Mongoose model
```

## Local setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm start
```

Update `.env` with your own MongoDB URI and a private API key.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

Use the same API-key value in both environment files.

## Main API routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/searchproducts` | Search, sort and paginate products |
| GET | `/api/products/:id` | Retrieve one product |
| POST | `/api/addproduct` | Create a product |
| POST | `/api/updateproduct/:id` | Update a product |
| POST | `/api/deleteproduct/:id` | Delete a product |
| GET | `/api/seasonsummary/:season` | Aggregate seasonal performance |
| GET | `/api/top-selling-products/:season` | Rank products by units sold |
| GET | `/api/top-rated-products/:season` | Rank products by customer rating |

## Security

Secrets and database credentials are loaded from environment variables. `.env` files are excluded from version control.

## Author

**Vansh Khatri**  
[LinkedIn](https://www.linkedin.com/in/vanshkhatrilondon) · [GitHub](https://github.com/Vansh9788)
