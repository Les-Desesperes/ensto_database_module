import {
    InitOptions,
    Model,
    ModelAttributes,
    ModelStatic,
    Sequelize,
    SyncOptions,
} from 'sequelize';
import defaultSequelize, {
    createSequelizeInstance,
    EnstoDatabaseConnectionOptions,
} from '../config/db';
import { EnstoModels, initModels } from '../models';

export type RegisteredModel = ModelStatic<Model>;

export interface EnstoDatabaseOptions {
    sequelize?: Sequelize;
    connection?: EnstoDatabaseConnectionOptions;
    initializeDefaultModels?: boolean;
}

export interface DynamicModelOptions extends Omit<InitOptions<Model>, 'sequelize' | 'modelName'> {
    associate?: (model: RegisteredModel, models: Sequelize['models']) => void;
}

export class EnstoDatabase {
    public readonly sequelize: Sequelize;
    public readonly models: Record<string, RegisteredModel> = {};

    constructor(options: EnstoDatabaseOptions = {}) {
        this.sequelize =
            options.sequelize ??
            (options.connection ? createSequelizeInstance(options.connection) : defaultSequelize);

        if (options.initializeDefaultModels ?? true) {
            this.initDefaultModels();
        }
    }

    public initDefaultModels(): EnstoModels {
        const builtInModels = initModels(this.sequelize);
        Object.assign(this.models, builtInModels);
        return builtInModels;
    }

    public async authenticate(): Promise<this> {
        await this.sequelize.authenticate();
        return this;
    }

    public async sync(options?: SyncOptions): Promise<this> {
        await this.sequelize.sync(options);
        return this;
    }

    public async close(): Promise<void> {
        await this.sequelize.close();
    }

    public getModel<T extends RegisteredModel = RegisteredModel>(name: string): T | undefined {
        return (this.models[name] ?? this.sequelize.models[name]) as T | undefined;
    }

    public registerModel<T extends RegisteredModel>(
        name: string,
        factory: (sequelize: Sequelize) => T
    ): T {
        const existingModel = this.getModel<T>(name);
        if (existingModel) {
            return existingModel;
        }

        const model = factory(this.sequelize);
        this.models[name] = model;
        return model;
    }

    public createModel(
        name: string,
        attributes: ModelAttributes<Model, Record<string, unknown>>,
        options: DynamicModelOptions = {}
    ): RegisteredModel {
        const existingModel = this.getModel(name);
        if (existingModel) {
            return existingModel;
        }

        const { associate, ...initOptions } = options;

        class DynamicModel extends Model {}

        DynamicModel.init(attributes, {
            ...initOptions,
            sequelize: this.sequelize,
            modelName: name,
        });

        const initializedModel = DynamicModel as RegisteredModel;
        this.models[name] = initializedModel;

        associate?.(initializedModel, this.sequelize.models);

        return initializedModel;
    }
}


