console.log('API Configuration Debug:', { 
  API_BASE_URL: process.env.REACT_APP_API_URL || 'https://college-lost-and-found-niw2mbtiq-kartiks-projects-7abc1c80.vercel.app/api',
  LOGIN_ENDPOINT: '/api/auth/login',
  ITEMS_ENDPOINT: '/api/items'
});

// Backend expects location as an object: { building: "CSE", room: "101" }
// Frontend is sending location as a string: "Main Library"
// This mismatch causes "Please provide all required fields" error
