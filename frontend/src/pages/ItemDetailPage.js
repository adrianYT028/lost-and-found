import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import AIMatchSuggestions from '../components/AIMatchSuggestions';
import { MapPin, Clock, User, ArrowLeft, Mail, Phone, Tag, Eye } from 'lucide-react';
import { apiService, getImageUrl } from '../services/api';

const ItemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.items.getById(id);
      setItem(response.data.item);
    } catch (err) {
      console.error('Error fetching item:', err);
      setError('Failed to load item details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading item details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Item Not Found</h1>
            <p className="text-gray-600 mb-8">{error || 'The item you are looking for does not exist.'}</p>
            <button
              onClick={() => navigate('/browse')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center mx-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Browse
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => navigate('/browse')}
          className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Browse
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="relative">
              {item.images && item.images.length > 0 ? (
                <img 
                  src={getImageUrl(item.images[0])} 
                  alt={item.title}
                  className="w-full h-96 md:h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`w-full h-96 md:h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center ${item.images && item.images.length > 0 ? 'hidden' : ''}`}>
                <span className="text-white text-2xl font-semibold">{item.title}</span>
              </div>
              
              {/* Type Badge */}
              <div className={`absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-medium ${
                item.type === 'lost' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {item.type === 'lost' ? 'LOST' : 'FOUND'}
              </div>
            </div>

            {/* Details Section */}
            <div className="p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{item.title}</h1>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                  <span>{item.location || 'Location not specified'}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-3 text-gray-400" />
                  <span>{new Date(item.createdAt || item.date).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <User className="w-5 h-5 mr-3 text-gray-400" />
                  <span>Posted by {item.owner?.firstName} {item.owner?.lastName} ({item.owner?.studentId})</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Tag className="w-5 h-5 mr-3 text-gray-400" />
                  <span className="capitalize">{item.category}</span>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {item.contactInfo?.email && (
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-3 text-gray-400" />
                      <a 
                        href={`mailto:${item.contactInfo.email}`}
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        {item.contactInfo.email}
                      </a>
                    </div>
                  )}
                  
                  {item.contactInfo?.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-3 text-gray-400" />
                      <a 
                        href={`tel:${item.contactInfo.phone}`}
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        {item.contactInfo.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Owner
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Match Suggestions */}
        {process.env.REACT_APP_ENABLE_AI_MATCHING === 'true' && (
          <div className="mt-8">
            <AIMatchSuggestions 
              itemId={item.id} 
              onMatchAction={(action) => {
                console.log('Match action:', action);
                // You can add more logic here like showing notifications
              }}
            />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ItemDetailPage;
