import { Router } from "express";
import * as peliculaController from "../controllers/pelicula.controller.js";
import { validarParams, validarQuery } from "../middlewares/validar.js";
import { detalleQuerySchema, peliculaIdParamSchema } from "../validators/pelicula.validator.js";

const router = Router()

router.get("/", peliculaController.getCartelera)

router.get(
    "/:id",
    validarParams(peliculaIdParamSchema),
    validarQuery(detalleQuerySchema),
    peliculaController.getDetalle
)

export default router