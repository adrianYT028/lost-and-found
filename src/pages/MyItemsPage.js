import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { apiService, getImageUrl } from '../services/api';
import Navbar from '../components/common/Navbar';
import { Package, Clock, CheckCircle, XCircle, Plus, Search, Filter } from 'lucide-react';

const MyItemsPage = () => {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMyItems = async () => {
      try {
        setLoading(true);
        const response = await apiService.items.getMyItems();
        console.log('My items response:', response); // Debug log
        
        // Handle different response structures
        let itemsData = [];
        if (response.data && Array.isArray(response.data.items)) {
          itemsData = response.data.items;
        } else if (Array.isArray(response.data)) {
          itemsData = response.data;
        } else if (Array.isArray(response)) {
          itemsData = response;
        }
        
        setItems(itemsData);
      } catch (error) {
        console.error('Error fetching my items:', error);
        setError('Failed to load your items. Please try again.');
        setItems([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMyItems();
    }
  }, [user]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'matched':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'closed':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'matched':
        return 'Matched';
      case 'closed':
        return 'Closed';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'matched':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === 'all' || item.status === filter;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getFilterCount = (status) => {
    if (status === 'all') return items.length;
    return items.filter(item => item.status === status).length;
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view your items</h1>
            <Link
              to="/auth"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Items</h1>
              <p className="text-gray-600 mt-2">Manage your reported lost and found items</p>
            </div>
            <Link
              to="/report"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Report New Item</span>
            </Link>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search your items..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="flex space-x-2">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'active', label: 'Active' },
                  { key: 'matched', label: 'Matched' },
                  { key: 'closed', label: 'Closed' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filter === key
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {label} ({getFilterCount(key)})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading your items...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Items Grid */}
          {!loading && !error && (
            <>
              {filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || filter !== 'all' 
                      ? 'Try adjusting your search or filters'
                      : 'You haven\'t reported any items yet'
                    }
                  </p>
                  {!searchTerm && filter === 'all' && (
                    <Link
                      to="/report"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                    >
                      Report Your First Item
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      {/* Item Image */}
                      <div className="h-48 bg-gray-100 relative">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={getImageUrl(item.images[0])}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-16 h-16 text-gray-400" />
                          </div>
                        )}
                        
                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {getStatusIcon(item.status)}
                            <span className="ml-1">{getStatusText(item.status)}</span>
                          </span>
                        </div>

                        {/* Type Badge */}
                        <div className="absolute top-3 left-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.type === 'lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {item.type === 'lost' ? 'Lost' : 'Found'}
                          </span>
                        </div>
                      </div>

                      {/* Item Details */}
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {item.description}
                        </p>
                        
                        <div className="space-y-2 text-sm text-gray-500">
                          <div className="flex items-center justify-between">
                            <span>Category:</span>
                            <span className="text-gray-900">{item.category}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Location:</span>
                            <span className="text-gray-900">{item.location}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Date:</span>
                            <span className="text-gray-900">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="mt-4">
                          <Link
                            to={`/item/${item.id}`}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium text-center block transition-colors"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MyItemsPage;
