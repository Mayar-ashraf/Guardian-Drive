import express, { response } from "express"
import authRoutes from "./routes/auth.route.ts"
import tripsRoutes from "./routes/trips.route.ts"
import medicalInfoRoutes from "./routes/medicalInfo.route.ts"
import emergencyServiceRequestRoute from "./routes/emergencyServiceRequests.route.ts"
import * as authMiddleware from "./middleware/AuthMiddleware.ts"
import passwordRoutes from "./routes/password.route.ts";
import carsRoutes from "./routes/cars.route.ts";
import path from "path"
import usersRoutes from "./routes/users.route.ts";
import alertRoute from "./routes/alerts.route.ts";
import wearablebandsRoute from "./routes/wearableBands.route.ts";
import towingRequestRoute from "./routes/towingRequests.route.ts";
import reportsRoute from "./routes/reports.route.ts"
import firstAidGuidanceRoutes from "./routes/firstAidGuidance.route.ts"
import adminRoute from "./routes/admin.route.ts"
import { Role } from "../generated/prisma/enums";
import cors from "cors"

const app = express();
app.use(express.json())
app.use(cors({ origin: '*' })); // Allow everything for now
app.use("/api/auth", authRoutes)
app.use("/api/password", passwordRoutes)
app.use("/api/users", usersRoutes)
app.use("/api/medical-information", medicalInfoRoutes)
app.use("/api/alerts", alertRoute);
app.use("/api/first-aid-guidance", firstAidGuidanceRoutes)
app.use("/api/trips", authMiddleware.authenticate, tripsRoutes)
app.use("/api/password", passwordRoutes)
app.use("/api/users", usersRoutes)
app.use("/api/cars", authMiddleware.authenticate, carsRoutes)

app.use("/api/emergency-service-request", authMiddleware.authenticate, emergencyServiceRequestRoute)
app.use("/api/towing-requests", authMiddleware.authenticate, towingRequestRoute);
app.use("/api/wearablebands", authMiddleware.authenticate, wearablebandsRoute);
app.use("/api/reports", authMiddleware.authenticate, authMiddleware.authorize(Role.ADMIN), reportsRoute)

app.use("/api/admin", adminRoute)

app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.urlencoded({ extended: true }));
app.listen(3000, () => {
    console.log("server is running on http://localhost:3000")
})