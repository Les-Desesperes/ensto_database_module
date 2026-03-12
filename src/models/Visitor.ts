import { DataTypes, Model, ModelStatic, Optional, Sequelize } from 'sequelize';
import defaultSequelize from '../config/db';

interface VisitorAttributes {
    visitorId: number;
    fullName: string;
    company: string;
    arrivalTime: Date;
}

interface VisitorCreationAttributes extends Optional<VisitorAttributes, 'visitorId'> {}

export type VisitorInstance = Model<VisitorAttributes, VisitorCreationAttributes> & VisitorAttributes;
export type VisitorModel = ModelStatic<VisitorInstance>;

export const defineVisitorModel = (sequelize: Sequelize): VisitorModel => {
    const existingModel = sequelize.models.Visitor as VisitorModel | undefined;
    if (existingModel) {
        return existingModel;
    }

    class Visitor extends Model<VisitorAttributes, VisitorCreationAttributes> implements VisitorAttributes {
        declare visitorId: number;
        declare fullName: string;
        declare company: string;
        declare arrivalTime: Date;
    }

    Visitor.init(
        {
            visitorId: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
                field: 'visitor_id',
            },
            fullName: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'full_name',
            },
            company: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            arrivalTime: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'arrival_time',
            },
        },
        {
            sequelize,
            modelName: 'Visitor',
            tableName: 'visitors',
            timestamps: false,
        }
    );

    return Visitor as VisitorModel;
};

const Visitor = defineVisitorModel(defaultSequelize);

export default Visitor;