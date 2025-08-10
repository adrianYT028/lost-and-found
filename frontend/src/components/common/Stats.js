import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Users, Clock, Award } from 'lucide-react';

const Stats = () => {
  const stats = [
    {
      icon: Users,
      number: '1+',
      label: 'Active Users',
      description: 'People helping each other find lost items',
      colorFrom: 'blue-500',
      colorTo: 'blue-600'
    },
    {
      icon: TrendingUp,
      number: '1',
      label: 'Items Reunited',
      description: 'Successfully returned to their owners',
      colorFrom: 'green-500',
      colorTo: 'green-600'
    },
    {
      icon: Clock,
      number: '2.3 hrs',
      label: 'Average Recovery Time',
      description: 'How quickly items find their way home',
      colorFrom: 'purple-500',
      colorTo: 'purple-600'
    },
    {
      icon: Award,
      number: '94%',
      label: 'Success Rate',
      description: 'Of reported items successfully matched',
      colorFrom: 'orange-500',
      colorTo: 'orange-600'
    }
  ];

  // Reusable StatCard component
  const StatCard = ({ stat, index }) => (
    <div key={index} className="text-center group">
      {/* Icon */}
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r from-${stat.colorFrom} to-${stat.colorTo} p-4 mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
        <stat.icon className="w-8 h-8 text-white" />
      </div>

      {/* Number */}
      <div className="mb-2">
        <span className="text-4xl md:text-5xl font-bold text-gray-900 block">
          {stat.number}
        </span>
      </div>

      {/* Label */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {stat.label}
      </h3>

      {/* Description */}
      <p className="text-gray-600">
        {stat.description}
      </p>
    </div>
  );

  // Reusable Section Header component
  const SectionHeader = ({ title, description }) => (
    <div className="text-center mb-16">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        {title}
      </h2>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        {description}
      </p>
    </div>
  );

  // Reusable CTA Button component
  const CTAButton = ({ variant = 'primary', children, className = '', href, external = false }) => {
    const baseClasses = "px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-block text-center";
    const variants = {
      primary: "bg-white hover:bg-gray-100 text-blue-600",
      secondary: "bg-transparent hover:bg-white/10 text-white border-2 border-white/30 hover:border-white/50"
    };
    
    if (external && href) {
      return (
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer"
          className={`${baseClasses} ${variants[variant]} ${className}`}
        >
          {children}
        </a>
      );
    }
    
    if (href) {
      return (
        <Link to={href} className={`${baseClasses} ${variants[variant]} ${className}`}>
          {children}
        </Link>
      );
    }
    
    return (
      <button className={`${baseClasses} ${variants[variant]} ${className}`}>
        {children}
      </button>
    );
  };

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeader 
          title="Making a Real Impact"
          description="Join thousands of users who are already part of our growing community. See the difference we're making together."
        />

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Be Part of Something Bigger
            </h3>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Every item reported and every match made helps strengthen our community. 
              Together, we can ensure nothing stays lost for long.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <CTAButton variant="primary" href="https://github.com/adrianYT028" external={true}>
                Join Our Community
              </CTAButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
