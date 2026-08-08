const mongoose = require('mongoose');

const fashionProductSchema = new mongoose.Schema({
  "Product Category": { type: String, required: [true, "Product Category is required"] },
  "Product Name": { type: String, required: [true, "Product Name is required"] },
  "Units Sold": { type: Number, required: [true, "Units Sold is required"], min: 0 },
  "Returns": { type: Number, required: [true, "Returns is required"], min: 0 },
  "Revenue": { type: Number, required: [true, "Revenue is required"], min: 0 },
  "Customer Rating": { type: Number, required: [true, "Customer Rating is required"], min: 0, max: 5 },
  "Stock Level": { type: Number, required: [true, "Stock Level is required"], min: 0 },
  "Season": { type: String, required: [true, "Season is required"] },
  "Trend Score": { type: Number, required: [true, "Trend Score is required"], min: 0 }
});

const FashionProduct = mongoose.model('FashionProduct', fashionProductSchema, 'FashionShopData');

module.exports = FashionProduct;

