import { Router } from "express"
import * as comboController from "../controllers/combo.controller.js"

const router = Router()

router.get("/", comboController.getCombos)

export default router;