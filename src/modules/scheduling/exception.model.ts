import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import { sequelize } from '../../config/database';
import { EXCEPTION_TYPES, type ExceptionType } from '../../shared/constants';

export class AvailabilityException extends Model<
  InferAttributes<AvailabilityException>,
  InferCreationAttributes<AvailabilityException>
> {
  declare id: CreationOptional<number>;
  declare doctorId: number;
  declare type: ExceptionType;
  declare startAt: Date;
  declare endAt: Date;
  declare reason: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

AvailabilityException.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'doctor_id',
    },
    type: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: EXCEPTION_TYPES.UNAVAILABLE,
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
    reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'availability_exceptions',
  }
);
