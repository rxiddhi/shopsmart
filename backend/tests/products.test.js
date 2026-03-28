const request = require('supertest');
const app = require('../server');

describe('GET /products', () => {
  it('returns all products with success flag', async () => {
    const res = await request(app).get('/products');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('filters by category', async () => {
    const res = await request(app).get('/products?category=Rings');
    res.body.data.forEach((product) => expect(product.category).toBe('Rings'));
  });

  it('filters by price range', async () => {
    const res = await request(app).get('/products?minPrice=2000&maxPrice=3000');
    res.body.data.forEach((product) => {
      expect(product.price).toBeGreaterThanOrEqual(2000);
      expect(product.price).toBeLessThanOrEqual(3000);
    });
  });
});

describe('GET /products/:id', () => {
  it('returns a single product', async () => {
    const res = await request(app).get('/products/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe('1');
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).get('/products/999');
    expect(res.statusCode).toBe(404);
  });
});
