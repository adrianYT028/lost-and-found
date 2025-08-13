import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ScrollToTop from './components/common/ScrollToTop';
import { CACHE_BUSTER } from './cache-buster'; // Force rebuild
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import ReportPage from './pages/ReportPage';
import AuthPage from './pages/AuthPage';
import ItemDetailPage from './pages/ItemDetailPage';
import ProfilePage from './pages/ProfilePage';
import MyItemsPage from './pages/MyItemsPage';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminFoundItemsPage from './pages/AdminFoundItemsPage';
import TestAPIPage from './pages/TestAPIPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/globals.css';

function App() {
  console.log('� FRESH DEPLOYMENT ACTIVE:', CACHE_BUSTER);
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="App">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/item/:id" element={<ItemDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/my-items" element={<MyItemsPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/found-items" element={<AdminFoundItemsPage />} />
            <Route path="/test-api" element={<TestAPIPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
