# Ensto DB Usage Guide

This guide documents the main API exposed by `@les-desesperes/ensto-db`.

## Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Recommended Usage: `EnstoDatabase`](#recommended-usage-enstodatabase)
- [Connection Options](#connection-options)
- [Built-in Models](#built-in-models)
- [Dynamic Models](#dynamic-models)
- [Singleton Compatibility API](#singleton-compatibility-api)
- [Crypto Utilities](#crypto-utilities)
- [Development](#development)

## Installation

```bash
pnpm add @les-desesperes/ensto-db
```

## Environment Variables

The package reads database configuration from environment variables through `dotenv`.

```env
MYSQL_DATABASE=ensto
MYSQL_USER=root
MYSQL_PASSWORD=secret
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
ENCRYPTION_KEY=your-32-byte-secret-key-string!!
```

### Variables

- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_HOST`
- `MYSQL_PORT` optional, defaults to `3306`
- `ENCRYPTION_KEY` recommended for AES encryption support

## Recommended Usage: `EnstoDatabase`

`EnstoDatabase` is the main high-level API for this package.

It gives you:

- a managed Sequelize instance
- built-in Ensto models
- `authenticate()` and `sync()` helpers
- runtime model registration
- dynamic schema creation support

### Quick Start

```ts
import { EnstoDatabase } from '@les-desesperes/ensto-db';

async function main() {
  const db = new EnstoDatabase();

  await db.authenticate();
  await db.sync();

  const employee = await db.models.Employee.create({
    username: 'admin',
    passwordHash: 'plain-password',
    role: 'Admin',
  });

  console.log(employee.employeeId);

  await db.close();
}

main().catch(console.error);
```

### Available instance methods

#### `authenticate(): Promise<this>`

Delegates to `sequelize.authenticate()` and returns the current `EnstoDatabase` instance.

#### `sync(options?): Promise<this>`

Delegates to `sequelize.sync(options)` and returns the current `EnstoDatabase` instance.

#### `close(): Promise<void>`

Closes the underlying Sequelize connection.

#### `initDefaultModels()`

Initializes the built-in models on the current Sequelize instance.

#### `getModel(name)`

Returns a model by name from the registered models map.

#### `registerModel(name, factory)`

Registers a model using a Sequelize-aware factory function.

#### `createModel(name, attributes, options)`

Creates and registers a Sequelize model directly from a schema definition.

## Connection Options

You can build an `EnstoDatabase` instance from:

- environment variables
- a custom connection config
- an existing Sequelize instance

### Using package-managed connection options

```ts
import { EnstoDatabase } from '@les-desesperes/ensto-db';

const db = new EnstoDatabase({
  connection: {
    database: 'ensto',
    username: 'root',
    password: 'secret',
    host: '127.0.0.1',
    port: 3306,
    logging: false,
  },
});
```

### Using a custom Sequelize instance

```ts
import { EnstoDatabase, createSequelizeInstance } from '@les-desesperes/ensto-db';

const sequelize = createSequelizeInstance({
  database: 'ensto',
  username: 'root',
  password: 'secret',
  host: '127.0.0.1',
});

const db = new EnstoDatabase({ sequelize });
```

## Built-in Models

The package initializes the following built-in models by default.

### `Employee`

Fields:

- `employeeId`
- `username`
- `passwordHash`
- `role`

Behavior:

- hashes `passwordHash` with SHA-256 before create/update

### `DeliveryDriver`

Fields:

- `driverId`
- `encryptedLastName`
- `encryptedFirstName`
- `company`
- `ppeCharterValid`
- `ppeSignatureDate`

Behavior:

- encrypts first/last names before save
- decrypts first/last names after fetch

### `Vehicle`

Fields:

- `vehicleId`
- `licensePlate`
- `vehicleType`
- `driverId`

### `Visitor`

Fields:

- `visitorId`
- `fullName`
- `company`
- `arrivalTime`

### `HistoryLog`

Fields:

- `logId`
- `dateTime`
- `actionType`
- `details`
- optional relation ids to employee/vehicle/driver/visitor

### Built-in associations

- `DeliveryDriver.hasMany(Vehicle)`
- `Vehicle.belongsTo(DeliveryDriver)`
- `Employee.hasMany(HistoryLog)`
- `Vehicle.hasMany(HistoryLog)`
- `DeliveryDriver.hasMany(HistoryLog)`
- `Visitor.hasMany(HistoryLog)`

## Dynamic Models

### `registerModel()` example

Use this when you want full control over the model class.

```ts
import { DataTypes, Model } from 'sequelize';
import { EnstoDatabase } from '@les-desesperes/ensto-db';

const db = new EnstoDatabase();

const Badge = db.registerModel('Badge', (sequelize) => {
  class Badge extends Model {
    declare badgeId: number;
    declare label: string;
  }

  Badge.init(
    {
      badgeId: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      label: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Badge',
      tableName: 'badges',
      timestamps: false,
    }
  );

  return Badge;
});
```

### `createModel()` example

Use this when a schema object is enough.

```ts
import { DataTypes } from 'sequelize';
import { EnstoDatabase } from '@les-desesperes/ensto-db';

const db = new EnstoDatabase();

const Contractor = db.createModel(
  'Contractor',
  {
    contractorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'contractors',
    timestamps: false,
  }
);
```

### Dynamic associations

```ts
import { DataTypes } from 'sequelize';

const BadgeEvent = db.createModel(
  'BadgeEvent',
  {
    badgeEventId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    employeeId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  },
  {
    tableName: 'badge_events',
    timestamps: false,
    associate: (model, models) => {
      model.belongsTo(models.Employee, { foreignKey: 'employeeId', as: 'employee' });
      models.Employee.hasMany(model, { foreignKey: 'employeeId', as: 'badgeEvents' });
    },
  }
);
```

## Singleton Compatibility API

The original singleton-style export is still available.

```ts
import { sequelize, Employee } from '@les-desesperes/ensto-db';

await sequelize.authenticate();
const users = await Employee.findAll();
```

## Crypto Utilities

The package also exports:

- `encryptAES(text: string): string`
- `decryptAES(encryptedText: string): string`
- `hashSHA256(text: string): string`

## Development

```bash
pnpm install
pnpm run build
pnpm test
```

## Notes

- The package emits CommonJS output from TypeScript.
- `README.md` is the package landing page.
- This `docs/USAGE.md` file is included for deeper project/package documentation.

