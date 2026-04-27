import { Link } from 'react-router-dom';
import { 
  ShoppingBagIcon, 
  SparklesIcon, 
  ShieldCheckIcon, 
  TruckIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  RocketLaunchIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  const categories = [
    {
      name: 'PC Games',
      icon: ComputerDesktopIcon,
      description: 'AAA titles, indie games, and digital downloads',
      color: 'from-blue-500 to-cyan-500',
      link: '/products?category=pc_games'
    },
    {
      name: 'Console Games',
      icon: RocketLaunchIcon,
      description: 'PlayStation, Xbox, and Nintendo games',
      color: 'from-purple-500 to-pink-500',
      link: '/products?category=console_games'
    },
    {
      name: 'Mobile Games',
      icon: DevicePhoneMobileIcon,
      description: 'iOS and Android games and in-game currency',
      color: 'from-green-500 to-teal-500',
      link: '/products?category=mobile_games'
    },
    {
      name: 'Gaming Gear',
      icon: CpuChipIcon,
      description: 'Controllers, headsets, keyboards, and accessories',
      color: 'from-orange-500 to-red-500',
      link: '/products?category=gaming_gear'
    }
  ];

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Secure Payments',
      description: 'Your transactions are protected with industry-standard encryption'
    },
    {
      icon: TruckIcon,
      title: 'Instant Delivery',
      description: 'Get your game keys and digital content instantly'
    },
    {
      icon: ShoppingBagIcon,
      title: 'Verified Sellers',
      description: 'All sellers are verified for authentic games and gear'
    },
    {
      icon: SparklesIcon,
      title: 'Best Prices',
      description: 'Competitive pricing on the latest and classic games'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              Welcome to GameVault
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-indigo-100 max-w-3xl mx-auto">
              Discover amazing games and gaming gear from trusted sellers across PC, console, mobile, and accessories
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Browse Games
              </Link>
              <Link
                to="/register"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-indigo-600 transition-all"
              >
                Sell Your Games
              </Link>
            </div>
          </div>
        </div>
        
        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-xl text-gray-600">
            Explore our diverse range of products
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={category.link}
              className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
              <div className="p-8">
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${category.color} mb-4`}>
                  <category.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {category.name}
                </h3>
                <p className="text-gray-600">
                  {category.description}
                </p>
                <div className="mt-4 text-indigo-600 font-semibold flex items-center">
                  Browse <span className="ml-2 group-hover:ml-4 transition-all">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose GameVault?
            </h2>
            <p className="text-xl text-gray-600">
              We make game shopping easy, safe, and enjoyable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="inline-flex p-4 rounded-full bg-indigo-100 mb-4">
                  <feature.icon className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Selling Games?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of game sellers and reach millions of gamers worldwide
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
          >
            Start Selling Today
          </Link>
        </div>
      </div>
    </div>
  );
}
