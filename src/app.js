import express from 'express'
import cors from 'cors'
import routes from "./routes/index.js"

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/api", routes);

app.set('trust proxy', 1);

const origenes = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL]
    : ['http://localhost:4200'];

app.use(cors({ origin: origenes, credentials: false }));

app.get("/api/health", (req, res) => {
    res.json({ ok: true, servicio: "cine-alfa-api" });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
    console.error(err);
    const respuesta = {
        error: err.message || "Error interno del servidor",
    };
    if (err.detalles) {
        respuesta.detalles = err.detalles;
    }
    res.status(err.status || 500).json(respuesta);
});

export default app;