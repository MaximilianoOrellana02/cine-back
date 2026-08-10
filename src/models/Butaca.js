import { DataTypes, Model, UUIDV4 } from "sequelize";
import { sequelize } from "../config/database.js";

class Butaca extends Model { }

Butaca.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4
    },
    salaId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    fila: {
        type: DataTypes.STRING(2),
        allowNull: false
    },
    numero: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    tipo: {
        type: DataTypes.ENUM("normal", "accesible", "vip"),
        defaultValue: "normal",
        allowNull: false
    },
    posX: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    posY: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    activa: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: "Butaca",
    tableName: "butacas",
    indexes: [
        {
            unique: true,
            fields: ["sala_id", "fila", "numero"]
        }
    ]
}

)

export default Butaca