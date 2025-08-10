// Direct API test to verify configuration
import { apiService } from './services/api';

console.log('Testing API configuration...');

// Test API endpoints
console.log('API_ENDPOINTS.ITEMS:', '/api/items');
console.log('API_BASE_URL + endpoint should give:', 'http://localhost:5002/api/items');

// Test the makeRequest function
(async () => {
  try {
    console.log('Making test API call...');
    const result = await apiService.items.getAll();
    console.log('API call successful:', result);
  } catch (error) {
    console.error('API call failed:', error);
  }
})();
