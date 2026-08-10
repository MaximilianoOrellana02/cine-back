import { DataTypes, Model, UUIDV4 } from "sequelize";
import { sequelize } from "../config/database.js";

class Funcion extends Model { }

Funcion.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4
    },
    peliculaId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    salaId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    inicia: {
        type: DataTypes.DATE,
        allowNull: false
    },
    termina: {
        type: DataTypes.DATE,
        allowNull: false
    },
    formato: {
        type: DataTypes.ENUM("2D", "3D"),
        allowNull: false,
        defaultValue: "2D"
    },
    idioma: {
        type: DataTypes.ENUM("doblada", "subtitulada"),
        defaultValue: "doblada",
        allowNull: false
    },
    precioBase: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    estado: {
        type: DataTypes.ENUM("programada", "en_venta", "cancelada", "finalizada"),
        allowNull: false,
        defaultValue: "programada"
    },
    butacasGeneradas: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: "Funcion",
    tableName: "funciones",
    indexes: [
        { fields: ["inicia"] }
    ]
})

export default Funcion