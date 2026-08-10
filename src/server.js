import 'dotenv/config'
import app from './app.js'
import { conectarDB } from './config/database.js'
import { iniciarJobs } from './jobs/index.js';


const PORT = process.env.PORT || 3000

async function iniciar() {
    await conectarDB();

    const requeridas = [
        'DB_NAME', 'DB_USER', 'JWT_SECRET',
        'MP_ACCESS_TOKEN', 'FRONTEND_URL', 'BACKEND_URL',
    ];
    const faltantes = requeridas.filter((v) => !process.env[v]);

    if (faltantes.length) {
        console.error(`❌ Faltan variables de entorno: ${faltantes.join(', ')}`);
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
        console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
    })

    iniciarJobs();
}

iniciar()