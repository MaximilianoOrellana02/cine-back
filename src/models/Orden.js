import { DataTypes, Model, UUIDV4 } from "sequelize";
import { sequelize } from "../config/database.js";

class Orden extends Model { }

Orden.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4
    },
    numero: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    usuarioId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    emailComprador: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: { isEmail: true }
    },
    nombreComprador: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    cargoServicio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    estado: {
        type: DataTypes.ENUM("pendiente", "pagada", "cancelada", "reembolsada", "expirada"),
        allowNull: false,
        defaultValue: "pendiente"
    },
    expiraEn: {
        type: DataTypes.DATE,
        allowNull: false
    },
    pagadaEn: {
        type: DataTypes.DATE,
        allowNull: true
    },
    motivoCancelacion: {
        type: DataTypes.STRING(200),
        allowNull: true
    }
}, {
    sequelize,
    modelName: "Orden",
    tableName: "ordenes",
    indexes: [
        { fields: ["estado", "expira_en"] },
        { fields: ["usuario_id"] }
    ]
})

export default Orden