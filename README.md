# @les-desesperes/ensto-db

Sequelize-based database module for Ensto applications.

It provides:
- an `EnstoDatabase` class for connection lifecycle and model management
- built-in Ensto models with associations
- dynamic model registration and schema-based model creation
- a singleton `sequelize` export for compatibility
- crypto helpers for hashing and AES encryption/decryption

## Installation

```bash
pnpm add @les-desesperes/ensto-db
```

## Documentation

Detailed usage documentation is available in [`docs/USAGE.md`](./docs/USAGE.md).

## Quick Start

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

## Main Exports

```ts
import {
  EnstoDatabase,
  sequelize,
  createSequelizeInstance,
  getEnvDatabaseConfig,
  initModels,
  Employee,
  DeliveryDriver,
  Vehicle,
  Visitor,
  HistoryLog,
  encryptAES,
  decryptAES,
  hashSHA256,
} from '@les-desesperes/ensto-db';
```

## Built-in Models

- `Employee`
- `DeliveryDriver`
- `Vehicle`
- `Visitor`
- `HistoryLog`

## Dynamic Models

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

## Environment Variables

```env
MYSQL_DATABASE=ensto
MYSQL_USER=root
MYSQL_PASSWORD=secret
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
ENCRYPTION_KEY=your-32-byte-secret-key-string!!
```

## Development

```bash
pnpm install
pnpm run build
pnpm test
```

## Publish Notes

This release includes the new `EnstoDatabase` API and dynamic model support.
See the full guide in [`docs/USAGE.md`](./docs/USAGE.md) before publishing.
