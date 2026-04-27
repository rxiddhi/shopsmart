# ShopSmart Quick Start Guide

Get ShopSmart running locally in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm installed

## Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd shopsmart

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

## Step 2: Setup Backend

```bash
cd server

# Copy environment file
cp .env.example .env

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate dev --name init

# Start the backend server
npm run dev
```

Backend will run on http://localhost:3001

## Step 3: Setup Frontend

Open a new terminal:

```bash
cd client

# Copy environment file
cp .env.example .env

# Start the frontend
npm run dev
```

Frontend will run on http://localhost:5173

## Step 4: Test the Application

1. Open http://localhost:5173 in your browser
2. Click "Register" to create an account
3. Choose "User" or "Seller" role
4. Start exploring!

## API Health Check

Test if the backend is running:
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-04-22T..."}
```

## Default Ports

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Database: SQLite file at `server/dev.db`

## Troubleshooting

### Backend won't start
- Check if port 3001 is available
- Verify DATABASE_URL in server/.env
- Run `npx prisma generate` again

### Frontend won't start
- Check if port 5173 is available
- Verify VITE_API_URL in client/.env points to http://localhost:3001

### Database errors
```bash
cd server
rm -rf prisma/migrations
rm dev.db
npx prisma migrate dev --name init
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [API documentation](#) for endpoint details
- Review the [deployment guide](#) for production setup

## Sample Data

To test with sample data, you can:

1. Register as a seller (choose a seller type: digital_assets, tools, jewellery, or fashion)
2. Create products through the seller dashboard
3. Register as a user
4. Browse products and add to cart
5. Complete a purchase

## Development Commands

### Backend
```bash
npm run dev      # Start development server
npm test         # Run tests
npm start        # Start production server
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm test         # Run tests
```

## Support

For issues or questions:
- Check the [README.md](README.md)
- Review the [API documentation](#)
- Open an issue on GitHub

Happy coding! 🚀
