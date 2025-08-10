import React, { useState, useEffect } from 'react';
import { Sparkles, Check, X, Eye, MapPin, Clock, User } from 'lucide-react';
import { apiService } from '../services/api';

const AIMatchSuggestions = ({ itemId, onMatchAction }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Skip API call and show construction message directly
    setLoading(false);
    setError('');
  }, [itemId]);

  const fetchMatches = async () => {
    // Function kept for compatibility but does nothing
    // Since we're showing construction message instead
    setLoading(false);
    setError('');
  };

  const handleConfirmMatch = async (matchId) => {
    try {
      await apiService.matches.confirm(matchId);
      setMatches(matches.filter(m => m.id !== matchId));
      onMatchAction?.('confirmed');
    } catch (err) {
      console.error('Error confirming match:', err);
    }
  };

  const handleRejectMatch = async (matchId) => {
    try {
      await apiService.matches.reject(matchId);
      setMatches(matches.filter(m => m.id !== matchId));
      onMatchAction?.('rejected');
    } catch (err) {
      console.error('Error rejecting match:', err);
    }
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">AI Match Suggestions</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Finding potential matches...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">AI Match Suggestions</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchMatches}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">AI Match Suggestions</h3>
        </div>
      </div>

      {/* Under Construction Message */}
      <div className="text-center py-12">
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-blue-600" />
          </div>
          <h4 className="text-xl font-semibold text-gray-900 mb-2">AI Matching Coming Soon!</h4>
          <p className="text-gray-600 max-w-md mx-auto">
            We're building an intelligent matching system to help you find your items faster. This exciting feature will be available in the next update!
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
          <div className="flex items-start">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <div className="text-left">
              <p className="text-sm text-blue-800 font-medium mb-2">What's Coming:</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>🔍 Smart image recognition technology</li>
                <li>🧠 Advanced matching algorithms</li>
                <li>⚡ Instant similarity detection</li>
                <li>📱 Real-time match notifications</li>
                <li>🎯 Location-based smart suggestions</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 p-3 bg-gray-50 rounded-lg max-w-sm mx-auto">
          <p className="text-sm text-gray-600">
            💡 <strong>Pro Tip:</strong> For now, try browsing similar items manually using our search filters!
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIMatchSuggestions;