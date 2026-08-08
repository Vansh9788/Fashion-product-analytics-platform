const cors = require('cors');
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./dbConnect');
const FashionProduct = require('./fashionProductModel');

dotenv.config();

const validApiKey = process.env.API_KEY;
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());

connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function apiKeyAuth(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    if (!validApiKey) {
        return res.status(503).json({ error: 'API key is not configured' });
    }
    if (!apiKey || apiKey !== validApiKey) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or missing API key' });
    }
    next();
}

app.use('/api', apiKeyAuth);

app.post('/api/addproduct', (req, res) => {
    if (req.body == null) {
        return res.status(400).json({ errors: ['Request body is missing'] });
    }

    const {
        productCategory,
        productName,
        unitsSold,
        returns,
        revenue,
        customerRating,
        stockLevel,
        season,
        trendScore
    } = req.body;

    const newProduct = new FashionProduct({
        "Product Category": productCategory,
        "Product Name": productName,
        "Units Sold": unitsSold,
        "Returns": returns,
        "Revenue": revenue,
        "Customer Rating": customerRating,
        "Stock Level": stockLevel,
        "Season": season,
        "Trend Score": trendScore
    });

    newProduct.save()
        .then(savedProduct => {
            res.status(201).json(savedProduct);
        })
        .catch(err => {
            if (err.name === 'ValidationError') {
                const errors = Object.values(err.errors).map(e => e.message);
                return res.status(400).json({ errors: errors });
            }
            res.status(500).json({ error: err.message });
        });
});

app.post('/api/updateproduct/:id', (req, res) => {
    if (req.body == null) {
        return res.status(400).json({ errors: ['Request body is missing'] });
    }
    const productId = req.params.id;

    const updateObj = {};
    if (req.body.productCategory !== undefined) updateObj["Product Category"] = req.body.productCategory;
    if (req.body.productName !== undefined) updateObj["Product Name"] = req.body.productName;
    if (req.body.unitsSold !== undefined) updateObj["Units Sold"] = req.body.unitsSold;
    if (req.body.returns !== undefined) updateObj["Returns"] = req.body.returns;
    if (req.body.revenue !== undefined) updateObj["Revenue"] = req.body.revenue;
    if (req.body.customerRating !== undefined) updateObj["Customer Rating"] = req.body.customerRating;
    if (req.body.stockLevel !== undefined) updateObj["Stock Level"] = req.body.stockLevel;
    if (req.body.season !== undefined) updateObj["Season"] = req.body.season;
    if (req.body.trendScore !== undefined) updateObj["Trend Score"] = req.body.trendScore;

    if (Object.keys(updateObj).length === 0) {
        return res.status(400).json({ errors: ['No valid fields provided for update.'] });
    }

    FashionProduct.findByIdAndUpdate(productId, { $set: updateObj }, { new: true, runValidators: true })
        .then(updated => {
            if (!updated) {
                return res.status(404).json({ errors: ['Product not found.'] });
            }
            res.json(updated);
        })
        .catch(err => {
            if (err.name === 'ValidationError') {
                const errors = Object.values(err.errors).map(e => e.message);
                return res.status(400).json({ errors: errors });
            }
            res.status(500).json({ errors: [err.message] });
        });
});

app.post('/api/deleteproduct/:id', (req, res) => {
    const productId = req.params.id;

    FashionProduct.findByIdAndDelete(productId)
        .then(deleted => {
            if (!deleted) {
                return res.status(404).json({ errors: ['Product not found.'] });
            }
            res.json(deleted);
        })
        .catch(err => {
            res.status(500).json({ errors: [err.message] });
        });
});

