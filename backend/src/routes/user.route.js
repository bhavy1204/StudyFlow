import { Router } from "express";
import { googleLogin, logout, refreshToken, getCurrentUser, deleteAccount, getUserStats } from "../cntrollers/user.controller.js"

const router = Router();

router.route("/googleLogin").post(googleLogin)
router.route("/logout").post(logout)
router.route("/refresh-token").post(refreshToken)
router.route("/get").get(getCurrentUser)
router.route("/delete").delete(deleteAccount)
router.route("/stats").get(getUserStats)

export default router