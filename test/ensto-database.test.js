const assert = require('node:assert/strict');
const { DataTypes, Model } = require('sequelize');
const { EnstoDatabase } = require('../dist');

async function run() {
  let closeCalls = 0;

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

  try {
    const builtInModels = Object.keys(db.models).sort();
    const expectedModels = [
      'Company',
      'DeliveryDriver',
      'Employee',
      'HistoryLog',
      'TempPlate',
      'Vehicle',
      'Visitor',
    ];

    assert.deepEqual(builtInModels, expectedModels, 'built-in models should be initialized');
    assert.ok(db.getModel('Employee'), 'Employee model should be retrievable');
    assert.ok(db.getModel('DeliveryDriver'), 'DeliveryDriver model should be retrievable');
    assert.ok(db.getModel('TempPlate'), 'TempPlate model should be retrievable');

    let authenticateCalls = 0;
    let syncCalls = 0;
    let syncOptions;
    db.sequelize.authenticate = async () => {
      authenticateCalls += 1;
    };

    db.sequelize.sync = async (options) => {
      syncCalls += 1;
      syncOptions = options;
      return db.sequelize;
    };

    db.sequelize.close = async () => {
      closeCalls += 1;
    };

    const authenticateResult = await db.authenticate();
    assert.strictEqual(authenticateResult, db, 'authenticate should resolve with the EnstoDatabase instance');
    assert.strictEqual(authenticateCalls, 1, 'authenticate should delegate to sequelize.authenticate');

    const syncResult = await db.sync({ force: true });
    assert.strictEqual(syncResult, db, 'sync should resolve with the EnstoDatabase instance');
    assert.strictEqual(syncCalls, 1, 'sync should delegate to sequelize.sync');
    assert.deepEqual(syncOptions, { force: true }, 'sync should pass options through');

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

    const ContractorAgain = db.createModel(
      'Contractor',
      {
        contractorId: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
      },
      {
        tableName: 'contractors',
        timestamps: false,
      }
    );

    assert.strictEqual(Contractor, ContractorAgain, 'createModel should be idempotent per model name');
    assert.strictEqual(db.getModel('Contractor'), Contractor, 'dynamic model should be registered');

    let badgeFactoryCalls = 0;

    const Badge = db.registerModel('Badge', (sequelize) => {
      badgeFactoryCalls += 1;

      class Badge extends Model {}

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

    const BadgeAgain = db.registerModel('Badge', () => {
      throw new Error('registerModel should not invoke the factory twice for the same name');
    });

    assert.strictEqual(Badge, BadgeAgain, 'registerModel should return the existing model when called twice');
    assert.strictEqual(badgeFactoryCalls, 1, 'registerModel should only invoke the factory once');

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
        direction: {
          type: DataTypes.ENUM('IN', 'OUT'),
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

    assert.ok(BadgeEvent.associations.employee, 'dynamic association should be attached to the dynamic model');
    assert.ok(db.models.Employee.associations.badgeEvents, 'dynamic association should be attached to built-in model');

    const employee = db.models.Employee.build({
      username: 'admin',
      badgeUuid: 'B053AF25',
      passwordHash: 'plain-password',
      role: 'Admin',
    });

    const beforeCreateHooks = db.models.Employee.options.hooks.beforeCreate;
    const hooks = Array.isArray(beforeCreateHooks) ? beforeCreateHooks : [beforeCreateHooks];

    for (const hook of hooks) {
      await hook(employee);
    }

    assert.notStrictEqual(employee.passwordHash, 'plain-password', 'password should be transformed by the beforeCreate hook');
    assert.strictEqual(employee.passwordHash.length, 64, 'SHA-256 hash should be 64 hex chars');

    const contractor = Contractor.build({
      companyName: 'Acme Logistics',
    });
    assert.strictEqual(contractor.get('companyName'), 'Acme Logistics', 'dynamic model instances should be buildable');

    console.log('EnstoDatabase integration test passed.');
  } finally {
    await db.close();
    assert.strictEqual(closeCalls, 1, 'close should delegate to sequelize.close exactly once');
  }
}

run().catch((error) => {
  console.error('EnstoDatabase integration test failed.');
  console.error(error);
  process.exitCode = 1;
});

