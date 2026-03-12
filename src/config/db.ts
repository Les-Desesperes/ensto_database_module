import { Options, Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export interface EnstoDatabaseConnectionOptions {
    database?: string;
    username?: string;
    password?: string;
    host?: string;
    port?: number;
    url?: string;
    dialect?: 'mysql';
    logging?: Options['logging'];
    pool?: Options['pool'];
    define?: Options['define'];
    dialectOptions?: Options['dialectOptions'];
}

const DEFAULT_POOL: NonNullable<Options['pool']> = {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
};

export const getEnvDatabaseConfig = (): EnstoDatabaseConnectionOptions => ({
    database: process.env.MYSQL_DATABASE,
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT) || 3306,
    dialect: 'mysql',
    logging: false,
    pool: DEFAULT_POOL,
});

const toSequelizeOptions = (options: EnstoDatabaseConnectionOptions): Options => ({
    host: options.host,
    port: options.port,
    dialect: options.dialect ?? 'mysql',
    logging: options.logging ?? false,
    pool: options.pool ?? DEFAULT_POOL,
    define: options.define,
    dialectOptions: options.dialectOptions,
});

export const createSequelizeInstance = (
    options: EnstoDatabaseConnectionOptions = getEnvDatabaseConfig()
): Sequelize => {
    const sequelizeOptions = toSequelizeOptions(options);

    if (options.url) {
        return new Sequelize(options.url, sequelizeOptions);
    }

    return new Sequelize(
        options.database ?? '',
        options.username ?? '',
        options.password ?? '',
        sequelizeOptions
    );
};

const sequelize = createSequelizeInstance();

export default sequelize;