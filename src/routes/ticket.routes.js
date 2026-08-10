import { Router } from "express"
import * as ticketController from "../controllers/ticket.controller.js"
import { requiereAuth, requiereRol } from "../middlewares/auth.js";
import { validarBody, validarParams } from "../middlewares/validar.js";
import { codigoParamSchema, funcionIdParamSchema, validarTicketSchema } from "../validators/ticket.validator.js";

const router = Router();

router.post(
    "/validar",
    requiereAuth,
    requiereRol("portero", "admin"),
    validarBody(validarTicketSchema),
    ticketController.postValidar
);

router.get(
    "/funcion/:id",
    requiereAuth,
    requiereRol("portero", "admin"),
    validarParams(funcionIdParamSchema),
    ticketController.getDeFuncion
)

router.get("/:codigo", validarParams(codigoParamSchema), ticketController.getPorCodigo)

export default router