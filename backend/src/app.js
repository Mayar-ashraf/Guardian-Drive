import express from "express"
import authRoute from "./routes/authRoute.js"
import tripsRoute from "./routes/tripsRoute.js"
import * as authMiddleware from "./middlware/AuthMiddleware.js"
const app = express();
app.use(express.json())
app.use("/api/auth", authRoute)
app.use("/api/trips", authMiddleware.authenticate, authMiddleware.authorize("FLEET_MANAGER"), tripsRoute)
app.listen(3000, () => {
    console.log("server is running on http://localhost:3000")
})