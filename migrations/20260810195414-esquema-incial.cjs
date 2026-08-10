'use strict';

const timestamps = (Sequelize) => ({
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

const uuidPk = (Sequelize) => ({
  type: Sequelize.UUID,
  defaultValue: Sequelize.UUIDV4,
  primaryKey: true,
});

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. SALAS
    await queryInterface.createTable('salas', {
      id: uuidPk(Sequelize),
      nombre: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      soporta3d: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      cantidad_filas: { type: Sequelize.INTEGER, allowNull: false },
      cantidad_columnas: { type: Sequelize.INTEGER, allowNull: false },
      activa: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      ...timestamps(Sequelize),
    });

    // 2. BUTACAS
    await queryInterface.createTable('butacas', {
      id: uuidPk(Sequelize),
      sala_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'salas', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      fila: { type: Sequelize.STRING(2), allowNull: false },
      numero: { type: Sequelize.INTEGER, allowNull: false },
      tipo: {
        type: Sequelize.ENUM('normal', 'accesible', 'vip'),
        allowNull: false,
        defaultValue: 'normal',
      },
      pos_x: { type: Sequelize.INTEGER, allowNull: false },
      pos_y: { type: Sequelize.INTEGER, allowNull: false },
      activa: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      ...timestamps(Sequelize),
    });

    await queryInterface.addIndex('butacas', ['sala_id', 'fila', 'numero'], {
      unique: true,
      name: 'butacas_sala_fila_numero_unique',
    });

    // 3. PELICULAS
    await queryInterface.createTable('peliculas', {
      id: uuidPk(Sequelize),
      titulo: { type: Sequelize.STRING(255), allowNull: false },
      titulo_original: { type: Sequelize.STRING(255), allowNull: true },
      sinopsis: { type: Sequelize.TEXT, allowNull: true },
      duracion_minutos: { type: Sequelize.INTEGER, allowNull: false },
      clasificacion: {
        type: Sequelize.ENUM('ATP', '+13', '+16', '+18'),
        allowNull: false,
      },
      genero: { type: Sequelize.STRING(100), allowNull: true },
      poster_url: { type: Sequelize.STRING(500), allowNull: true },
      backdrop_url: { type: Sequelize.STRING(500), allowNull: true },
      trailer_url: { type: Sequelize.STRING(500), allowNull: true },
      tmdb_id: { type: Sequelize.INTEGER, allowNull: true, unique: true },
      fecha_estreno: { type: Sequelize.DATEONLY, allowNull: true },
      activa: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      ...timestamps(Sequelize),
    });

    // 4. USUARIOS
    await queryInterface.createTable('usuarios', {
      id: uuidPk(Sequelize),
      email: { type: Sequelize.STRING(150), allowNull: false, unique: true },
      password: { type: Sequelize.STRING(100), allowNull: false },
      nombre: { type: Sequelize.STRING(100), allowNull: false },
      telefono: { type: Sequelize.STRING(30), allowNull: true },
      rol: {
        type: Sequelize.ENUM('cliente', 'admin', 'portero'),
        allowNull: false,
        defaultValue: 'cliente',
      },
      email_verificado: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      activo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      ...timestamps(Sequelize),
    });

    // 5. COMBOS
    await queryInterface.createTable('combos', {
      id: uuidPk(Sequelize),
      nombre: { type: Sequelize.STRING(100), allowNull: false },
      descripcion: { type: Sequelize.STRING(300), allowNull: true },
      precio: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      imagen_url: { type: Sequelize.STRING(500), allowNull: true },
      orden: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      stock: { type: Sequelize.INTEGER, allowNull: true },
      activo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      ...timestamps(Sequelize),
    });

    // 6. FUNCIONES
    await queryInterface.createTable('funciones', {
      id: uuidPk(Sequelize),
      pelicula_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'peliculas', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      sala_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'salas', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      inicia: { type: Sequelize.DATE, allowNull: false },
      termina: { type: Sequelize.DATE, allowNull: false },
      formato: {
        type: Sequelize.ENUM('2D', '3D'),
        allowNull: false,
        defaultValue: '2D',
      },
      idioma: {
        type: Sequelize.ENUM('doblada', 'subtitulada'),
        allowNull: false,
        defaultValue: 'doblada',
      },
      precio_base: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      estado: {
        type: Sequelize.ENUM('programada', 'en_venta', 'cancelada', 'finalizada'),
        allowNull: false,
        defaultValue: 'programada',
      },
      butacas_generadas: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      ...timestamps(Sequelize),
    });

    await queryInterface.addIndex('funciones', ['inicia']);

    // 7. FUNCION_BUTACAS
    await queryInterface.createTable('funcion_butacas', {
      id: uuidPk(Sequelize),
      funcion_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'funciones', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      butaca_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'butacas', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      fila: { type: Sequelize.STRING(2), allowNull: false },
      numero: { type: Sequelize.INTEGER, allowNull: false },
      tipo: {
        type: Sequelize.ENUM('normal', 'accesible', 'vip'),
        allowNull: false,
        defaultValue: 'normal',
      },
      pos_x: { type: Sequelize.INTEGER, allowNull: false },
      pos_y: { type: Sequelize.INTEGER, allowNull: false },
      estado: {
        type: Sequelize.ENUM('libre', 'bloqueada', 'vendida'),
        allowNull: false,
        defaultValue: 'libre',
      },
      bloqueada_por: { type: Sequelize.STRING(100), allowNull: true },
      expira_en: { type: Sequelize.DATE, allowNull: true },
      orden_id: { type: Sequelize.UUID, allowNull: true },
      ...timestamps(Sequelize),
    });

    await queryInterface.addIndex('funcion_butacas', ['funcion_id', 'butaca_id'], {
      unique: true,
      name: 'funcion_butacas_funcion_butaca_unique',
    });
    await queryInterface.addIndex('funcion_butacas', ['funcion_id', 'estado']);

    // 8. ORDENES
    await queryInterface.createTable('ordenes', {
      id: uuidPk(Sequelize),
      numero: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      usuario_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'usuarios', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      email_comprador: { type: Sequelize.STRING(150), allowNull: false },
      nombre_comprador: { type: Sequelize.STRING(100), allowNull: false },
      subtotal: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      cargo_servicio: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      total: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      estado: {
        type: Sequelize.ENUM('pendiente', 'pagada', 'cancelada', 'reembolsada', 'expirada'),
        allowNull: false,
        defaultValue: 'pendiente',
      },
      expira_en: { type: Sequelize.DATE, allowNull: false },
      pagada_en: { type: Sequelize.DATE, allowNull: true },
      motivo_cancelacion: { type: Sequelize.STRING(200), allowNull: true },
      ...timestamps(Sequelize),
    });

    await queryInterface.addIndex('ordenes', ['estado', 'expira_en']);
    await queryInterface.addIndex('ordenes', ['usuario_id']);

    // FK de funcion_butacas → ordenes (se agrega ahora porque ordenes ya existe)
    await queryInterface.addConstraint('funcion_butacas', {
      fields: ['orden_id'],
      type: 'foreign key',
      name: 'funcion_butacas_orden_fk',
      references: { table: 'ordenes', field: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    // 9. ITEM_ORDENES
    await queryInterface.createTable('item_ordenes', {
      id: uuidPk(Sequelize),
      orden_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'ordenes', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      tipo: { type: Sequelize.ENUM('entrada', 'combo'), allowNull: false },
      funcion_butaca_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'funcion_butacas', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      combo_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'combos', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      descripcion: { type: Sequelize.STRING(200), allowNull: false },
      cantidad: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      precio_unitario: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      subtotal: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      descuento_aplicado: { type: Sequelize.STRING(50), allowNull: true },
      ...timestamps(Sequelize),
    });

    await queryInterface.addIndex('item_ordenes', ['orden_id']);

    // 10. TICKETS
    await queryInterface.createTable('tickets', {
      id: uuidPk(Sequelize),
      codigo: { type: Sequelize.STRING(30), allowNull: false, unique: true },
      orden_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'ordenes', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      funcion_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'funciones', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      funcion_butaca_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'funcion_butacas', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      qr_token: { type: Sequelize.TEXT, allowNull: false, unique: true },
      nombre_asistente: { type: Sequelize.STRING(100), allowNull: true },
      estado: {
        type: Sequelize.ENUM('valido', 'usado', 'anulado'),
        allowNull: false,
        defaultValue: 'valido',
      },
      usado_en: { type: Sequelize.DATE, allowNull: true },
      usado_por: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'usuarios', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      datos_snapshot: { type: Sequelize.JSONB, allowNull: false },
      ...timestamps(Sequelize),
    });

    await queryInterface.addIndex('tickets', ['orden_id']);
    await queryInterface.addIndex('tickets', ['funcion_id', 'estado']);

    // 11. PAGOS
    await queryInterface.createTable('pagos', {
      id: uuidPk(Sequelize),
      orden_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'ordenes', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      proveedor: { type: Sequelize.STRING(30), allowNull: false, defaultValue: 'mercadopago' },
      preferencia_id: { type: Sequelize.STRING(100), allowNull: true },
      payment_id: { type: Sequelize.STRING(100), allowNull: true, unique: true },
      estado: {
        type: Sequelize.ENUM('pendiente', 'aprobado', 'rechazado', 'en_proceso', 'reembolsado', 'cancelado'),
        allowNull: false,
        defaultValue: 'pendiente',
      },
      estado_proveedor: { type: Sequelize.STRING(50), allowNull: true },
      monto: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      metodo_pago: { type: Sequelize.STRING(50), allowNull: true },
      cuotas: { type: Sequelize.INTEGER, allowNull: true },
      detalle_estado: { type: Sequelize.STRING(100), allowNull: true },
      payload_webhook: { type: Sequelize.JSONB, allowNull: true },
      procesado_en: { type: Sequelize.DATE, allowNull: true },
      ...timestamps(Sequelize),
    });

    await queryInterface.addIndex('pagos', ['orden_id']);
    await queryInterface.addIndex('pagos', ['estado', 'created_at']);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  },
};