# @lesdesesperes/ensto-db

Database module for Ensto built with Sequelize + MySQL.

It provides:
- a preconfigured Sequelize instance
- domain models (`Employee`, `DeliveryDriver`, `Vehicle`, `Visitor`, `HistoryLog`)
- crypto helpers for AES-256 encryption/decryption and SHA-256 hashing

## Installation

```bash
pnpm add @lesdesesperes/ensto-db
```

## Exports

From `src/index.ts`, the package exports:
- `sequelize` (default export from `src/config/db.ts`)
- all models from `src/models`
- crypto utilities from `src/utils/crypto`

Example:

```ts
import {
  sequelize,
  Employee,
  DeliveryDriver,
  Vehicle,
  Visitor,
  HistoryLog,
  encryptAES,
  decryptAES,
  hashSHA256,
} from '@lesdesesperes/ensto-db';
```

## Configuration

This module reads environment variables through `dotenv`.

Create a `.env` file in your app:

```env
MYSQL_DATABASE=ensto
MYSQL_USER=root
MYSQL_PASSWORD=secret
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
ENCRYPTION_KEY=your-32-byte-secret-key-string!!
```

Required variables:
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_HOST`
- `MYSQL_PORT` (optional, defaults to `3306`)
- `ENCRYPTION_KEY` (recommended; fallback exists but should not be used in production)

## Quick Start

```ts
import { sequelize, Employee, DeliveryDriver } from '@lesdesesperes/ensto-db';

async function main() {
  await sequelize.authenticate();

  const admin = await Employee.create({
    username: 'admin',
    passwordHash: 'plain-text-password', // gets hashed by model hook
    role: 'Admin',
  });

  const driver = await DeliveryDriver.create({
    encryptedFirstName: 'John', // gets encrypted by model hook
    encryptedLastName: 'Doe',   // gets encrypted by model hook
    company: 'Acme Logistics',
    ppeCharterValid: true,
    ppeSignatureDate: new Date(),
  });

  console.log(admin.employeeId, driver.driverId);
}

main().catch(console.error);
```

## Models

- `Employee`
  - fields: `employeeId`, `username`, `passwordHash`, `role`
  - behavior: `passwordHash` is SHA-256 hashed in create/update hooks
- `DeliveryDriver`
  - fields: `driverId`, `encryptedLastName`, `encryptedFirstName`, `company`, `ppeCharterValid`, `ppeSignatureDate`
  - behavior: first/last name fields are AES-encrypted before save and decrypted after fetch
- `Vehicle`
  - fields: `vehicleId`, `licensePlate`, `vehicleType`, `driverId`
- `Visitor`
  - fields: `visitorId`, `fullName`, `company`, `arrivalTime`
- `HistoryLog`
  - fields: `logId`, `dateTime`, `actionType`, `details`, plus nullable relation ids

### Associations

Defined in `src/models/index.ts`:
- `DeliveryDriver` has many `Vehicle`
- `Employee` has many `HistoryLog`
- `Vehicle` has many `HistoryLog`
- `DeliveryDriver` has many `HistoryLog`
- `Visitor` has many `HistoryLog`

## Crypto Utilities

- `encryptAES(text: string): string`
- `decryptAES(encryptedText: string): string`
- `hashSHA256(text: string): string`

## Development

Install dependencies:

```bash
pnpm install
```

Build TypeScript:

```bash
pnpm run build
```

Package output:
- JS: `dist/index.js`
- Types: `dist/index.d.ts`

## Notes

- This package targets CommonJS output (`tsconfig.json` -> `"module": "CommonJS"`).
- There is currently no test script in `package.json`.
- `prepublishOnly` runs the build automatically before publishing.

