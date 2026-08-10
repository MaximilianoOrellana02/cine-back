import { Router } from "express";
import * as butacaController from "../controllers/butaca.controller.js";
import { validarParams, validarBody } from "../middlewares/validar.js";
import { funcionIdParamSchema, bloquearButacasSchema } from "../validators/butaca.validator.js";

const router = Router({ mergeParams: true })

router.get(
    "/",
    validarParams(funcionIdParamSchema),
    butacaController.getMapa
)

router.post(
    "/bloquear",
    validarParams(funcionIdParamSchema),
    validarBody(bloquearButacasSchema),
    butacaController.postBloquear
);

router.delete(
    "/bloquear",
    validarParams(funcionIdParamSchema),
    validarBody(bloquearButacasSchema),
    butacaController.deleteBloquear
);

export default router