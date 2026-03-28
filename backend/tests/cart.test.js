const request = require('supertest');
const app = require('../server');

describe('Cart API', () => {
  const sessionId = `test-session-${Date.now()}`;

  it('adds item to cart', async () => {
    const res = await request(app)
      .post('/cart')
      .send({ sessionId, productId: '1', quantity: 2 });

    expect(res.statusCode).toBe(200);
    expect(res.body.cart[0].quantity).toBe(2);
  });

  it('returns 400 without sessionId', async () => {
    const res = await request(app).post('/cart').send({ productId: '1' });
    expect(res.statusCode).toBe(400);
  });

  it('retrieves cart by sessionId', async () => {
    const res = await request(app).get(`/cart/${sessionId}`);
    expect(Array.isArray(res.body.cart)).toBe(true);
  });
});
