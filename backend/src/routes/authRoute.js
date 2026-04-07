import express from "express"
import { signup , login} from "../controllers/authController.ts"
import { SignupSchema } from "../schema/users.ts"
import { validate } from "../validators/validate.ts"

const router = express.Router()

router.post("/signup", validate(SignupSchema), signup)

router.post('/login', login)



export default router