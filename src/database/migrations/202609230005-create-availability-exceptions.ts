import type { QueryInterface } from 'sequelize';
const { DataTypes, Sequelize } = require('sequelize');

const migration = {
  async up(queryInterface: QueryInterface, _sequelizeCtor: typeof Sequelize) {
    await queryInterface.createTable('availability_exceptions', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      doctor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'doctors', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      type: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
      start_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      reason: {
        type: DataTypes.STRING(255),
        allowNull: true,
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

    await queryInterface.sequelize.query(
      "ALTER TABLE availability_exceptions ADD CONSTRAINT availability_exceptions_type_check CHECK (type IN ('BREAK', 'LEAVE', 'UNAVAILABLE'));"
    );

    await queryInterface.sequelize.query(
      'ALTER TABLE availability_exceptions ADD CONSTRAINT availability_exceptions_range_check CHECK (start_at < end_at);'
    );

    await queryInterface.addIndex(
      'availability_exceptions',
      ['doctor_id', 'start_at', 'end_at'],
      { name: 'availability_exceptions_doctor_id_range_idx' }
    );
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('availability_exceptions');
  },
};

module.exports = migration;
