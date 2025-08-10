import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Zap, Shield, Users, Search, Bell } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Matching',
      description: 'Advanced computer vision technology automatically matches lost and found items using image recognition and smart tagging.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Zap,
      title: 'Instant Notifications',
      description: 'Get real-time alerts when potential matches are found. Never miss a chance to recover your belongings.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your personal information is protected with enterprise-grade security. Contact details are only shared when you choose.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Join a caring community of people helping each other reunite with their lost belongings.',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: Search,
      title: 'Smart Search',
      description: 'Powerful search filters by category, location, date, and description help you find exactly what you\'re looking for.',
      color: 'from-pink-500 to-pink-600'
    },
    {
      icon: Bell,
      title: 'Admin Moderation',
      description: 'Trusted moderators verify posts and maintain platform quality, ensuring a safe experience for everyone.',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Our Platform?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We've built the most advanced lost and found system using cutting-edge technology 
            to help you recover your belongings faster than ever before.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-xl border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} p-3 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover effect background */}
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300`}></div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of users who have successfully recovered their lost items. 
              It takes less than 2 minutes to report a lost or found item.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/report"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center"
              >
                Report Lost Item
              </Link>
              <Link 
                to="/browse"
                className="bg-white hover:bg-gray-50 text-blue-600 px-8 py-3 rounded-lg font-semibold border-2 border-blue-200 hover:border-blue-300 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 text-center"
              >
                Browse Found Items
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
