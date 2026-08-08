import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import ViewAllProduct from './components/viewAllProduct';
import AddEditProduct from './components/AddEditProduct';
import SeasonSummary from './components/seasonSummary';
import TopSellingProductsBySeason from './components/topSellingProductsBySeason';
import TopRatedProductsBySeason from './components/topRatedProductsBySeason';

function App() {
  const location = useLocation();
  const currentPath = location.pathname;
  return (
    <div className="page-wrap">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <span>Fashion Shop</span>
          </Link>
        </div>
        <div className="navigation-bar">
          <ul>
            <li>
              <Link to="/" className={currentPath === "/" ? "active" : ""}>View All Products</Link>
            </li>
            <li>
              <Link to="/add-new-product" className={currentPath === "/add-new-product" ? "active" : ""}>Add New Product</Link>
            </li>
            <li>
              <Link to="/season-summary" className={currentPath === "/season-summary" ? "active" : ""}>Season Summary</Link>
            </li>
            <li>
              <Link to="/top-selling-products-by-season" className={currentPath === "/top-selling-products-by-season" ? "active" : ""}>Top Selling Products By Season</Link>
            </li>
            <li>
              <Link to="/top-rated-products-by-season" className={currentPath === "/top-rated-products-by-season" ? "active" : ""}>Top Rated Products By Season</Link>
            </li>
          </ul>
        </div>
        <div className="header-button">
        </div>
      </div>
      <section className="container maincontainer">
        <Routes>
          <Route path="/" element={<ViewAllProduct />} />
          <Route path="/add-new-product" element={<AddEditProduct />} />
          <Route path="/edit-product/:id" element={<AddEditProduct />} />
          <Route path="/season-summary" element={<SeasonSummary />} />
          <Route path="/top-selling-products-by-season" element={<TopSellingProductsBySeason />} />
          <Route path="/top-rated-products-by-season" element={<TopRatedProductsBySeason />} />
        </Routes>
      </section>
      <section className="footer-container">
        <hr style={{ border: "1px solid #E9EAEE", marginLeft: "-30px", marginRight: "-30px" }}></hr>
        <h5 className="copyright-text">
          © 2025 Fashion Shop. All rights reserved.
        </h5>
      </section>
    </div>
  );
}

export default App;
