import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import { sequelize } from '../../config/database';
import { APPOINTMENT_STATUSES, type AppointmentStatus } from '../../shared/constants';

export class Appointment extends Model<
  InferAttributes<Appointment>,
  InferCreationAttributes<Appointment>
> {
  declare id: CreationOptional<number>;
  declare clinicId: number;
  declare doctorId: number;
  declare userId: number;
  declare startAt: Date;
  declare endAt: Date;
  declare status: AppointmentStatus;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Appointment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    clinicId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'clinic_id',
    },
    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'doctor_id',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
    },
    startAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_at',
    },
    endAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'end_at',
    },
    status: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: APPOINTMENT_STATUSES.BOOKED,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'appointments',
  }
);
