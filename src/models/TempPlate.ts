import { DataTypes, Model, ModelStatic, Optional, Sequelize } from 'sequelize';
import defaultSequelize from '../config/db';

interface TempPlateAttributes {
    singletonId: number;
    licensePlate: string;
}

interface TempPlateCreationAttributes extends Optional<TempPlateAttributes, 'singletonId'> {}

export type TempPlateInstance = Model<TempPlateAttributes, TempPlateCreationAttributes> & TempPlateAttributes;
export type TempPlateModel = ModelStatic<TempPlateInstance>;

export const defineTempPlateModel = (sequelize: Sequelize): TempPlateModel => {
    const existingModel = sequelize.models.TempPlate as TempPlateModel | undefined;
    if (existingModel) {
        return existingModel;
    }

    class TempPlate extends Model<TempPlateAttributes, TempPlateCreationAttributes> implements TempPlateAttributes {
        declare singletonId: number;
        declare licensePlate: string;
    }

    TempPlate.init(
        {
            singletonId: {
                type: DataTypes.TINYINT.UNSIGNED,
                primaryKey: true,
                allowNull: false,
                defaultValue: 1,
                validate: {
                    isSingleton(value: number) {
                        if (value !== 1) {
                            throw new Error('Only one temp plate row is allowed.');
                        }
                    },
                },
                field: 'singleton_id',
            },
            licensePlate: {
                type: DataTypes.STRING(20),
                allowNull: false,
                field: 'license_plate',
            },
        },
        {
            sequelize,
            modelName: 'TempPlate',
            tableName: 'temp_plates',
            timestamps: true,
            updatedAt: 'updated_at',
            createdAt: 'created_at',
        }
    );

    return TempPlate as TempPlateModel;
};

const TempPlate = defineTempPlateModel(defaultSequelize);

export default TempPlate;
