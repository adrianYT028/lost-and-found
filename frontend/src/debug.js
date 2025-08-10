console.log('API Configuration Debug:', { 
  API_BASE_URL: 'http://localhost:5002',
  LOGIN_ENDPOINT: '/api/auth/login',
  ITEMS_ENDPOINT: '/api/items'
});

// Backend expects location as an object: { building: "CSE", room: "101" }
// Frontend is sending location as a string: "Main Library"
// This mismatch causes "Please provide all required fields" error
