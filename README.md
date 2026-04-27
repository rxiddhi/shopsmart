# ShopSmart - Multi-Seller E-Commerce Platform

A comprehensive e-commerce platform supporting multiple seller types: digital assets, tools, jewellery, and fashion items.

## 🚀 Features

- **Multi-Seller Support**: Four seller categories with category-specific product attributes
- **Complete E-Commerce Flow**: Product catalog, shopping cart, order processing
- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Transaction Management**: Atomic order creation with inventory management
- **Modern UI/UX**: Beautiful, responsive design with Tailwind CSS and Heroicons
- **Seller Dashboard**: Complete product and order management for sellers
- **Real-time Updates**: React Query for efficient data fetching and caching
- **CI/CD Pipeline**: Automated testing and deployment to Vercel (frontend) and Render (backend)
- **Modern Tech Stack**: React + Vite frontend, Node.js/Express backend, Prisma ORM, SQLite3

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

## 🛠️ Installation

### Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your configuration
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev
```

## 🔧 Environment Variables

### Backend (.env)
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-in-production"
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"
PORT=3001
NODE_ENV="development"
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001
```

## 🧪 Testing

### Backend Tests
```bash
cd server
npm test
```

### Frontend Tests
```bash
cd client
npm test
```

## 📦 Deployment

**Full deployment guide available in [DEPLOYMENT.md](DEPLOYMENT.md)**

**CI/CD pipeline overview in [CI-CD-SUMMARY.md](CI-CD-SUMMARY.md)**

### Quick Start

1. **Push to GitHub**
2. **Deploy Backend to Render** (see DEPLOYMENT.md)
3. **Deploy Frontend to Vercel** (see DEPLOYMENT.md)
4. **Configure GitHub Secrets** for automated CI/CD
5. **Push to main branch** - automatic deployment!

### GitHub Secrets Required

For automated deployment, configure these secrets in your GitHub repository:

**Vercel (Frontend):**
- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID
- `VITE_API_URL`: Your production API URL

**Render (Backend):**
- `RENDER_DEPLOY_HOOK`: Your Render deploy hook URL
- `RENDER_API_URL`: Your Render service URL

### Manual Deployment

**Frontend (Vercel):**
```bash
cd client
npm run build
# Deploy dist/ folder to Vercel
```

**Backend (Render):**
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy automatically on push to main

## 🏗️ Project Structure

```
shopsmart/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/        # Page components
│   │   │   ├── Home.jsx           # Landing page
│   │   │   ├── ProductList.jsx    # Product catalog with filters
│   │   │   ├── ProductDetail.jsx  # Single product view
│   │   │   ├── Login.jsx          # Login page
│   │   │   ├── Register.jsx       # Registration (user/seller)
│   │   │   ├── Cart.jsx           # Shopping cart
│   │   │   ├── Orders.jsx         # Order history
│   │   │   └── SellerDashboard.jsx # Seller management
│   │   ├── lib/          # API client & utilities
│   │   ├── App.jsx       # Main app component with routing
│   │   └── main.jsx      # Entry point
│   └── package.json
├── server/                # Node.js backend
│   ├── src/
│   │   ├── services/     # Business logic
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Express middleware
│   │   ├── app.js        # Express app
│   │   └── index.js      # Server entry point
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   └── package.json
└── .github/
    └── workflows/
        └── deploy.yml    # CI/CD pipeline
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user/seller
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Products
- `GET /api/products` - List products (with filters)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (seller only)
- `PUT /api/products/:id` - Update product (seller only)
- `DELETE /api/products/:id` - Delete product (seller only)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item
- `DELETE /api/cart/items/:id` - Remove cart item
- `DELETE /api/cart` - Clear cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status (seller only)

### Sellers
- `POST /api/sellers/register` - Register seller
- `GET /api/sellers/profile` - Get seller profile
- `PUT /api/sellers/profile` - Update seller profile
- `GET /api/sellers/products` - Get seller's products
- `GET /api/sellers/orders` - Get seller's orders

## 🎨 Seller Types & Product Categories

### Digital Assets
Required attributes: `fileType`, `fileSize`, `downloadLink`, `license`

### Tools
Required attributes: `brand`, `warranty`, `specifications`, `material`

### Jewellery
Required attributes: `metal`, `gemstone`, `weight`, `purity`, `certification`

### Fashion
Required attributes: `size`, `color`, `material`, `brand`, `gender`

## 🔒 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt (cost factor 12)
- Role-based access control
- CORS configuration
- Rate limiting (100 req/15min public, 1000 req/15min authenticated)
- Helmet.js security headers
- Input validation with Zod
- SQL injection prevention (Prisma ORM)

## 📊 Database Schema

- **Users**: Customer accounts
- **Sellers**: Vendor accounts with seller type
- **Products**: Product catalog with category-specific attributes
- **CartItems**: Shopping cart items
- **Orders**: Order records with shipping/payment info
- **OrderItems**: Individual items in orders with price snapshots

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Built with React, Node.js, Express, Prisma, and SQLite
- Deployed on Vercel and Render
- CI/CD with GitHub Actions
