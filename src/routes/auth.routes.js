import { Router } from "express"
import * as authController from "../controllers/auth.controller.js"
import { limiteLogin, limiteRegistro } from "../middlewares/ratelimit.js"
import { validarBody } from "../middlewares/validar.js"
import { loginSchema, registroSchema } from "../validators/auth.validator.js"
import { requiereAuth } from "../middlewares/auth.js"

const router = Router()

router.post("/registro", limiteRegistro, validarBody(registroSchema), authController.postRegistro)
router.post("/login", limiteLogin, validarBody(loginSchema), authController.postLogin)
router.get("/yo", requiereAuth, authController.getYo)

export default router