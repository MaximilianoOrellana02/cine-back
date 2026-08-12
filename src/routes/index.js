import { Router } from "express";
import funcionRoutes from "./funcion.routes.js"
import ordenRoutes from "./orden.routes.js"
import peliculaRoutes from "./pelicula.routes.js"
import combosRoutes from "./combos.routes.js"
import authRoutes from "./auth.routes.js"
import ticketRoutes from "./ticket.routes.js"
import pagoRoutes from "./pago.routes.js"
import adminRoutes from "./admin.routes.js"

const router = Router()

router.use("/funciones", funcionRoutes)
router.use("/ordenes", ordenRoutes)
router.use("/peliculas", peliculaRoutes)
router.use("/combos", combosRoutes)
router.use("/auth", authRoutes)
router.use("/tickets", ticketRoutes) //Borrar en produccion
router.use("/pagos", pagoRoutes)
router.use("/admin", adminRoutes)

export default router