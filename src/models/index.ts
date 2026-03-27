import { Sequelize } from 'sequelize';
import defaultSequelize from '../config/db';
import { defineCompanyModel, CompanyModel } from './Company';
import { defineDeliveryDriverModel, DeliveryDriverModel } from './DeliveryDriver';
import { defineEmployeeModel, EmployeeModel } from './Employee';
import { defineHistoryLogModel, HistoryLogModel } from './HistoryLog';
import { defineTempPlateModel, TempPlateModel } from './TempPlate';
import { defineVehicleModel, VehicleModel } from './Vehicle';
import { defineVisitorModel, VisitorModel } from './Visitor';

export interface EnstoModels {
    Company: CompanyModel;
    Employee: EmployeeModel;
    DeliveryDriver: DeliveryDriverModel;
    Vehicle: VehicleModel;
    Visitor: VisitorModel;
    HistoryLog: HistoryLogModel;
    TempPlate: TempPlateModel;
}

const associatedSequelizeInstances = new WeakSet<Sequelize>();

const applyAssociations = ({ Employee, DeliveryDriver, Vehicle, Visitor, HistoryLog }: EnstoModels): void => {
    DeliveryDriver.hasMany(Vehicle, { foreignKey: 'driverId' });
    Vehicle.belongsTo(DeliveryDriver, { foreignKey: 'driverId' });

    Employee.hasMany(HistoryLog, { foreignKey: 'employeeId' });
    HistoryLog.belongsTo(Employee, { foreignKey: 'employeeId' });

    Vehicle.hasMany(HistoryLog, { foreignKey: 'vehicleId' });
    HistoryLog.belongsTo(Vehicle, { foreignKey: 'vehicleId' });

    DeliveryDriver.hasMany(HistoryLog, { foreignKey: 'driverId' });
    HistoryLog.belongsTo(DeliveryDriver, { foreignKey: 'driverId' });

    Visitor.hasMany(HistoryLog, { foreignKey: 'visitorId' });
    HistoryLog.belongsTo(Visitor, { foreignKey: 'visitorId' });
};

export const initModels = (sequelize: Sequelize = defaultSequelize): EnstoModels => {
    const models: EnstoModels = {
        Company: defineCompanyModel(sequelize),
        Employee: defineEmployeeModel(sequelize),
        DeliveryDriver: defineDeliveryDriverModel(sequelize),
        Vehicle: defineVehicleModel(sequelize),
        Visitor: defineVisitorModel(sequelize),
        HistoryLog: defineHistoryLogModel(sequelize),
        TempPlate: defineTempPlateModel(sequelize),
    };

    if (!associatedSequelizeInstances.has(sequelize)) {
        applyAssociations(models);
        associatedSequelizeInstances.add(sequelize);
    }

    return models;
};

const defaultModels = initModels(defaultSequelize);

export const { Company, Employee, DeliveryDriver, Vehicle, Visitor, HistoryLog, TempPlate } = defaultModels;

export {
    defineCompanyModel,
    defineEmployeeModel,
    defineDeliveryDriverModel,
    defineVehicleModel,
    defineVisitorModel,
    defineHistoryLogModel,
    defineTempPlateModel,
};

export default defaultModels;
