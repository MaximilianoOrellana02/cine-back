import { DataTypes, Model, UUIDV4 } from "sequelize";
import { sequelize } from "../config/database.js";

class Combo extends Model { }

Combo.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    descripcion: {
        type: DataTypes.STRING(300),
        allowNull: true
    },
    precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    imagenUrl: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    orden: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: "Combo",
    tableName: "combos"
})

export default Combo