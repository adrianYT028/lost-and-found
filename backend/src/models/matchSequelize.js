const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Match = sequelize.define('Match', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    lostItemId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Items',
        key: 'id',
      },
    },
    foundItemId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Items',
        key: 'id',
      },
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
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'matches',
    timestamps: true,
    indexes: [
      {
        fields: ['lostItemId'],
      },
      {
        fields: ['foundItemId'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['similarity'],
      },
    ],
  });

  Match.associate = (models) => {
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
  };

  return Match;
};