app.get('/api/seasonsummary/:season', async (req, res) => {
    const season = req.params.season;
    try {
        const summary = await FashionProduct.aggregate([
            { $match: { "Season": { $regex: `^${season}$`, $options: "i" } } },
            {
                $group: {
                    _id: null,
                    totalUnitsSold: { $sum: "$Units Sold" },
                    totalReturns: { $sum: "$Returns" },
                    totalRevenue: { $sum: "$Revenue" }
                }
            }
        ]);

        if (summary.length === 0) {
            return res.status(404).json({ error: `No records found for season '${season}'` });
        }

        res.json({
            season,
            totalUnitsSold: summary[0].totalUnitsSold,
            totalReturns: summary[0].totalReturns,
            totalRevenue: summary[0].totalRevenue
        });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

app.get('/api/top-selling-products/:season', async (req, res) => {
    const season = req.params.season;
    const unitsSoldMin = req.query.unitsSoldMin ? parseInt(req.query.unitsSoldMin, 10) : 0;
    const pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber, 10) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize, 10) : 10;

    if (isNaN(unitsSoldMin) || isNaN(pageNumber) || isNaN(pageSize)) {
        return res.status(400).json({ errors: ['unitsSoldMin, pageNumber, and pageSize must be valid numbers'] });
    }

    if (pageNumber < 1 || pageSize < 1) {
        return res.status(400).json({ errors: ['pageNumber and pageSize must be greater than 0'] });
    }

    try {
        const filter = {
            "Season": { $regex: `^${season}$`, $options: 'i' }
        };
        if (unitsSoldMin > 0) {
            filter["Units Sold"] = { $gte: unitsSoldMin };
        }
        const totalCount = await FashionProduct.countDocuments(filter);
        const results = await FashionProduct.find(filter)
            .sort({ "Units Sold": -1 })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .lean();

        res.json({
            season,
            unitsSoldMin,
            pageNumber,
            pageSize,
            count: results.length,
            totalCount,
            products: results
        });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

app.get('/api/searchproducts', async (req, res) => {
    const productName = req.query.productName;
    const pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber, 10) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize, 10) : 10;
    const sortKey = req.query.sortKey;
    const sortDirection = req.query.sortDirection === 'desc' ? -1 : 1;

    if (isNaN(pageNumber) || isNaN(pageSize) || pageNumber < 1 || pageSize < 1) {
        return res.status(400).json({ error: 'pageNumber and pageSize must be valid positive numbers' });
    }

    try {
        const filter = {};
        if (productName) {
            filter["Product Name"] = { $regex: productName, $options: 'i' };
        }

        const totalCount = await FashionProduct.countDocuments(filter);

        let query = FashionProduct.find(filter)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .lean();

        if (sortKey != null && sortKey.trim() !== '') {
            const sortObj = {};
            sortObj[sortKey] = sortDirection;
            query = query.sort(sortObj);
        }

        const results = await query;

        res.json({
            productName: productName || null,
            pageNumber,
            pageSize,
            count: results.length,
            totalCount,
            products: results
        });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

app.get('/api/seasons', (req, res) => {
    const seasons = ["Spring", "Summer", "Autumn", "Winter"];
    res.json(seasons);
});

app.get('/api/products/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const product = await FashionProduct.findById(productId).lean();
        if (!product) {
            return res.status(404).json({ errors: ['Product not found'] });
        }
        res.json(product);
    } catch (err) {
        res.status(500).json({ errors: [err.message] });
    }
});

app.get('/api/categories', async (req, res) => {
    try {
        const categories = await FashionProduct.distinct("Product Category");
        res.json(categories);
    } catch (err) {
        res.status(500).json({ errors: [err.message] });
    }
});

app.get('/api/top-rated-products/:season', async (req, res) => {
    const season = req.params.season;
    const minRating = req.query.minRating ? parseFloat(req.query.minRating) : 0;
    const pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber, 10) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize, 10) : 10;

    if (isNaN(minRating) || isNaN(pageNumber) || isNaN(pageSize) || pageNumber < 1 || pageSize < 1) {
        return res.status(400).json({ error: 'Invalid query parameters' });
    }

    try {
        const filter = {
            Season: { $regex: `^${season}$`, $options: 'i' },
            "Customer Rating": { $gte: minRating }
        };

        const totalCount = await FashionProduct.countDocuments(filter);

        const products = await FashionProduct.find(filter)
            .sort({ "Customer Rating": -1 })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .lean();

        res.json({
            season,
            minRating,
            pageNumber,
            pageSize,
            count: products.length,
            totalCount,
            products
        });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});



app.get('/', (req, res) => {
    res.send('Fashion Shop API running');
});

app.listen(port, function () {
    console.log(`Server is running on port ${port}`);
});

