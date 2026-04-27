import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { ShoppingCartIcon, UserCircleIcon, HomeIcon, CubeIcon } from '@heroicons/react/24/outline';

// Pages
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import SellerDashboard from './pages/SellerDashboard';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          {/* Navigation */}
          <nav className="bg-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                {/* Logo and main nav */}
                <div className="flex">
                  <Link to="/" className="flex items-center">
                    <CubeIcon className="h-8 w-8 text-indigo-600" />
                    <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      GameVault
                    </span>
                  </Link>
                  <div className="ml-10 flex items-center space-x-8">
                    <Link 
                      to="/" 
                      className="flex items-center text-gray-700 hover:text-indigo-600 transition-colors font-medium"
                    >
                      <HomeIcon className="h-5 w-5 mr-1" />
                      Home
                    </Link>
                    <Link 
                      to="/products" 
                      className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
                    >
                      Products
                    </Link>
                  </div>
                </div>

                {/* Right side nav */}
                <div className="flex items-center space-x-4">
                  {user ? (
                    <>
                      {user.role === 'user' && (
                        <Link
                          to="/cart"
                          className="relative p-2 text-gray-700 hover:text-indigo-600 transition-colors"
                        >
                          <ShoppingCartIcon className="h-6 w-6" />
                          {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {cartCount}
                            </span>
                          )}
                        </Link>
                      )}
                      
                      <div className="flex items-center space-x-3">
                        <UserCircleIcon className="h-6 w-6 text-gray-400" />
                        <span className="text-gray-700 font-medium">{user.name}</span>
                      </div>

                      {user.role === 'seller' && (
                        <Link
                          to="/seller/dashboard"
                          className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 transition-colors font-medium"
                        >
                          Dashboard
                        </Link>
                      )}
                      
                      {user.role === 'user' && (
                        <Link
                          to="/orders"
                          className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
                        >
                          Orders
                        </Link>
                      )}
                      
                      <button
                        onClick={handleLogout}
                        className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition-colors font-medium"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg transition-all font-medium shadow-md hover:shadow-lg"
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/login" element={<Login setUser={setUser} />} />
              <Route path="/register" element={<Register setUser={setUser} />} />
              <Route 
                path="/cart" 
                element={user ? <Cart setCartCount={setCartCount} /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/orders" 
                element={user ? <Orders /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/seller/dashboard" 
                element={user?.role === 'seller' ? <SellerDashboard /> : <Navigate to="/" />} 
              />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="bg-gray-900 text-white mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">GameVault</h3>
                  <p className="text-gray-400">
                    Your ultimate marketplace for PC games, console games, mobile games, and gaming gear.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Shop</h4>
                  <ul className="space-y-2 text-gray-400">
                    <li><Link to="/products?category=pc_games" className="hover:text-white">PC Games</Link></li>
                    <li><Link to="/products?category=console_games" className="hover:text-white">Console Games</Link></li>
                    <li><Link to="/products?category=mobile_games" className="hover:text-white">Mobile Games</Link></li>
                    <li><Link to="/products?category=gaming_gear" className="hover:text-white">Gaming Gear</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Support</h4>
                  <ul className="space-y-2 text-gray-400">
                    <li><a href="#" className="hover:text-white">Help Center</a></li>
                    <li><a href="#" className="hover:text-white">Contact Us</a></li>
                    <li><a href="#" className="hover:text-white">Shipping Info</a></li>
                    <li><a href="#" className="hover:text-white">Returns</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Sell</h4>
                  <ul className="space-y-2 text-gray-400">
                    <li><Link to="/register" className="hover:text-white">Become a Seller</Link></li>
                    <li><a href="#" className="hover:text-white">Seller Guide</a></li>
                    <li><a href="#" className="hover:text-white">Pricing</a></li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                <p>&copy; 2026 GameVault. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
