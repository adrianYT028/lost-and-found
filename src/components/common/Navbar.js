import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, X, User, LogOut } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  console.log('Navbar user:', user);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const handleHowItWorksClick = () => {
    if (location.pathname === '/') {
      // If already on home page, just scroll to the section
      const element = document.getElementById('how-it-works');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If not on home page, navigate to home page and then scroll
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById('how-it-works');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">LostFound</span>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link 
                to="/" 
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-blue-600'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/browse" 
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/browse') 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-blue-600'
                }`}
              >
                Browse Items
              </Link>
              <Link 
                to="/report" 
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/report') 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-blue-600'
                }`}
              >
                Report Item
              </Link>
              <button 
                onClick={handleHowItWorksClick}
                className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
              >
                How It Works
              </button>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>{user.firstName || user.name}</span>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                    <Link
                      to="/my-items"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      My Items
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <div className="w-4 h-4 mr-2">🛠️</div>
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link 
                  to="/auth" 
                  className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/auth" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-500 hover:text-gray-900 focus:outline-none focus:text-gray-900 p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-100">
              <Link 
                to="/" 
                className={`block px-3 py-2 text-base font-medium ${
                  isActive('/') ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-blue-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/browse" 
                className={`block px-3 py-2 text-base font-medium ${
                  isActive('/browse') ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-blue-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Items
              </Link>
              <Link 
                to="/report" 
                className={`block px-3 py-2 text-base font-medium ${
                  isActive('/report') ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-blue-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Report Item
              </Link>
              <button 
                onClick={handleHowItWorksClick}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-500 hover:text-blue-600"
              >
                How It Works
              </button>
              <div className="border-t border-gray-100 pt-3">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setShowUserMenu(false);
                        setIsMenuOpen(false);
                      }}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/auth" 
                      className="text-gray-500 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/auth" 
                      className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium block text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
