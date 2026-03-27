import { DataTypes, Model, ModelStatic, Optional, Sequelize } from 'sequelize';
import defaultSequelize from '../config/db';

export type CompanyType = 'Carrier' | 'Third-Party Service Provider';

interface CompanyAttributes {
	companyId: number;
	name: string;
	type: CompanyType;
	contactEmail: string;
	contactPhone: string;
}

interface CompanyCreationAttributes extends Optional<CompanyAttributes, 'companyId'> {}

export type CompanyInstance = Model<CompanyAttributes, CompanyCreationAttributes> & CompanyAttributes;
export type CompanyModel = ModelStatic<CompanyInstance>;

export const defineCompanyModel = (sequelize: Sequelize): CompanyModel => {
	const existingModel = sequelize.models.Company as CompanyModel | undefined;
	if (existingModel) {
		return existingModel;
	}

	class Company extends Model<CompanyAttributes, CompanyCreationAttributes> implements CompanyAttributes {
		declare companyId: number;
		declare name: string;
		declare type: CompanyType;
		declare contactEmail: string;
		declare contactPhone: string;
	}

	Company.init(
		{
			companyId: {
				type: DataTypes.INTEGER.UNSIGNED,
				autoIncrement: true,
				primaryKey: true,
				field: 'company_id',
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			type: {
				type: DataTypes.ENUM('Carrier', 'Third-Party Service Provider'),
				allowNull: false,
			},
			contactEmail: {
				type: DataTypes.STRING,
				allowNull: false,
				field: 'contact_email',
				validate: {
					isEmail: true,
				},
			},
			contactPhone: {
				type: DataTypes.STRING,
				allowNull: false,
				field: 'contact_phone',
			},
		},
		{
			sequelize,
			modelName: 'Company',
			tableName: 'companies',
			timestamps: false,
		}
	);

	return Company as CompanyModel;
};

const Company = defineCompanyModel(defaultSequelize);

export default Company;

