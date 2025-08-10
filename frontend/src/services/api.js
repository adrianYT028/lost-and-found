// API Configuration and Service Layer - SUPABASE + VERCEL v4.0 - 2025-08-10
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/api'
    : 'https://college-lost-and-found-niw2mbtiq-kartiks-projects-7abc1c80.vercel.app/api');

console.log('🔧 API_BASE_URL:', API_BASE_URL, 'Environment:', process.env.NODE_ENV);

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH_TOKEN: '/auth/refresh-token',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  
  // Items
  ITEMS: '/items',
  ITEM_BY_ID: (id) => `/items/${id}`,
  SEARCH_ITEMS: '/items/search',
  MY_ITEMS: '/items/my-items',
  ITEM_INQUIRIES: (id) => `/items/${id}/inquiries`,
  
  // Users
  PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
  UPLOAD_AVATAR: '/users/avatar',
  USER_STATS: '/users/stats',
  
  // Matches
  MATCHES: '/matches',
  MATCH_BY_ID: (id) => `/matches/${id}`,
  CONFIRM_MATCH: (id) => `/matches/${id}/confirm`,
  REJECT_MATCH: (id) => `/matches/${id}/reject`,
  
  // Admin
  ADMIN_DASHBOARD_STATS: '/admin/dashboard/stats',
  ADMIN_ITEMS: '/admin/items',
  ADMIN_USERS: '/admin/users',
  ADMIN_ITEM_STATUS: (id) => `/admin/items/${id}/status`,
  ADMIN_ITEM_READY_FOR_COLLECTION: (id) => `/admin/items/${id}/ready-for-collection`,
  ADMIN_USER_ROLE: (id) => `/admin/users/${id}/role`,
  ADMIN_DELETE_ITEM: (id) => `/admin/items/${id}`,
  ADMIN_EDIT_ITEM: (id) => `/admin/items/${id}/edit`,
  ADMIN_DELETE_USER: (id) => `/admin/users/${id}`,
  ADMIN_RESET_PASSWORD: (id) => `/admin/users/${id}/reset-password`,
  ADMIN_ACTIVATE_USER: (id) => `/admin/users/${id}/activate`,
  ADMIN_BULK_ACTION: '/admin/items/bulk-action',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_EXPORT: '/admin/export',
};

// HTTP Methods
const httpMethods = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE'
};

// Request helper function
const makeRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log('🔥 API REQUEST URL v3.0:', url, 'Time:', new Date().toISOString()); // Cache busting debug
  
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add authorization header if token exists
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Handle FormData (for file uploads)
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  } else if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    
    // Handle non-JSON responses (e.g., file downloads)
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // Handle different types of errors
      let errorMessage = 'An error occurred';
      
      if (typeof data === 'object' && data.message) {
        errorMessage = data.message;
      } else if (typeof data === 'string') {
        errorMessage = data;
      }

      // Handle authentication errors
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth';
        return;
      }

      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// API Service functions
