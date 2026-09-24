import type { QueryInterface } from 'sequelize';

const migration = {
  async up(queryInterface: QueryInterface) {
    await queryInterface.addConstraint('doctors', {
      fields: ['id', 'clinic_id'],
      type: 'unique',
      name: 'doctors_id_clinic_id_unique',
    });
    await queryInterface.addConstraint('users', {
      fields: ['id', 'clinic_id'],
      type: 'unique',
      name: 'users_id_clinic_id_unique',
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE appointments
      ADD CONSTRAINT appointments_doctor_clinic_fk
      FOREIGN KEY (doctor_id, clinic_id)
      REFERENCES doctors (id, clinic_id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE appointments
      ADD CONSTRAINT appointments_user_clinic_fk
      FOREIGN KEY (user_id, clinic_id)
      REFERENCES users (id, clinic_id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT;
    `);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.sequelize.query(
      'ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_user_clinic_fk;'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_doctor_clinic_fk;'
    );
    await queryInterface.removeConstraint('users', 'users_id_clinic_id_unique');
    await queryInterface.removeConstraint('doctors', 'doctors_id_clinic_id_unique');
  },
};

module.exports = migration;
