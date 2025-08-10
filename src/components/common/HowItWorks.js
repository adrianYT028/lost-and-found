import React from 'react';
import { Upload, Search, MessageCircle, CheckCircle } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: Upload,
      title: 'Report Your Item',
      description: 'Upload a photo and description of your lost or found item. Our AI extracts relevant tags automatically.',
      color: 'from-blue-500 to-blue-600',
      step: '01'
    },
    {
      icon: Search,
      title: 'AI Matching',
      description: 'Our intelligent system searches for potential matches using image recognition and smart algorithms.',
      color: 'from-purple-500 to-purple-600',
      step: '02'
    },
    {
      icon: MessageCircle,
      title: 'Get Connected',
      description: 'When a match is found, both parties are notified and can communicate securely through our platform.',
      color: 'from-green-500 to-green-600',
      step: '03'
    },
    {
      icon: CheckCircle,
      title: 'Reunion Complete',
      description: 'Meet safely and confirm the return. Help build a community where nothing stays lost for long.',
      color: 'from-orange-500 to-orange-600',
      step: '04'
    }
  ];

  return (
    <div id="how-it-works" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our simple 4-step process makes it easy to report lost items, 
            find what you've lost, or help others recover their belongings.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line for desktop */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 via-green-200 to-orange-200"></div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Step Card */}
                <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 relative z-10">
                  {/* Step Number */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-lg bg-gradient-to-r ${step.color} p-4 mb-6 mx-auto`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Connection arrow for mobile */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center mt-6 mb-2">
                    <div className="w-0.5 h-8 bg-gray-300"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">For Lost Items</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Take clear photos from multiple angles</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Include detailed description and last known location</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Set up notifications for potential matches</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Browse found items regularly</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">For Found Items</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Upload photos of the found item immediately</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Note where and when you found it</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Let our AI suggest potential owners</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Coordinate safe handover when matched</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
