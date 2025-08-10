import React, { useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Hero from '../components/common/Hero';
import Features from '../components/common/Features';
import HowItWorks from '../components/common/HowItWorks';
import Stats from '../components/common/Stats';
import Footer from '../components/common/Footer';

const HomePage = () => {
  useEffect(() => {
    // Handle hash-based navigation (e.g., /#how-it-works)
    const hash = window.location.hash;
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100); // Small delay to ensure the page has loaded
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Stats />
      <Footer />
    </div>
  );
};

export default HomePage;
