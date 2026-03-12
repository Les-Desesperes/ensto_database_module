import { DataTypes, Model, ModelStatic, Optional, Sequelize } from 'sequelize';
import defaultSequelize from '../config/db';

interface HistoryLogAttributes {
    logId: number;
    dateTime: Date;
    actionType: 'Entry' | 'Exit' | 'Refusal';
    details: string;

    // Foreign Keys (Nullable since a log might pertain to only one of these at a time)
    employeeId?: number;
    vehicleId?: number;
    driverId?: number;
    visitorId?: number;
}

interface HistoryLogCreationAttributes extends Optional<HistoryLogAttributes, 'logId'> {}

export type HistoryLogInstance = Model<HistoryLogAttributes, HistoryLogCreationAttributes> & HistoryLogAttributes;
export type HistoryLogModel = ModelStatic<HistoryLogInstance>;

export const defineHistoryLogModel = (sequelize: Sequelize): HistoryLogModel => {
    const existingModel = sequelize.models.HistoryLog as HistoryLogModel | undefined;
    if (existingModel) {
        return existingModel;
    }

    class HistoryLog extends Model<HistoryLogAttributes, HistoryLogCreationAttributes> implements HistoryLogAttributes {
        declare logId: number;
        declare dateTime: Date;
        declare actionType: 'Entry' | 'Exit' | 'Refusal';
        declare details: string;
    }

    HistoryLog.init(
        {
            logId: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
                field: 'log_id',
            },
            dateTime: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
                field: 'date_time',
            },
            actionType: {
                type: DataTypes.ENUM('Entry', 'Exit', 'Refusal'),
                allowNull: false,
                field: 'action_type',
            },
            details: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'HistoryLog',
            tableName: 'history_logs',
            timestamps: false,
            // Constraint FC2: Table partitioning by year should be handled via a raw SQL migration.
        }
    );

    return HistoryLog as HistoryLogModel;
};

const HistoryLog = defineHistoryLogModel(defaultSequelize);

export default HistoryLog;