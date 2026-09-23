import type { QueryInterface } from 'sequelize';
const { DataTypes, Sequelize } = require('sequelize');

const migration = {
  async up(queryInterface: QueryInterface, _sequelizeCtor: typeof Sequelize) {
    await queryInterface.createTable('working_schedules', {
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
      day_of_week: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      start_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      end_time: {
        type: DataTypes.TIME,
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
      'ALTER TABLE working_schedules ADD CONSTRAINT working_schedules_day_of_week_check CHECK (day_of_week BETWEEN 0 AND 6);'
    );

    await queryInterface.sequelize.query(
      'ALTER TABLE working_schedules ADD CONSTRAINT working_schedules_time_range_check CHECK (start_time < end_time);'
    );

    await queryInterface.addIndex('working_schedules', ['doctor_id', 'day_of_week'], {
      name: 'working_schedules_doctor_id_day_of_week_idx',
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('working_schedules');
  },
};

module.exports = migration;
