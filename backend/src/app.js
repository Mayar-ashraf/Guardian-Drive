import express from "express"
import authRoutes from "./routes/auth.route.ts"
import tripsRoutes from "./routes/trips.route.ts"
import medicalInfoRoutes from "./routes/medicalInfo.route.ts"
import emergencyServiceRequestRoutes from "./routes/emergencyServiceRequests.route.ts"
import * as authMiddleware from "./middleware/AuthMiddleware.ts"
import passwordRoutes from "./routes/password.route.ts";
import carsRoutes from "./routes/cars.route.ts";
import path from "path"
import usersRoutes from "./routes/users.route.ts";
import alertRoutes from "./routes/alerts.route.ts";
import wearablebandsRoutes from "./routes/wearableBands.route.ts";
import towingRequestRoutes from "./routes/towingRequests.route.ts";
import reportsRoutes from "./routes/reports.route.ts";
import firstAidGuidanceRoutes from "./routes/firstAidGuidance.route.ts"

const app = express();
app.use(express.json())
app.use("/api/auth", authRoutes)
app.use("/api/password", passwordRoutes)
app.use("/api/users", usersRoutes)
app.use("/api/medical-information", medicalInfoRoutes)
app.use("/api/alerts", alertRoutes);
app.use("/first-aid-guidance", firstAidGuidanceRoutes)
app.use("/api/trips", authMiddleware.authenticate, tripsRoutes)
app.use("/api/password", passwordRoutes)
app.use("/api/users", usersRoutes)
app.use("/api/cars", authMiddleware.authenticate, carsRoutes)

app.use("/api/emergency-service-request", authMiddleware.authenticate, emergencyServiceRequestRoutes)
app.use("/api/towing-requests", authMiddleware.authenticate, towingRequestRoutes);
app.use("/api/wearablebands", authMiddleware.authenticate, wearablebandsRoutes);
app.use("/api/reports", authMiddleware.authenticate, reportsRoutes)
app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.urlencoded({ extended: true }));

app.listen(3000, () => {
    console.log("server is running on http://localhost:3000")
})