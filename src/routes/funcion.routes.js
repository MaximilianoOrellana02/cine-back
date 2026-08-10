import { Router } from "express";
import * as funcionController from "../controllers/funcion.controller.js"
import { validarQuery } from "../middlewares/validar.js";
import { carteleraQuerySchema } from "../validators/funcion.validator.js";
import butacaRoutes from "./butaca.routes.js"

const router = Router()

router.get(
    "/cartelera",
    validarQuery(carteleraQuerySchema),
    funcionController.getCartelera
);

router.use("/:id/butacas", butacaRoutes)

export default router