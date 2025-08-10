import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { Search, Filter, MapPin, Clock, User, Eye, Loader2 } from 'lucide-react';
import { apiService, getImageUrl } from '../services/api';

const BrowsePage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch items on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.items.getAll();
      console.log('API Response:', response);
      
      // The API returns items directly as an array
      const itemsArray = Array.isArray(response) ? response : [];
      console.log('Items array:', itemsArray);
      setItems(itemsArray);
      
      // Debug: Log categories in the items
      const categoriesInItems = [...new Set(itemsArray.map(item => item.category).filter(Boolean))];
      console.log('Categories found in items:', categoriesInItems);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Failed to load items. Please try again.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'Electronics', 'Bags', 'Jewelry', 'Accessories', 'Documents', 'Clothing'];
  const types = ['all', 'lost', 'found'];

  const filteredItems = Array.isArray(items) ? items.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesCategory = selectedCategory === 'all' || item.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesType = selectedType === 'all' || item.type === selectedType;
    
    // Debug logging
    if (selectedCategory !== 'all') {
      console.log(`Item: ${item.title}, Category: "${item.category}", Selected: "${selectedCategory}", Matches: ${matchesCategory}`);
    }
    
    return matchesSearch && matchesCategory && matchesType;
  }) : [];

  const ItemCard = ({ item }) => {
    const imageUrl = item.images && item.images.length > 0 ? getImageUrl(item.images[0]) : null;
    
    return (
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
        {/* Item Image */}
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          {imageUrl ? (
            <>
              <img 
                src={imageUrl} 
                alt={item.title}
                className="w-full h-full object-cover"
                style={{ display: 'block' }}
                onLoad={(e) => {
                  e.target.style.display = 'block';
                  e.target.nextSibling.style.display = 'none';
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center" style={{ display: 'none' }}>
                <span className="text-white text-lg font-semibold">{item.title}</span>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <span className="text-white text-lg font-semibold">{item.title}</span>
            </div>
          )}
          {/* Type Badge */}
          <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${
            item.type === 'lost' 
              ? 'bg-red-100 text-red-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {item.type === 'lost' ? 'LOST' : 'FOUND'}
          </div>
        </div>

      {/* Item Details */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
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
            <span>Posted by {item.user?.name || item.postedBy || 'Anonymous'}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(item.tags || []).slice(0, 3).map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              #{tag}
            </span>
          ))}
        </div>

        {/* Action Button */}
        <button 
          onClick={() => navigate(`/item/${item.id}`)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </button>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Lost & Found Items</h1>
          <p className="text-gray-600">Find your lost belongings or help others recover theirs</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search Bar */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for items..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {types.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Items' : type === 'lost' ? 'Lost Items' : 'Found Items'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredItems.length} of {items.length} items
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading items...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md mx-auto">
              <p className="font-medium">Error Loading Items</p>
              <p className="text-sm mt-1">{error}</p>
              <button 
                onClick={fetchItems}
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
              <ItemCard key={item._id || item.id} item={item} />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && filteredItems.length === 0 && items.length > 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or check back later.</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && items.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No items yet</h3>
            <p className="text-gray-600">Be the first to report a lost or found item!</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default BrowsePage;
