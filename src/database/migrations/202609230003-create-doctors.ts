import type { QueryInterface } from 'sequelize';
const { DataTypes, Sequelize } = require('sequelize');

const migration = {
  async up(queryInterface: QueryInterface, _sequelizeCtor: typeof Sequelize) {
    await queryInterface.createTable('doctors', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      clinic_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'clinics', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      specialization: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addIndex('doctors', ['clinic_id'], {
      name: 'doctors_clinic_id_idx',
    });
    await queryInterface.addIndex('doctors', ['clinic_id', 'is_active'], {
      name: 'doctors_clinic_id_is_active_idx',
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('doctors');
  },
};

module.exports = migration;
