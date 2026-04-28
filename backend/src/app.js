import express from "express"
import authRoute from "./routes/auth.route.ts"
import tripsRoute from "./routes/trips.route.ts"
import medicalInfoRoute from "./routes/medicalInfo.route.ts"
import * as authMiddleware from "./middleware/AuthMiddleware.ts"
import passwordRoutes from "./routes/password.route.ts";
import carsRoute from "./routes/cars.route.ts";
import path from "path"
import usersRoutes from "./routes/users.route.ts";
import alertRoute from "./routes/alert.route.ts";
import wearablebandsRoute from "./routes/wearableBands.route.ts";

const app = express();
app.use(express.json())
app.use("/api/auth", authRoute)
app.use("/api/password",passwordRoutes)
app.use("/api/users",usersRoutes)
app.use("/api/cars",carsRoute)
app.use("/api/medical-information", medicalInfoRoute)
app.use("/api/alerts", alertRoute);
app.use("/api/trips", authMiddleware.authenticate, tripsRoute)
app.use("/api/password", passwordRoutes)
app.use("/api/users", usersRoutes)
app.use("/api/wearablebands", authMiddleware.authenticate, wearablebandsRoute);
app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoute);
app.listen(3000, () => {
    console.log("server is running on http://localhost:3000")
})