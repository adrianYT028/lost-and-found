const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const aiMatchingService = require('../services/aiMatchingService');
const { Item, User } = require('../models');
const { Op } = require('sequelize');

// Note: You'll need to import the Match model once it's properly set up

// @route   GET /api/ai-matches/openai-test
// @desc    Test if OpenAI API is working
// @access  Public
router.get('/openai-test', async (req, res) => {
  try {
    const OpenAI = require('openai');
    
    if (!process.env.OPENAI_API_KEY) {
      return res.json({
        success: false,
        message: 'OpenAI API key not configured',
        fallback: 'Will use basic string matching instead'
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Simple test call
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Respond with just the number 42" }],
      max_tokens: 5,
      temperature: 0.1,
    });

    res.json({
      success: true,
      message: 'OpenAI API is working',
      testResponse: response.choices[0].message.content.trim(),
      apiKeyConfigured: true
    });

  } catch (error) {
    console.error('OpenAI test error:', error);
    
    let errorType = 'unknown';
    let userMessage = 'OpenAI API error';
    
    if (error.code === 'insufficient_quota') {
      errorType = 'no_credits';
      userMessage = 'OpenAI account has no credits - please add payment method';
    } else if (error.code === 'invalid_api_key') {
      errorType = 'invalid_key';
      userMessage = 'Invalid OpenAI API key';
    } else if (error.status === 401) {
      errorType = 'auth_failed';
      userMessage = 'OpenAI authentication failed - check API key and billing';
    }

    res.json({
      success: false,
      message: userMessage,
      errorType: errorType,
      fallback: 'AI matching will use basic string matching instead',
      error: error.message
    });
  }
});

// @route   GET /api/ai-matches/ids
// @desc    Get just the item IDs for testing
// @access  Public
router.get('/ids', async (req, res) => {
  try {
    const items = await Item.findAll({
      attributes: ['id'],
      limit: 20
    });
    
    const ids = items.map(item => item.id);
    
    res.json({
      success: true,
      data: {
        ids: ids,
        count: ids.length,
        first_few: ids.slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Error getting IDs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/ai-matches/items
// @desc    List all items for testing purposes
// @access  Public
router.get('/items', async (req, res) => {
  try {
    const items = await Item.findAll({
      attributes: ['id', 'title', 'description', 'type', 'status'],
      limit: 10
    });
    
    res.json({
      success: true,
      data: {
        items: items.map(item => ({
          id: item.id,
          title: item.title,
          type: item.type,
          status: item.status
        })),
        count: items.length
      }
    });
  } catch (error) {
    console.error('Error listing items:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/ai-matches/debug
// @desc    Debug database schema for Items table
// @access  Public
router.get('/debug', async (req, res) => {
  try {
    const { sequelize } = require('../../models');
    
    // Get table schema
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'Items' 
      ORDER BY ordinal_position;
    `);
    
    // Also try to get one item to see what data is available
    let sampleItem = null;
    try {
      const items = await Item.findAll({ limit: 1 });
      sampleItem = items[0] ? items[0].dataValues : null;
    } catch (itemError) {
      sampleItem = { error: itemError.message };
    }
    
    res.json({
      success: true,
      data: {
        tableColumns: results,
        sampleItem: sampleItem,
        totalItems: await Item.count().catch(() => 'Error counting items')
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/ai-matches/health
// @desc    Health check for AI matching service
// @access  Public
router.get('/health', async (req, res) => {
  try {
    // Test database connection
    const itemCount = await Item.count();
    
    res.json({
      success: true,
      message: 'AI Matching service is healthy',
      data: {
        itemsInDatabase: itemCount,
        openaiConfigured: !!process.env.OPENAI_API_KEY,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
});

// @route   GET /api/ai-matches/test/:itemId
// @desc    Test AI-generated match suggestions without auth (for testing only)
// @access  Public
router.get('/test/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { threshold = 60 } = req.query;

    // Check if item exists
    const item = await Item.findByPk(itemId, {
      attributes: ['id', 'title', 'description', 'category', 'location', 'type', 'status', 'images', 'userId', 'createdAt', 'updatedAt']
    });
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Get AI suggestions
    const suggestions = await aiMatchingService.findMatches(item, threshold);

    res.json({
      success: true,
      data: {
        item: {
          id: item.id,
          title: item.title,
          description: item.description,
          type: item.type
        },
        suggestions,
        threshold
      }
    });

  } catch (error) {
    console.error('Error fetching AI test suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch match suggestions',
      error: error.message
    });
  }
});

// @route   GET /api/ai-matches/suggestions/:itemId
// @desc    Get AI-generated match suggestions for an item
// @access  Private
router.get('/suggestions/:itemId', auth, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { threshold = 60 } = req.query;

    // Check if item exists
    const item = await Item.findByPk(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    const matches = await aiMatchingService.findMatches(itemId, parseInt(threshold));

    res.json({
      success: true,
      data: {
        matches,
        totalMatches: matches.length
      }
    });
  } catch (error) {
    console.error('Error getting AI match suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting match suggestions'
    });
  }
});

// @route   POST /api/ai-matches/auto-match/:itemId
// @desc    Trigger automatic matching for an item
// @access  Private
router.post('/auto-match/:itemId', auth, async (req, res) => {
  try {
    const { itemId } = req.params;

    // Check if item exists
    const item = await Item.findByPk(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    const matches = await aiMatchingService.createAutoMatches(itemId);

    res.json({
      success: true,
      message: 'Auto-matching completed',
      data: {
        matches,
        matchesCreated: matches.length
      }
    });
  } catch (error) {
    console.error('Error in auto-matching:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while auto-matching'
    });
  }
});

// @route   POST /api/ai-matches/similarity
// @desc    Calculate similarity between two items
// @access  Private
router.post('/similarity', auth, async (req, res) => {
  try {
    const { item1Id, item2Id } = req.body;

    const item1 = await Item.findByPk(item1Id);
    const item2 = await Item.findByPk(item2Id);

    if (!item1 || !item2) {
      return res.status(404).json({
        success: false,
        message: 'One or both items not found'
      });
    }

    const similarity = await aiMatchingService.calculateSimilarity(item1, item2);

    res.json({
      success: true,
      data: {
        similarity,
        confidence: aiMatchingService.getConfidenceLevel(similarity),
        items: {
          item1: { id: item1.id, title: item1.title },
          item2: { id: item2.id, title: item2.title }
        }
      }
    });
  } catch (error) {
    console.error('Error calculating similarity:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while calculating similarity'
    });
  }
});

module.exports = router;
