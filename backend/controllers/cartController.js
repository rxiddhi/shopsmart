const carts = {};

const addToCart = (req, res) => {
  const { sessionId, productId, quantity = 1 } = req.body;

  if (!sessionId || !productId) {
    return res
      .status(400)
      .json({ success: false, message: 'sessionId and productId are required' });
  }

  if (!carts[sessionId]) {
    carts[sessionId] = [];
  }

  const existing = carts[sessionId].find((item) => item.productId === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    carts[sessionId].push({ productId, quantity });
  }

  return res.status(200).json({ success: true, cart: carts[sessionId] });
};

const getCart = (req, res) =>
  res.status(200).json({ success: true, cart: carts[req.params.sessionId] || [] });

module.exports = { addToCart, getCart };
