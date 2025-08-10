import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, MapPin, Clock } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full -translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/10 rounded-full translate-x-48 translate-y-48"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            <div className="mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
                ✨ Powered by AI Technology
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Find What You've
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Lost</span>
              <br />
              Help Others
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600"> Find</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl">
              Connect lost items with their owners using our intelligent matching system. 
              Report, search, and recover belongings with the power of AI-driven recognition.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link 
                to="/report"
                className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center"
              >
                Report Lost Item
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/browse"
                className="bg-white hover:bg-gray-50 text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-blue-200 hover:border-blue-300 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1"
              >
                Browse Found Items
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 text-blue-500 mr-2" />
                <span>Campus-wide coverage</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-green-500 mr-2" />
                <span>24/7 matching system</span>
              </div>
              <div className="flex items-center">
                <Search className="w-4 h-4 text-purple-500 mr-2" />
                <span>AI-powered search</span>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            <div className="relative z-10">
              {/* Main illustration placeholder */}
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="space-y-6">
                  {/* Mock search interface */}
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                    <Search className="w-5 h-5 text-gray-400" />
                    <div className="flex-1 h-2 bg-gray-200 rounded"></div>
                  </div>
                  
                  {/* Mock item cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                      <div className="w-8 h-8 bg-white/20 rounded-lg mb-3"></div>
                      <div className="space-y-2">
                        <div className="h-2 bg-white/40 rounded w-3/4"></div>
                        <div className="h-2 bg-white/30 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                      <div className="w-8 h-8 bg-white/20 rounded-lg mb-3"></div>
                      <div className="space-y-2">
                        <div className="h-2 bg-white/40 rounded w-2/3"></div>
                        <div className="h-2 bg-white/30 rounded w-3/4"></div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
                      <div className="w-8 h-8 bg-white/20 rounded-lg mb-3"></div>
                      <div className="space-y-2">
                        <div className="h-2 bg-white/40 rounded w-1/2"></div>
                        <div className="h-2 bg-white/30 rounded w-2/3"></div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white">
                      <div className="w-8 h-8 bg-white/20 rounded-lg mb-3"></div>
                      <div className="space-y-2">
                        <div className="h-2 bg-white/40 rounded w-3/4"></div>
                        <div className="h-2 bg-white/30 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute top-4 -right-4 w-12 h-12 bg-blue-500 rounded-full animate-bounce opacity-20"></div>
            <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-purple-500 rounded-full animate-pulse opacity-30"></div>
            <div className="absolute top-1/2 -left-8 w-6 h-6 bg-green-500 rounded-full animate-ping opacity-25"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
