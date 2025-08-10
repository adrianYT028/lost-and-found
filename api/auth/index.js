// Auth index route - redirects to login documentation
export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'Authentication API',
      endpoints: {
        login: '/auth/login',
        register: '/auth/register'
      }
    });
  }
  
  // For POST requests to /auth, redirect to login
  if (req.method === 'POST') {
    return res.status(400).json({
      error: 'Invalid endpoint',
      message: 'Use /auth/login for authentication',
      correctEndpoint: '/auth/login'
    });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
