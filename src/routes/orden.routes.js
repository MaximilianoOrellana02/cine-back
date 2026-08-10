import { Router } from "express";
import * as ordenController from "../controllers/orden.controller.js"
import { validarBody, validarParams } from "../middlewares/validar.js";
import { crearOrdenSchema, ordenIdParamSchema } from "../validators/orden.validator.js";
import { authOpcional, requiereAuth, requiereRol } from "../middlewares/auth.js";

const router = Router()

router.post("/", authOpcional, validarBody(crearOrdenSchema), ordenController.postOrden)
router.post(
    "/:id/confirmar-pago",
    requiereAuth,
    requiereRol("admin"),
    validarParams(ordenIdParamSchema),
    ordenController.postConfirmarPago
);
router.get("/:id", validarParams(ordenIdParamSchema), ordenController.getOrden)

export default router