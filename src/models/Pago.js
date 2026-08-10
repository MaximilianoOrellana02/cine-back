import { DataTypes, Model, UUIDV4 } from "sequelize";
import { sequelize } from "../config/database.js";

class Pago extends Model { }

Pago.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4
    },
    ordenId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    proveedor: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: "mercadopago"
    },
    preferenciaId: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    paymentId: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true
    },
    estado: {
        type: DataTypes.ENUM("pendiente", "aprobado", "rechazado", "en_proceso", "reembolsado", "cancelado"),
        allowNull: false,
        defaultValue: "pendiente"
    },
    estadoProveedor: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    monto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    metodoPago: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    cuotas: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    detalleEstado: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    payloadWebhook: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    procesadoEn: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize,
    modelName: "Pago",
    tableName: "pagos",
    indexes: [
        { fields: ["orden_id"] },
        { fields: ["estado", "created_at"] }
    ]
})

export default Pago