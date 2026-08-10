import { DataTypes, Model, UUIDV4 } from "sequelize";
import { sequelize } from "../config/database.js";

class ItemOrden extends Model { }

ItemOrden.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4
    },
    ordenId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    tipo: {
        type: DataTypes.ENUM("entrada", "combo"),
        allowNull: false,
    },
    funcionButacaId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    comboId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    descripcion: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    precioUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    descuentoAplicado: {
        type: DataTypes.STRING(50),
        allowNull: true
    }
}, {
    sequelize,
    modelName: "ItemOrden",
    tableName: "item_ordenes",
    indexes: [
        { fields: ["orden_id"] }
    ]
})

export default ItemOrden