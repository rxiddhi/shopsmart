import {
  addToCart,
  removeFromCart,
  updateQuantity,
  calculateTotal,
  getCartCount,
} from './cartUtils';

const p1 = { id: '1', name: 'Ring A', price: 4200 };
const p2 = { id: '2', name: 'Earring B', price: 1850 };

describe('addToCart', () => {
  it('adds new item with quantity 1', () => {
    expect(addToCart([], p1)[0].quantity).toBe(1);
  });

  it('increments quantity when already in cart', () => {
    expect(addToCart([{ ...p1, quantity: 2 }], p1)[0].quantity).toBe(3);
  });

  it('adds different product as new entry', () => {
    expect(addToCart([{ ...p1, quantity: 1 }], p2)).toHaveLength(2);
  });
});

describe('removeFromCart', () => {
  it('removes item by id', () => {
    const result = removeFromCart(
      [
        { ...p1, quantity: 1 },
        { ...p2, quantity: 1 },
      ],
      '1'
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });
});

describe('updateQuantity', () => {
  it('increases quantity', () => {
    expect(updateQuantity([{ ...p1, quantity: 1 }], '1', 1)[0].quantity).toBe(2);
  });

  it('removes item when quantity drops to 0', () => {
    expect(updateQuantity([{ ...p1, quantity: 1 }], '1', -1)).toHaveLength(0);
  });
});

describe('calculateTotal', () => {
  it('returns 0 for empty cart', () => {
    expect(calculateTotal([])).toBe(0);
  });

  it('calculates correct total', () => {
    expect(
      calculateTotal([
        { ...p1, quantity: 2 },
        { ...p2, quantity: 1 },
      ])
    ).toBe(10250);
  });
});

describe('getCartCount', () => {
  it('sums all quantities', () => {
    expect(
      getCartCount([
        { ...p1, quantity: 3 },
        { ...p2, quantity: 2 },
      ])
    ).toBe(5);
  });
});
