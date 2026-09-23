import type { QueryInterface } from 'sequelize';

const migration = {
  async up(queryInterface: QueryInterface) {
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS btree_gist;');
    await queryInterface.sequelize.query(`
      ALTER TABLE appointments
      ADD CONSTRAINT appointments_no_overlap
      EXCLUDE USING gist (
        doctor_id WITH =,
        tstzrange(start_at, end_at, '[)') WITH &&
      )
      WHERE (status = 'BOOKED');
    `);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.sequelize.query(
      'ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_no_overlap;'
    );
  },
};

module.exports = migration;
