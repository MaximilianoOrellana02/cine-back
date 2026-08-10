import { Router } from "express"
import * as pagoController from "./../controllers/pago.controller.js"
import { z } from "zod";
import { validarBody } from "../middlewares/validar.js";

const router = Router();

const preferenciaSchema = z.object({
    ordenId: z.string().trim().uuid("El id de orden debe ser un UUID válido")
})

router.post("/preferencia", validarBody(preferenciaSchema), pagoController.postPreferencia)
router.post("/webhook", pagoController.postWebhook)

export default router