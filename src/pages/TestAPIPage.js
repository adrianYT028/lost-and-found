import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const TestAPIPage = () => {
  const [apiTest, setApiTest] = useState({
    loading: true,
    error: null,
    data: null,
    url: '',
    platform: ''
  });

  useEffect(() => {
    testAPI();
  }, []);

  const testAPI = async () => {
    setApiTest({ loading: true, error: null, data: null, url: '', platform: '' });
    
    try {
      console.log('🔍 Testing API connection...');
      
      // Get the current platform and URL
      const hostname = window.location.hostname;
      const platform = hostname.includes('herokuapp.com') ? 'heroku' : 
                      hostname.includes('vercel.app') ? 'vercel' :
                      hostname.includes('localhost') || hostname.includes('127.0.0.1') ? 'local' :
                      'unknown';
      
      const apiUrl = platform === 'heroku' ? `${window.location.origin}/api` :
                     platform === 'vercel' ? `${window.location.origin}/api` :
                     'http://localhost:3001/api';
      
      console.log('Platform:', platform);
      console.log('API URL:', apiUrl);
      
      // Test the items endpoint directly
      const response = await fetch(`${apiUrl}/items`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      setApiTest({
        loading: false,
        error: null,
        data: data,
        url: `${apiUrl}/items`,
        platform: platform
      });
      
    } catch (error) {
      console.error('API Test Error:', error);
      setApiTest({
        loading: false,
        error: error.message,
        data: null,
        url: '',
        platform: ''
      });
    }
  };

  const testSupabaseConnection = async () => {
    try {
      console.log('🗄️ Testing Supabase connection...');
      
      // Check environment variables
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
      const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
      
      console.log('Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
      console.log('Supabase Key:', supabaseKey ? '✅ Set' : '❌ Missing');
      
      if (!supabaseUrl || !supabaseKey) {
        alert('❌ Supabase environment variables are missing!\n\nAdd these to your environment:\n- REACT_APP_SUPABASE_URL\n- REACT_APP_SUPABASE_ANON_KEY');
        return;
      }
      
      alert('✅ Environment variables are configured');
      
    } catch (error) {
      console.error('Supabase test error:', error);
      alert('❌ Error testing Supabase connection: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">API Connection Test</h1>
        
        {/* Environment Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Hostname:</strong> {window.location.hostname}
            </div>
            <div>
              <strong>Platform:</strong> {apiTest.platform || 'Detecting...'}
            </div>
            <div>
              <strong>Origin:</strong> {window.location.origin}
            </div>
            <div>
              <strong>API URL:</strong> {apiTest.url || 'Calculating...'}
            </div>
            <div>
              <strong>Supabase URL:</strong> {process.env.REACT_APP_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
            </div>
            <div>
              <strong>Supabase Key:</strong> {process.env.REACT_APP_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
            </div>
          </div>
        </div>

        {/* API Test Results */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">API Test Results</h2>
            <div className="space-x-2">
              <button 
                onClick={testAPI}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Retry API Test
              </button>
              <button 
                onClick={testSupabaseConnection}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                Test Supabase
              </button>
            </div>
          </div>
          
          {apiTest.loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Testing API connection...</p>
            </div>
          )}
          
          {apiTest.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-red-800 font-semibold">❌ API Error</h3>
              <p className="text-red-700 mt-1">{apiTest.error}</p>
              <div className="mt-3 text-sm text-red-600">
                <p><strong>Possible solutions:</strong></p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Check if your API server is running</li>
                  <li>Verify environment variables are set correctly</li>
                  <li>Ensure Supabase database is accessible</li>
                  <li>Check network connectivity</li>
                </ul>
              </div>
            </div>
          )}
          
          {apiTest.data && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-green-800 font-semibold">✅ API Connected Successfully</h3>
              <p className="text-green-700 mt-1">
                Found {Array.isArray(apiTest.data) ? apiTest.data.length : 'unknown number of'} items
              </p>
              
              {Array.isArray(apiTest.data) && apiTest.data.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-green-800">Sample Items:</h4>
                  <div className="mt-2 space-y-2">
                    {apiTest.data.slice(0, 3).map((item, index) => (
                      <div key={index} className="bg-white rounded p-3 border border-green-200">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-gray-600">
                          Type: {item.type} | Category: {item.category} | Location: {item.location}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {apiTest.data && Array.isArray(apiTest.data) && apiTest.data.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-yellow-800 font-semibold">⚠️ API Connected, But No Items Found</h3>
              <p className="text-yellow-700 mt-1">
                The API is working, but no items are in the database yet.
              </p>
              <div className="mt-3 text-sm text-yellow-600">
                <p><strong>To add sample data:</strong></p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Run the database-setup.sql script in your Supabase dashboard</li>
                  <li>Or create some test items through the app</li>
                  <li>Check if your user role allows viewing items (found items are admin-only)</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Raw Response Data */}
        {apiTest.data && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">Raw API Response</h3>
            <pre className="bg-gray-100 rounded p-3 text-xs overflow-auto max-h-96">
              {JSON.stringify(apiTest.data, null, 2)}
            </pre>
          </div>
        )}
        
        {/* Back to Browse */}
        <div className="mt-8 text-center">
          <a 
            href="/browse" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-block"
          >
            ← Back to Browse Page
          </a>
        </div>
      </div>
    </div>
  );
};

export default TestAPIPage;
