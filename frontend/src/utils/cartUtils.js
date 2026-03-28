export const addToCart = (cartItems, product) => {
  const existing = cartItems.find((item) => item.id === product.id);

  if (existing) {
    return cartItems.map((item) =>
      item.id === product.id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
  }

  return [...cartItems, { ...product, quantity: 1 }];
};

export const removeFromCart = (cartItems, productId) =>
  cartItems.filter((item) => item.id !== productId);

export const updateQuantity = (cartItems, productId, delta) =>
  cartItems
    .map((item) =>
      item.id === productId
        ? { ...item, quantity: item.quantity + delta }
        : item
    )
    .filter((item) => item.quantity > 0);

export const calculateTotal = (cartItems) =>
  cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

export const getCartCount = (cartItems) =>
  cartItems.reduce((count, item) => count + item.quantity, 0);

export const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(
    price
  );
