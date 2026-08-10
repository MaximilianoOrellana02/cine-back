import { DataTypes, Model, UUIDV4 } from "sequelize";
import { sequelize } from "../config/database.js";

class Sala extends Model { }

Sala.init(
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: UUIDV4
        },
        nombre: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
        soporta3d: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        cantidadFilas: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        cantidadColumnas: {
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
    modelName: "Sala",
    tableName: "salas"
}
)

export default Sala