import { DataTypes, Model, UUIDV4 } from "sequelize";
import { sequelize } from "../config/database.js";

class Pelicula extends Model { }

Pelicula.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4
    },
    titulo: {
        type: DataTypes.STRING(250),
        allowNull: false
    },
    tituloOriginal: {
        type: DataTypes.STRING(250),
        allowNull: true
    },
    sinopsis: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    duracionMinutos: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    clasificacion: {
        type: DataTypes.ENUM("ATP", "+13", "+16", "+18"),
        allowNull: false
    },
    genero: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    posterUrl: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    backdropUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    trailerUrl: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    tmdbId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true
    },
    fechaEstreno: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    activa: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: "Pelicula",
    tableName: "peliculas"
})

export default Pelicula