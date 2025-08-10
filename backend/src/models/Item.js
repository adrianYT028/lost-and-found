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
        foreignKey: 'ownerId',
        as: 'owner',
      });
    }
  }
  Item.init({
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    category: DataTypes.STRING,
    location: DataTypes.STRING,
    type: DataTypes.ENUM('lost', 'found'),
    status: {
      type: DataTypes.ENUM('active', 'matched', 'closed'),
      defaultValue: 'active'
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    contactInfo: {
      type: DataTypes.JSON,
      allowNull: true
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    date: DataTypes.DATE,
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Item',
  });
  return Item;
};
