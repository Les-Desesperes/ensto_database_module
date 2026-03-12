import { DataTypes, Model, ModelStatic, Optional, Sequelize } from 'sequelize';
import defaultSequelize from '../config/db';

interface VehicleAttributes {
    vehicleId: number;
    licensePlate: string;
    vehicleType: 'HGV' | 'LCV'; // HGV = Heavy Goods Vehicle (PL), LCV = Light Commercial Vehicle (VUL)
    driverId?: number; // Foreign Key
}

interface VehicleCreationAttributes extends Optional<VehicleAttributes, 'vehicleId'> {}

export type VehicleInstance = Model<VehicleAttributes, VehicleCreationAttributes> & VehicleAttributes;
export type VehicleModel = ModelStatic<VehicleInstance>;

export const defineVehicleModel = (sequelize: Sequelize): VehicleModel => {
    const existingModel = sequelize.models.Vehicle as VehicleModel | undefined;
    if (existingModel) {
        return existingModel;
    }

    class Vehicle extends Model<VehicleAttributes, VehicleCreationAttributes> implements VehicleAttributes {
        declare vehicleId: number;
        declare licensePlate: string;
        declare vehicleType: 'HGV' | 'LCV';
        declare driverId: number;
    }

    Vehicle.init(
        {
            vehicleId: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
                field: 'vehicle_id',
            },
            licensePlate: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                field: 'license_plate',
            },
            vehicleType: {
                type: DataTypes.ENUM('HGV', 'LCV'),
                allowNull: false,
                field: 'vehicle_type',
            },
        },
        {
            sequelize,
            modelName: 'Vehicle',
            tableName: 'vehicles',
            timestamps: false,
        }
    );

    return Vehicle as VehicleModel;
};

const Vehicle = defineVehicleModel(defaultSequelize);

export default Vehicle;