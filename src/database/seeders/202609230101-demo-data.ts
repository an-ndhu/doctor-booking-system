import type { QueryInterface } from 'sequelize';
const bcrypt = require('bcrypt');
const { DateTime } = require('luxon');
const { QueryTypes } = require('sequelize');

const seeder = {
  async up(queryInterface: QueryInterface) {
    const now = new Date();
    const timezone = 'Asia/Kolkata';

    await queryInterface.bulkInsert('clinics', [
      {
        name: 'Kochi Medical Centre',
        timezone,
        created_at: now,
        updated_at: now,
      },
    ]);

    const [clinic] = (await queryInterface.sequelize.query(
      'SELECT id FROM clinics ORDER BY id ASC LIMIT 1;',
      { type: QueryTypes.SELECT }
    )) as unknown as Array<{ id: number }>;

    const passwordHash = await bcrypt.hash('Password123', 12);

    await queryInterface.bulkInsert('users', [
      {
        clinic_id: clinic.id,
        name: 'Clinic Admin',
        email: 'admin@example.com',
        password_hash: passwordHash,
        role: 'ADMIN',
        created_at: now,
        updated_at: now,
      },
      {
        clinic_id: clinic.id,
        name: 'Jane Patient',
        email: 'user@example.com',
        password_hash: passwordHash,
        role: 'USER',
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert('doctors', [
      {
        clinic_id: clinic.id,
        name: 'Dr. John',
        specialization: 'Cardiology',
        email: 'john.cardio@example.com',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        clinic_id: clinic.id,
        name: 'Dr. Sarah',
        specialization: 'Dermatology',
        email: 'sarah.derm@example.com',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ]);

    const doctors = (await queryInterface.sequelize.query('SELECT id FROM doctors ORDER BY id ASC;', {
      type: QueryTypes.SELECT,
    })) as unknown as Array<{ id: number }>;

    const scheduleRows: Array<Record<string, unknown>> = [];
    doctors.forEach((doctor) => {
      for (let day = 1; day <= 5; day += 1) {
        scheduleRows.push(
          {
            doctor_id: doctor.id,
            day_of_week: day,
            start_time: '09:00:00',
            end_time: '13:00:00',
            created_at: now,
            updated_at: now,
          },
          {
            doctor_id: doctor.id,
            day_of_week: day,
            start_time: '14:00:00',
            end_time: '17:00:00',
            created_at: now,
            updated_at: now,
          }
        );
      }
    });
    await queryInterface.bulkInsert('working_schedules', scheduleRows);

    const breakStart = DateTime.fromISO('2026-09-25T10:00:00', { zone: timezone });
    const leaveStart = DateTime.fromISO('2026-09-28T00:00:00', { zone: timezone });

    const firstDoctor = doctors[0];
    if (!firstDoctor) {
      throw new Error('Failed to seed doctors');
    }

    await queryInterface.bulkInsert('availability_exceptions', [
      {
        doctor_id: firstDoctor.id,
        type: 'BREAK',
        start_at: breakStart.toUTC().toJSDate(),
        end_at: breakStart.plus({ minutes: 30 }).toUTC().toJSDate(),
        reason: 'Morning break',
        created_at: now,
        updated_at: now,
      },
      {
        doctor_id: firstDoctor.id,
        type: 'LEAVE',
        start_at: leaveStart.toUTC().toJSDate(),
        end_at: leaveStart.plus({ days: 1 }).toUTC().toJSDate(),
        reason: 'Personal leave',
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.bulkDelete('availability_exceptions', {}, {});
    await queryInterface.bulkDelete('working_schedules', {}, {});
    await queryInterface.bulkDelete('appointments', {}, {});
    await queryInterface.bulkDelete('doctors', {}, {});
    await queryInterface.bulkDelete('users', {}, {});
    await queryInterface.bulkDelete('clinics', {}, {});
  },
};

module.exports = seeder;
