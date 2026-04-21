import express from "express"
import authRoute from "./routes/authRoute.js"
import tripsRoute from "./routes/tripsRoute.js"
import * as authMiddleware from "./middlware/AuthMiddleware.js"
import passwordRoutes from "./routes/password.routes.ts";
import path from "path"
import usersRoutes from "./routes/users.routes.ts";
const app = express();
app.use(express.json())
app.use("/api/auth", authRoute)
app.use("/api/trips", authMiddleware.authenticate, authMiddleware.authorize("FLEET_MANAGER"), tripsRoute)
app.use("/api/password", passwordRoutes)
app.use("/api/users", usersRoutes)
app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.urlencoded({ extended: true }));
app.listen(3000, () => {
    console.log("server is running on http://localhost:3000")
})