import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { Upload, MapPin, Calendar, Tag, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { apiService } from '../services/api';

const ReportPage = () => {
  const navigate = useNavigate();
  const [itemType, setItemType] = useState('lost');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    date: '',
    contactEmail: '',
    contactPhone: '',
    reward: ''
  });
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    'Electronics', 'Bags', 'Jewelry', 'Accessories', 'Documents', 
    'Clothing', 'Books', 'Keys', 'Sports Equipment', 'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    setUploadedFiles(prev => [...prev, ...imageFiles].slice(0, 5)); // Max 5 files
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Prepare the form data for API
      const itemData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: {
          building: formData.location,
          type: "building"
        },
        dateTime: formData.date,
        type: itemType,
        contactInfo: {
          email: formData.contactEmail,
          phone: formData.contactPhone
        },
        reward: formData.reward || null
      };

      // Create FormData for file upload if files exist
      const apiFormData = new FormData();
      Object.keys(itemData).forEach(key => {
        if (key === 'contactInfo' || key === 'location') {
          apiFormData.append(key, JSON.stringify(itemData[key]));
        } else {
          apiFormData.append(key, itemData[key]);
        }
      });

      // Add uploaded files
      uploadedFiles.forEach((file, index) => {
        apiFormData.append('images', file);
      });

      // Call API to create item
      const response = await apiService.items.create(apiFormData);
      console.log('Item created successfully:', response);
      setSubmitted(true);

    } catch (error) {
      console.error('Error submitting item:', error);
      setError(error.message || 'Failed to submit item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Item Successfully Reported!
            </h2>
            <p className="text-gray-600 mb-6">
              Your {itemType} item has been added to our database. Our AI system will start looking for matches immediately.
            </p>
            <div className="space-y-3 text-left bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">
                <strong>What happens next:</strong>
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Your item is now searchable by other users</li>
                <li>• AI will analyze uploaded images for automatic matching</li>
                <li>• You'll receive email notifications for potential matches</li>
                <li>• Check your dashboard regularly for updates</li>
              </ul>
            </div>
            <div className="flex justify-center">
              <button 
                onClick={() => setSubmitted(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Report Another Item
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Report an Item</h1>
          <p className="text-gray-600">Help others find their belongings or get help finding yours</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Type Selection */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">What would you like to report?</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setItemType('lost')}
              className={`p-6 rounded-lg border-2 transition-all ${
                itemType === 'lost'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-semibold">Lost Item</h3>
              <p className="text-sm text-gray-600">I lost something and need help finding it</p>
            </button>
            <button
              type="button"
              onClick={() => setItemType('found')}
              className={`p-6 rounded-lg border-2 transition-all ${
                itemType === 'found'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <CheckCircle className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-semibold">Found Item</h3>
              <p className="text-sm text-gray-600">I found something and want to return it</p>
            </button>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g., iPhone 14 Pro, Blue Backpack"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  required
                  placeholder="e.g., Main Library, Engineering Building"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date {itemType === 'lost' ? 'Lost' : 'Found'} *
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Upload className="w-4 h-4 inline mr-1" />
                  Upload Photos
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop photos here, or{' '}
                    <label className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                      browse
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </label>
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB each (max 5 photos)</p>
                </div>
                
                {/* Uploaded Files Preview */}
                {uploadedFiles.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              required
              rows={4}
              placeholder="Provide a detailed description including color, size, brand, distinctive features, etc."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          {/* Contact Information */}
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email *
              </label>
              <input
                type="email"
                name="contactEmail"
                required
                placeholder="your.email@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.contactEmail}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone
              </label>
              <input
                type="tel"
                name="contactPhone"
                placeholder="+91 XXXXX XXXXX"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.contactPhone}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Reward (for lost items) */}
          {itemType === 'lost' && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reward (Optional)
              </label>
              <input
                type="text"
                name="reward"
                placeholder="e.g., ₹500, Coffee treat"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.reward}
                onChange={handleInputChange}
              />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => navigate('/browse')}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                `Report ${itemType === 'lost' ? 'Lost' : 'Found'} Item`
              )}
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default ReportPage;
