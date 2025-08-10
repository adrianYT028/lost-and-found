const OpenAI = require('openai');
const { Item } = require('../models');
const { Op } = require('sequelize');

class AIMatchingService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // Get Match model dynamically to avoid circular dependency issues
  getMatchModel() {
    try {
      const { Match } = require('../models');
      return Match;
    } catch (error) {
      console.warn('Match model not available yet, skipping match creation');
      return null;
    }
  }

  /**
   * Calculate similarity score between two items using AI
   */
  async calculateSimilarity(item1, item2) {
    try {
      const prompt = `
        Compare these two items and determine if they could be the same object. 
        Rate the similarity from 0-100 where 100 means they are definitely the same item.

        Item 1 (${item1.type}):
        - Title: ${item1.title}
        - Description: ${item1.description}
        - Category: ${item1.category}
        - Location: ${item1.location}
        - Date: ${item1.createdAt}

        Item 2 (${item2.type}):
        - Title: ${item2.title}
        - Description: ${item2.description}
        - Category: ${item2.category}
        - Location: ${item2.location}
        - Date: ${item2.createdAt}

        Consider:
        - Description similarity (color, size, brand, unique features)
        - Location proximity
        - Time proximity
        - Category match

        Respond with only a number from 0-100.
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 10,
        temperature: 0.1,
      });

      const score = parseInt(response.choices[0].message.content.trim());
      return isNaN(score) ? 0 : Math.min(100, Math.max(0, score));
    } catch (error) {
      console.error('Error calculating AI similarity:', error);
      return this.calculateBasicSimilarity(item1, item2);
    }
  }

  /**
   * Fallback similarity calculation without AI
   */
  calculateBasicSimilarity(item1, item2) {
    let score = 0;

    // Category match (40 points)
    if (item1.category?.toLowerCase() === item2.category?.toLowerCase()) {
      score += 40;
    }

    // Title similarity (30 points)
    const titleSimilarity = this.calculateStringSimilarity(
      item1.title?.toLowerCase() || '',
      item2.title?.toLowerCase() || ''
    );
    score += titleSimilarity * 30;

    // Description similarity (20 points)
    const descSimilarity = this.calculateStringSimilarity(
      item1.description?.toLowerCase() || '',
      item2.description?.toLowerCase() || ''
    );
    score += descSimilarity * 20;

    // Location proximity (10 points)
    if (item1.location && item2.location) {
      const locationSimilarity = this.calculateStringSimilarity(
        item1.location.toLowerCase(),
        item2.location.toLowerCase()
      );
      score += locationSimilarity * 10;
    }

    return Math.round(score);
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  calculateStringSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  }

  /**
   * Find potential matches for a given item
   */
  async findMatches(itemId, threshold = 60) {
    try {
      const item = await Item.findByPk(itemId, {
        attributes: ['id', 'title', 'description', 'category', 'location', 'type', 'status', 'images', 'userId', 'createdAt', 'updatedAt']
      });
      if (!item) return [];

      // Find items of opposite type (lost vs found)
      const oppositeType = item.type === 'lost' ? 'found' : 'lost';
      
      const candidates = await Item.findAll({
        attributes: ['id', 'title', 'description', 'category', 'location', 'type', 'status', 'images', 'userId', 'createdAt', 'updatedAt'],
        where: {
          type: oppositeType,
          id: { [Op.ne]: itemId },
          status: 'active'
        }
        // Temporarily removed include to debug: include: ['owner']
      });

      const matches = [];

      for (const candidate of candidates) {
        const similarity = await this.calculateSimilarity(item, candidate);
        
        if (similarity >= threshold) {
          matches.push({
            item: candidate,
            similarity,
            confidence: this.getConfidenceLevel(similarity)
          });
        }
      }

      // Sort by similarity score
      return matches.sort((a, b) => b.similarity - a.similarity);
    } catch (error) {
      console.error('Error finding matches:', error);
      return [];
    }
  }

  getConfidenceLevel(similarity) {
    if (similarity >= 85) return 'high';
    if (similarity >= 70) return 'medium';
    return 'low';
  }

  /**
   * Auto-match items and create match records
   */
  async createAutoMatches(itemId) {
    try {
      const Match = this.getMatchModel();
      if (!Match) {
        console.log('Match model not available, skipping auto-match creation');
        return [];
      }

      const matches = await this.findMatches(itemId, 80); // High threshold for auto-matches

      for (const match of matches.slice(0, 5)) { // Limit to top 5 matches
        await Match.create({
          lostItemId: match.item.type === 'lost' ? match.item.id : itemId,
          foundItemId: match.item.type === 'found' ? match.item.id : itemId,
          similarity: match.similarity,
          confidence: match.confidence,
          status: 'pending',
          matchType: 'ai_generated'
        });
      }

      return matches;
    } catch (error) {
      console.error('Error creating auto matches:', error);
      return [];
    }
  }
}

module.exports = new AIMatchingService();
