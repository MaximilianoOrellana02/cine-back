import { DataTypes, Model, UUIDV4 } from "sequelize";
import { sequelize } from "../config/database.js";
import bcrypt from "bcryptjs"


class Usuario extends Model {
    toJSON() {
        const valores = { ...this.get() };
        delete valores.password;
        return valores
    }
}

Usuario.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4
    },
    email: {
        type: DataTypes.STRING(150),
        unique: true,
        allowNull: false,
        validate: { isEmail: true }
    },
    password: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    telefono: {
        type: DataTypes.STRING(30),
        allowNull: true
    },
    rol: {
        type: DataTypes.ENUM("cliente", "admin", "portero"),
        allowNull: false,
        defaultValue: "cliente"
    },
    emailVerificado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: "Usuario",
    tableName: "usuarios",
    hooks: {
        beforeSave: async (usuario) => {
            if (usuario.changed("password")) {
                usuario.password = await bcrypt.hash(usuario.password, 10)
            }
        }
    }
})

export default Usuario