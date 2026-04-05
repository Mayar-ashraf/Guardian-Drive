import express from "express"
import { signup } from "../controllers/authController.ts"
import { SignupSchema } from "../schema/users.ts"
import { validate } from "../validators/validate.ts"
const router = express.Router()
router.post("/signup", validate(SignupSchema), signup)

export default router