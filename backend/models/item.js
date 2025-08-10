'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Item.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'owner',
      });
    }
  }
  Item.init({
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    category: DataTypes.STRING,
    location: DataTypes.STRING,
    type: DataTypes.STRING,
    status: DataTypes.STRING,
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    // Admin-related fields
    adminNote: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    lastUpdatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    collectionLocation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    collectionInstructions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    readyForCollectionAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    adminInCharge: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    collectedBy: {
      type: DataTypes.STRING,
      allowNull: true
    },
    collectedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    verificationMethod: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'student_id'
    },
    collectionNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    collectedByAdmin: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Item',
  });
  return Item;
};
