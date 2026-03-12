import { DataTypes, Model, ModelStatic, Optional, Sequelize } from 'sequelize';
import defaultSequelize from '../config/db';
import { hashSHA256 } from '../utils/crypto';

interface EmployeeAttributes {
    employeeId: number;
    username: string;
    passwordHash: string;
    role: 'Admin' | 'WarehouseWorker';
}

interface EmployeeCreationAttributes extends Optional<EmployeeAttributes, 'employeeId'> {}

export type EmployeeInstance = Model<EmployeeAttributes, EmployeeCreationAttributes> & EmployeeAttributes;
export type EmployeeModel = ModelStatic<EmployeeInstance>;

export const defineEmployeeModel = (sequelize: Sequelize): EmployeeModel => {
    const existingModel = sequelize.models.Employee as EmployeeModel | undefined;
    if (existingModel) {
        return existingModel;
    }

    class Employee extends Model<EmployeeAttributes, EmployeeCreationAttributes> implements EmployeeAttributes {
        declare employeeId: number;
        declare username: string;
        declare passwordHash: string;
        declare role: 'Admin' | 'WarehouseWorker';
    }

    Employee.init(
        {
            employeeId: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
                field: 'employee_id',
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            passwordHash: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'password_hash',
            },
            role: {
                type: DataTypes.ENUM('Admin', 'WarehouseWorker'),
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'Employee',
            tableName: 'employees',
            timestamps: false,
            hooks: {
                beforeCreate: (employee: EmployeeInstance) => {
                    if (employee.passwordHash) {
                        employee.passwordHash = hashSHA256(employee.passwordHash);
                    }
                },
                beforeUpdate: (employee: EmployeeInstance) => {
                    if (employee.changed('passwordHash')) {
                        employee.passwordHash = hashSHA256(employee.passwordHash);
                    }
                },
            },
        }
    );

    return Employee as EmployeeModel;
};

const Employee = defineEmployeeModel(defaultSequelize);

export default Employee;