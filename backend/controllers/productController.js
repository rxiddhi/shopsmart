const products = require('../data/products');

const getAllProducts = (req, res) => {
  const { category, minPrice, maxPrice, inStock } = req.query;
  let filtered = [...products];

  if (category) {
    filtered = filtered.filter(
      (product) => product.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (minPrice) {
    filtered = filtered.filter((product) => product.price >= Number(minPrice));
  }

  if (maxPrice) {
    filtered = filtered.filter((product) => product.price <= Number(maxPrice));
  }

  if (inStock !== undefined) {
    filtered = filtered.filter((product) => product.inStock === (inStock === 'true'));
  }

  return res.status(200).json({ success: true, count: filtered.length, data: filtered });
};

const getProductById = (req, res) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  return res.status(200).json({ success: true, data: product });
};

module.exports = { getAllProducts, getProductById };
