'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Match extends Model {
    static associate(models) {
      Match.belongsTo(models.Item, {
        as: 'lostItem',
        foreignKey: 'lostItemId',
      });
      Match.belongsTo(models.Item, {
        as: 'foundItem',
        foreignKey: 'foundItemId',
      });
      Match.belongsTo(models.User, {
        as: 'confirmer',
        foreignKey: 'confirmedBy',
      });
    }
  }
  Match.init({
    lostItemId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    foundItemId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    similarity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
    confidence: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'rejected', 'expired'),
      defaultValue: 'pending',
    },
    matchType: {
      type: DataTypes.ENUM('ai_generated', 'user_suggested', 'manual'),
      defaultValue: 'ai_generated',
    },
    confirmedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    confirmedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Match',
  });
  return Match;
};
