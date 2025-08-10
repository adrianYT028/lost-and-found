'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Items', 'adminNote', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    await queryInterface.addColumn('Items', 'lastUpdatedBy', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    });
    
    await queryInterface.addColumn('Items', 'collectionLocation', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('Items', 'collectionInstructions', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    await queryInterface.addColumn('Items', 'readyForCollectionAt', {
      type: Sequelize.DATE,
      allowNull: true
    });
    
    await queryInterface.addColumn('Items', 'adminInCharge', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    });
    
    await queryInterface.addColumn('Items', 'collectedBy', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('Items', 'collectedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });
    
    await queryInterface.addColumn('Items', 'verificationMethod', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'student_id'
    });
    
    await queryInterface.addColumn('Items', 'collectionNotes', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    await queryInterface.addColumn('Items', 'collectedByAdmin', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Items', 'adminNote');
    await queryInterface.removeColumn('Items', 'lastUpdatedBy');
    await queryInterface.removeColumn('Items', 'collectionLocation');
    await queryInterface.removeColumn('Items', 'collectionInstructions');
    await queryInterface.removeColumn('Items', 'readyForCollectionAt');
    await queryInterface.removeColumn('Items', 'adminInCharge');
    await queryInterface.removeColumn('Items', 'collectedBy');
    await queryInterface.removeColumn('Items', 'collectedAt');
    await queryInterface.removeColumn('Items', 'verificationMethod');
    await queryInterface.removeColumn('Items', 'collectionNotes');
    await queryInterface.removeColumn('Items', 'collectedByAdmin');
  }
};
