import express from "express"
import { signup, login } from "../controllers/authController"
import { SignupSchema } from "../schema/users"
import { validate } from "../validators/validate"

const router = express.Router()

router.post("/signup", validate(SignupSchema), signup)

router.post('/login', login)



export default router