import { Sequelize } from "sequelize";
import "dotenv/config"

const esProduccion = process.env.NODE_ENV === "production"

export const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        dialect: "postgres",
        timezone: "-03:00",
        logging: false,

        dialectOptions: esProduccion
            ? { ssl: { require: true, rejectUnauthorized: false } }
            : {},
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        define: {
            timestamps: true,
            underscored: true,
            freezeTableName: false
        }
    }
)

export async function conectarDB() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a PostgreSQL establecida');
    } catch (error) {
        console.error('❌ Error al conectar con PostgreSQL:', error.message);
        process.exit(1);
    }
}