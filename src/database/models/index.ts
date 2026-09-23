import { Clinic } from '../../modules/clinics/clinic.model';
import { User } from '../../modules/users/user.model';
import { Doctor } from '../../modules/doctors/doctor.model';
import { WorkingSchedule } from '../../modules/scheduling/schedule.model';
import { AvailabilityException } from '../../modules/scheduling/exception.model';
import { Appointment } from '../../modules/appointments/appointment.model';

Clinic.hasMany(User, { foreignKey: 'clinicId' });
User.belongsTo(Clinic, { foreignKey: 'clinicId' });

Clinic.hasMany(Doctor, { foreignKey: 'clinicId' });
Doctor.belongsTo(Clinic, { foreignKey: 'clinicId' });

Clinic.hasMany(Appointment, { foreignKey: 'clinicId' });
Appointment.belongsTo(Clinic, { foreignKey: 'clinicId' });

Doctor.hasMany(WorkingSchedule, { foreignKey: 'doctorId', as: 'schedules' });
WorkingSchedule.belongsTo(Doctor, { foreignKey: 'doctorId' });

Doctor.hasMany(AvailabilityException, { foreignKey: 'doctorId', as: 'exceptions' });
AvailabilityException.belongsTo(Doctor, { foreignKey: 'doctorId' });

Doctor.hasMany(Appointment, { foreignKey: 'doctorId' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId' });

User.hasMany(Appointment, { foreignKey: 'userId' });
Appointment.belongsTo(User, { foreignKey: 'userId' });

export { Clinic, User, Doctor, WorkingSchedule, AvailabilityException, Appointment };
