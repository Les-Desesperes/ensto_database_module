import { DataTypes, Model, ModelStatic, Optional, Sequelize } from 'sequelize';
import defaultSequelize from '../config/db';
import { decryptAES, encryptAES } from '../utils/crypto';

interface DeliveryDriverAttributes {
    driverId: number;
    encryptedLastName: string;
    encryptedFirstName: string;
    company: string;
    ppeCharterValid: boolean; // PPE = Personal Protective Equipment (EPI in French)
    ppeSignatureDate: Date | null;
}

interface DeliveryDriverCreationAttributes extends Optional<DeliveryDriverAttributes, 'driverId'> {}

export type DeliveryDriverInstance = Model<DeliveryDriverAttributes, DeliveryDriverCreationAttributes> & DeliveryDriverAttributes;
export type DeliveryDriverModel = ModelStatic<DeliveryDriverInstance>;

export const defineDeliveryDriverModel = (sequelize: Sequelize): DeliveryDriverModel => {
    const existingModel = sequelize.models.DeliveryDriver as DeliveryDriverModel | undefined;
    if (existingModel) {
        return existingModel;
    }

    class DeliveryDriver extends Model<DeliveryDriverAttributes, DeliveryDriverCreationAttributes> implements DeliveryDriverAttributes {
        declare driverId: number;
        declare encryptedLastName: string;
        declare encryptedFirstName: string;
        declare company: string;
        declare ppeCharterValid: boolean;
        declare ppeSignatureDate: Date | null;
    }

    DeliveryDriver.init(
        {
            driverId: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
                field: 'driver_id',
            },
            encryptedLastName: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'encrypted_last_name',
            },
            encryptedFirstName: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'encrypted_first_name',
            },
            company: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            ppeCharterValid: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                field: 'ppe_charter_valid',
            },
            ppeSignatureDate: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'ppe_signature_date',
            },
        },
        {
            sequelize,
            modelName: 'DeliveryDriver',
            tableName: 'delivery_drivers',
            timestamps: false,
            hooks: {
                beforeSave: (driver: DeliveryDriverInstance) => {
                    if (driver.changed('encryptedFirstName')) {
                        driver.encryptedFirstName = encryptAES(driver.encryptedFirstName);
                    }
                    if (driver.changed('encryptedLastName')) {
                        driver.encryptedLastName = encryptAES(driver.encryptedLastName);
                    }
                },
                afterFind: (result: DeliveryDriverInstance | DeliveryDriverInstance[] | null) => {
                    if (!result) {
                        return;
                    }

                    if (Array.isArray(result)) {
                        result.forEach((driver) => {
                            driver.encryptedFirstName = decryptAES(driver.encryptedFirstName);
                            driver.encryptedLastName = decryptAES(driver.encryptedLastName);
                        });
                        return;
                    }

                    result.encryptedFirstName = decryptAES(result.encryptedFirstName);
                    result.encryptedLastName = decryptAES(result.encryptedLastName);
                },
            },
        }
    );

    return DeliveryDriver as DeliveryDriverModel;
};

const DeliveryDriver = defineDeliveryDriverModel(defaultSequelize);

export default DeliveryDriver;