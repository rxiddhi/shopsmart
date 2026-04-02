# Celestique - Full-Stack Jewellery Store

Celestique is a warm, editorial full-stack jewellery shopping experience built with an Express backend and a single-page frontend (`frontend/celestique.html`).

## Tech Stack

- Backend: Express, CORS, Morgan
- Frontend: Single HTML SPA (vanilla JS architecture), Playfair Display style, localStorage persistence
- Testing: Jest, Supertest, Cypress
- CI/CD: GitHub Actions + Dependabot + optional EC2 deployment via PM2

## Project Structure

```text
celestique/
|-- frontend/
|   |-- celestique.html
|   |-- package.json
|   `-- src/utils/
|       |-- cartUtils.js
|       `-- cartUtils.test.js
|-- backend/
|   |-- server.js
|   |-- package.json
|   |-- .eslintrc.js
|   |-- controllers/
|   |-- routes/
|   |-- data/
|   `-- tests/
|-- cypress/
|   `-- e2e/shop.cy.js
|-- cypress.config.js
|-- .github/workflows/ci.yml
|-- .github/dependabot.yml
`-- .prettierrc
```

## Features

- Product catalogue with category and price filtering
- Product detail modal with add-to-cart actions
- Slide-in cart drawer with quantity controls and remove
- Checkout success flow
- Toast notifications and animated cart badge
- Dark mode toggle
- Local cart persistence with `localStorage`

## Quick Start

### 1. Install backend dependencies

```bash
cd backend && npm install
```

### 2. Run backend API

```bash
npm run dev
```

API runs on `http://localhost:5000`.

### 3. Serve frontend

In a separate terminal:

```bash
npx serve frontend
```

Then open `http://localhost:3000`.

### 4. Run backend tests

```bash
cd backend && npm test
```

### 5. Run frontend unit tests

```bash
cd frontend && npm test -- --watchAll=false
```

### 6. Run E2E tests

Keep backend and frontend running, then:

```bash
npx cypress open
```

## API Endpoints

- `GET /health`
- `GET /products`
- `GET /products/:id`
- `POST /cart`
  - body: `{ "sessionId": "abc", "productId": "1", "quantity": 2 }`
- `GET /cart/:sessionId`

## Architecture Notes

- Backend follows layered separation: route -> controller -> data module.
- Cart state is in-memory for demo simplicity.
- Frontend state is centralized in a single store-like object with explicit render functions.
- Utility cart logic is isolated into pure functions for testability.

## Deployment Notes

- CI runs lint and tests for both backend and frontend on `push` and `pull_request`.
- Deploy job runs only on pushes to `main` and uses an idempotent SSH/PM2 flow.
- Dependabot is configured to refresh backend, frontend, and GitHub Actions dependencies automatically.

## CI / CD Overview

This repository uses GitHub Actions for automated validation and deployment:

- `backend-ci` runs `npm ci`, `npm run lint`, and `npm test` in `./backend`
- `frontend-ci` runs `npm ci`, `npm run lint`, and `npm test -- --watchAll=false` in `./frontend`
- `deploy-backend` uses SSH secrets and `pm2` to deploy to an EC2 host when `main` is updated

### Required GitHub secrets

- `EC2_HOST`
- `EC2_USER`
- `EC2_SSH_KEY`

### Testing and quality gates

- Unit tests cover Express API endpoints and React utility functions.
- Frontend tests are implemented with Vitest and React Testing Library.
- Backend tests use Jest and Supertest.
- E2E support is available through Cypress with `cypress/e2e/shop.cy.js`.