export const apiService = {
  // Authentication services
  auth: {
    login: (credentials) => makeRequest(API_ENDPOINTS.LOGIN, {
      method: httpMethods.POST,
      body: credentials
    }),
    
    register: (userData) => makeRequest(API_ENDPOINTS.REGISTER, {
      method: httpMethods.POST,
      body: userData
    }),
    
    refreshToken: () => makeRequest(API_ENDPOINTS.REFRESH_TOKEN, {
      method: httpMethods.POST
    }),
    
    forgotPassword: (email) => makeRequest(API_ENDPOINTS.FORGOT_PASSWORD, {
      method: httpMethods.POST,
      body: { email }
    }),
    
    resetPassword: (token, password) => makeRequest(API_ENDPOINTS.RESET_PASSWORD, {
      method: httpMethods.POST,
      body: { token, password }
    }),
    
    verifyEmail: (token) => makeRequest(API_ENDPOINTS.VERIFY_EMAIL, {
      method: httpMethods.POST,
      body: { token }
    })
  },

  // Items services
  items: {
    getAll: (params = {}) => {
      const searchParams = new URLSearchParams(params);
      return makeRequest(`${API_ENDPOINTS.ITEMS}?${searchParams}`);
    },
    
    getById: (id) => makeRequest(API_ENDPOINTS.ITEM_BY_ID(id)),
    
    create: (itemData) => makeRequest(API_ENDPOINTS.ITEMS, {
      method: httpMethods.POST,
      body: itemData
    }),
    
    update: (id, itemData) => makeRequest(API_ENDPOINTS.ITEM_BY_ID(id), {
      method: httpMethods.PUT,
      body: itemData
    }),
    
    delete: (id) => makeRequest(API_ENDPOINTS.ITEM_BY_ID(id), {
      method: httpMethods.DELETE
    }),
    
    search: (searchParams) => makeRequest(API_ENDPOINTS.SEARCH_ITEMS, {
      method: httpMethods.POST,
      body: searchParams
    }),
    
    getMyItems: () => makeRequest(`${API_ENDPOINTS.ITEMS}/my`),
    
    getInquiries: (id) => makeRequest(API_ENDPOINTS.ITEM_INQUIRIES(id)),
    
    createInquiry: (id, inquiryData) => makeRequest(API_ENDPOINTS.ITEM_INQUIRIES(id), {
      method: httpMethods.POST,
      body: inquiryData
    })
  },

  // Users services
  users: {
    getProfile: () => makeRequest(API_ENDPOINTS.PROFILE),
    
    updateProfile: (profileData) => makeRequest(API_ENDPOINTS.UPDATE_PROFILE, {
      method: httpMethods.PUT,
      body: profileData
    }),
    
    uploadAvatar: (formData) => makeRequest(API_ENDPOINTS.UPLOAD_AVATAR, {
      method: httpMethods.POST,
      body: formData
    }),
    
    getStats: () => makeRequest(API_ENDPOINTS.USER_STATS)
  },

  // Matches services
  matches: {
    getAll: () => makeRequest(API_ENDPOINTS.MATCHES),
    
    getById: (id) => makeRequest(API_ENDPOINTS.MATCH_BY_ID(id)),
    
    confirm: (id) => makeRequest(API_ENDPOINTS.CONFIRM_MATCH(id), {
      method: httpMethods.POST
    }),
    
    reject: (id) => makeRequest(API_ENDPOINTS.REJECT_MATCH(id), {
      method: httpMethods.POST
    }),

    // AI Matching services
    getSuggestions: (itemId, threshold = 60) => makeRequest(`/ai-matches/suggestions/${itemId}?threshold=${threshold}`),
    
    autoMatch: (itemId) => makeRequest(`/ai-matches/auto-match/${itemId}`, {
      method: httpMethods.POST
    }),
    
    calculateSimilarity: (item1Id, item2Id) => makeRequest('/ai-matches/similarity', {
      method: httpMethods.POST,
      body: { item1Id, item2Id }
    }),

    getPending: () => makeRequest('/ai-matches/pending')
  },

  // Admin services
  admin: {
    getDashboardStats: () => makeRequest(API_ENDPOINTS.ADMIN_DASHBOARD_STATS),
    
    getItems: () => makeRequest(API_ENDPOINTS.ADMIN_ITEMS),
    
    getUsers: () => makeRequest(API_ENDPOINTS.ADMIN_USERS),
    
    updateItemStatus: (itemId, status, adminNote = '') => makeRequest(API_ENDPOINTS.ADMIN_ITEM_STATUS(itemId), {
      method: httpMethods.PUT,
      body: { status, adminNote }
    }),
    
    markAsClaimed: (itemId, collectionLocation, collectionInstructions = '') => makeRequest(API_ENDPOINTS.ADMIN_ITEM_READY_FOR_COLLECTION(itemId), {
      method: httpMethods.PUT,
      body: { collectionLocation, collectionInstructions }
    }),
    
    updateUserRole: (userId, role) => makeRequest(API_ENDPOINTS.ADMIN_USER_ROLE(userId), {
      method: httpMethods.PUT,
      body: { role }
    }),

    // Enhanced admin powers
    deleteItem: (itemId) => makeRequest(API_ENDPOINTS.ADMIN_DELETE_ITEM(itemId), {
      method: httpMethods.DELETE
    }),

    editItem: (itemId, itemData) => makeRequest(API_ENDPOINTS.ADMIN_EDIT_ITEM(itemId), {
      method: httpMethods.PUT,
      body: itemData
    }),

    deleteUser: (userId) => makeRequest(API_ENDPOINTS.ADMIN_DELETE_USER(userId), {
      method: httpMethods.DELETE
    }),

    resetUserPassword: (userId, newPassword) => makeRequest(API_ENDPOINTS.ADMIN_RESET_PASSWORD(userId), {
      method: httpMethods.PUT,
      body: { newPassword }
    }),

    activateUser: (userId, isActive) => makeRequest(API_ENDPOINTS.ADMIN_ACTIVATE_USER(userId), {
      method: httpMethods.PUT,
      body: { isActive }
    }),

    bulkAction: (itemIds, action, actionData = {}) => makeRequest(API_ENDPOINTS.ADMIN_BULK_ACTION, {
      method: httpMethods.POST,
      body: { itemIds, action, actionData }
    }),

    getAnalytics: (timeRange = '30') => makeRequest(`${API_ENDPOINTS.ADMIN_ANALYTICS}?timeRange=${timeRange}`),

    exportData: (type = 'items') => makeRequest(`${API_ENDPOINTS.ADMIN_EXPORT}?type=${type}`)
  }
};

// Export default API service
export default apiService;

// Utility function to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Utility function to get current user
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Utility function to logout
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/auth';
};

// Utility function to get full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath; // Already a full URL
  return `${API_BASE_URL.replace('/api', '')}/uploads/${imagePath}`;
};
