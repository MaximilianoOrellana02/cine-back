'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('precios', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      formato: {
        type: Sequelize.ENUM('2D', '3D'),
        allowNull: false,
        unique: true,
      },
      monto: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.bulkInsert('precios', [
      {
        id: Sequelize.literal('gen_random_uuid()'),
        formato: '2D',
        monto: 7500.0,
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        formato: '3D',
        monto: 9500.0,
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('precios');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_precios_formato";');
  },
};