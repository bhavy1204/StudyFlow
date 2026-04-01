import {Router} from "express"
import { healthCheck } from "../cntrollers/HealthCheck.controller.js"

const router = Router()

router.route("/").get(healthCheck)

export default router;