'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('peliculas', 'formatos', {
      type: Sequelize.ARRAY(Sequelize.STRING(2)),
      allowNull: false,
      defaultValue: ['2D'],
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('peliculas', 'formatos');
  },
};