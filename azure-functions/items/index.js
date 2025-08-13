const { app } = require('@azure/functions');

// Import the existing Vercel function logic
const vercelItemsHandler = require('../../api/items');

app.http('items', {
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    authLevel: 'anonymous',
    route: 'items',
    handler: async (request, context) => {
        // Set up CORS headers
        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Content-Type': 'application/json'
        };

        // Handle preflight requests
        if (request.method === 'OPTIONS') {
            return {
                status: 200,
                headers
            };
        }

        try {
            // Create a mock Express-like request/response for Vercel function
            const mockReq = {
                method: request.method,
                headers: request.headers,
                query: request.query,
                body: request.body || {}
            };

            const mockRes = {
                headers: {},
                statusCode: 200,
                body: null,
                setHeader: function(key, value) {
                    this.headers[key] = value;
                },
                status: function(code) {
                    this.statusCode = code;
                    return this;
                },
                json: function(data) {
                    this.body = JSON.stringify(data);
                    return this;
                },
                end: function() {
                    // No-op for Azure Functions
                }
            };

            // Call the Vercel function
            await vercelItemsHandler(mockReq, mockRes);

            return {
                status: mockRes.statusCode,
                headers: {
                    ...headers,
                    ...mockRes.headers
                },
                body: mockRes.body || JSON.stringify({ message: 'Success' })
            };

        } catch (error) {
            context.log('Error in items function:', error);
            return {
                status: 500,
                headers,
                body: JSON.stringify({ 
                    message: 'Internal server error',
                    error: error.message 
                })
            };
        }
    }
});
