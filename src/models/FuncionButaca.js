import { DataTypes, Model, UUIDV4 } from "sequelize";
import { sequelize } from "../config/database.js";

class FuncionButaca extends Model { }

FuncionButaca.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4
    },
    funcionId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    butacaId: {
        type: DataTypes.UUID,
        allowNull: false
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
    estado: {
        type: DataTypes.ENUM("libre", "bloqueada", "vendida"),
        defaultValue: "libre",
        allowNull: false
    },
    bloqueadaPor: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    expiraEn: {
        type: DataTypes.DATE,
        allowNull: true
    },
    ordenId: {
        type: DataTypes.UUID,
        allowNull: true
    }
}, {
    sequelize,
    modelName: "FuncionButaca",
    tableName: "funcion_butacas",
    indexes: [
        {
            unique: true,
            fields: ["funcion_id", "butaca_id"]
        },
        {
            fields: ["funcion_id", "estado"]
        }
    ]
})

export default FuncionButaca