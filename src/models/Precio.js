import { DataTypes, Model, UUIDV4 } from "sequelize";
import { sequelize } from "../config/database.js";

class Precio extends Model { }

Precio.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4
    },
    formato: {
        type: DataTypes.ENUM("2D", "3D"),
        allowNull: false,
        unique: true
    },
    monto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: "Precio",
    tableName: "precios"
})

export default Precio;