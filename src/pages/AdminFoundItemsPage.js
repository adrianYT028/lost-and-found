import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { Search, MapPin, Clock, User, Eye, Loader2, Shield, CheckCircle, XCircle } from 'lucide-react';
import { apiService, getImageUrl, isAuthenticated } from '../services/api';

const AdminFoundItemsPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const checkAdminAndFetch = async () => {
    try {
      if (!isAuthenticated()) {
        navigate('/login');
        return;
      }

      // Check admin status
      const profileResponse = await apiService.users.getProfile();
      if (!profileResponse || !profileResponse.data || profileResponse.data.role !== 'admin') {
        navigate('/browse');
        return;
      }

      // Fetch found items
      await fetchFoundItems();
    } catch (err) {
      console.error('Error checking admin status:', err);
      navigate('/browse');
    }
  };

  const fetchFoundItems = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.admin.getFoundItems();
      
      let itemsArray = [];
      if (Array.isArray(response)) {
        itemsArray = response;
      } else if (response && Array.isArray(response.data)) {
        itemsArray = response.data;
      } else if (response && response.data && Array.isArray(response.data.items)) {
        itemsArray = response.data.items;
      }
      
      setItems(itemsArray);
    } catch (err) {
      console.error('Error fetching found items:', err);
      setError('Failed to load found items. Please try again.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    return item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           item.description?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const ItemCard = ({ item }) => {
    const imageUrl = item.images && item.images.length > 0 ? getImageUrl(item.images[0]) : null;
    
    return (
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Item Image */}
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          {imageUrl ? (
            <>
              <img 
                src={imageUrl} 
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center" style={{ display: 'none' }}>
                <span className="text-white text-lg font-semibold">{item.title}</span>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
              <span className="text-white text-lg font-semibold">{item.title}</span>
            </div>
          )}
          {/* Found Badge */}
          <div className="absolute top-3 right-3 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            FOUND
          </div>
        </div>

        {/* Item Details */}
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {item.title}
          </h3>
          <p className="text-gray-600 mb-4 line-clamp-2">
            {item.description}
          </p>

          {/* Meta Information */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{item.location || 'Location not specified'}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-2" />
              <span>{new Date(item.createdAt || item.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <User className="w-4 h-4 mr-2" />
              <span>Found by {item.owner?.firstName} {item.owner?.lastName} ({item.owner?.studentId})</span>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="flex space-x-2">
            <button 
              onClick={() => navigate(`/item/${item.id}`)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </button>
            <button 
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              title="Mark as Claimed"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
            <button 
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              title="Remove Item"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin: Found Items Review</h1>
              <p className="text-gray-600">Review and manage found items reported by users</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search found items..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Security Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Shield className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-green-800">Admin Access</h3>
              <p className="text-sm text-green-700 mt-1">
                You are viewing found items that are hidden from public view. These items require admin verification 
                before potential claimants can be contacted to prevent false claims.
              </p>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredItems.length} of {items.length} found items awaiting review
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading found items...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md mx-auto">
              <p className="font-medium">Error Loading Found Items</p>
              <p className="text-sm mt-1">{error}</p>
              <button 
                onClick={fetchFoundItems}
                className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Items Grid */}
        {!loading && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredItems.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && filteredItems.length === 0 && items.length > 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">Try adjusting your search criteria.</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && items.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No found items</h3>
            <p className="text-gray-600">No found items have been reported yet.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default AdminFoundItemsPage;
