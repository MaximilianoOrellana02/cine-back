import { DataTypes, Model, UUIDV4 } from "sequelize";
import { sequelize } from "../config/database.js";

class Ticket extends Model { }

Ticket.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4
    },
    codigo: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true
    },
    ordenId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    funcionId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    funcionButacaId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true
    },
    qrToken: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    },
    nombreAsistente: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    estado: {
        type: DataTypes.ENUM("valido", "usado", "anulado"),
        allowNull: false,
        defaultValue: "valido"
    },
    usadoEn: {
        type: DataTypes.DATE,
        allowNull: true
    },
    usadoPor: {
        type: DataTypes.UUID,
        allowNull: true
    },
    datosSnapshot: {
        type: DataTypes.JSONB,
        allowNull: false
    }

}, {
    sequelize,
    modelName: "Ticket",
    tableName: "tickets",
    indexes: [
        { fields: ["orden_id"] },
        { fields: ["funcion_id", "estado"] }
    ]
})

export default Ticket