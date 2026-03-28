describe('Celestique E2E', () => {
  beforeEach(() => cy.visit('/'));

  it('displays the product grid', () => {
    cy.get('[data-testid="product-grid"]').should('exist');
    cy.get('[data-testid="product-card"]').should('have.length.greaterThan', 0);
  });

  it('filters products by category', () => {
    cy.get('[data-testid="category-filter"]').contains('Rings').click();
    cy.get('[data-testid="product-card"]').each(($card) =>
      cy.wrap($card).contains('Ring')
    );
  });

  it('opens product detail and shows add to cart', () => {
    cy.get('[data-testid="product-card"]').first().click();
    cy.get('[data-testid="add-to-cart-btn"]').should('exist');
  });

  it('adds to cart and cart shows item', () => {
    cy.get('[data-testid="product-card"]').first().click();
    cy.get('[data-testid="add-to-cart-btn"]').click();
    cy.get('[data-testid="cart-count"]').should('contain', '1');
    cy.get('[data-testid="cart-icon"]').click();
    cy.get('[data-testid="cart-item"]').should('have.length.greaterThan', 0);
  });

  it('increases and decreases quantity', () => {
    cy.get('[data-testid="product-card"]').first().click();
    cy.get('[data-testid="add-to-cart-btn"]').click();
    cy.get('[data-testid="cart-icon"]').click();
    cy.get('[data-testid="qty-increase"]').first().click();
    cy.get('[data-testid="item-quantity"]').first().should('contain', '2');
    cy.get('[data-testid="qty-decrease"]').first().click();
    cy.get('[data-testid="item-quantity"]').first().should('contain', '1');
  });

  it('removes item from cart', () => {
    cy.get('[data-testid="product-card"]').first().click();
    cy.get('[data-testid="add-to-cart-btn"]').click();
    cy.get('[data-testid="cart-icon"]').click();
    cy.get('[data-testid="remove-item"]').first().click();
    cy.get('[data-testid="empty-cart"]').should('be.visible');
  });

  it('completes full checkout flow', () => {
    cy.get('[data-testid="product-card"]').first().click();
    cy.get('[data-testid="add-to-cart-btn"]').click();
    cy.get('[data-testid="cart-icon"]').click();
    cy.get('[data-testid="checkout-btn"]').click();
    cy.get('[data-testid="order-success"]').should('be.visible');
  });
});
