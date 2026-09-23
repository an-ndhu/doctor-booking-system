import type { QueryInterface } from 'sequelize';
const { DataTypes, Sequelize } = require('sequelize');

const migration = {
  async up(queryInterface: QueryInterface, _sequelizeCtor: typeof Sequelize) {
    await queryInterface.createTable('appointments', {
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
      doctor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'doctors', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      start_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(32),
        allowNull: false,
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
      "ALTER TABLE appointments ADD CONSTRAINT appointments_status_check CHECK (status IN ('BOOKED', 'CANCELLED', 'COMPLETED'));"
    );

    await queryInterface.sequelize.query(
      'ALTER TABLE appointments ADD CONSTRAINT appointments_range_check CHECK (start_at < end_at);'
    );

    await queryInterface.addIndex('appointments', ['doctor_id', 'start_at'], {
      name: 'appointments_doctor_id_start_at_idx',
    });
    await queryInterface.addIndex('appointments', ['user_id', 'start_at'], {
      name: 'appointments_user_id_start_at_idx',
    });
    await queryInterface.addIndex('appointments', ['clinic_id', 'start_at'], {
      name: 'appointments_clinic_id_start_at_idx',
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('appointments');
  },
};

module.exports = migration;
