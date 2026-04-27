import express from "express"
import authRoute from "./routes/authRoute.js"
import passwordRoutes from "./routes/password.routes.ts";
import carsRoute from "./routes/cars.route.ts";
import path from "path"
import usersRoutes from "./routes/users.routes.ts";
import alertRoute from "./routes/alert.route.ts";
import firstAidRoute from "./routes/firstAid.route.ts";

const app = express();
app.use(express.json())
app.use("/api/auth", authRoute)
app.use("/api/medical-information", medicalInfoRoute)
app.use("/api/alerts", alertRoute);
app.use("/api/trips", authMiddleware.authenticate, tripsRoute)
app.use("/api/password", passwordRoutes)
app.use("/api/cars",carsRoute)
app.use("/api/users", firstAid)
app.use("/api/users",usersRoutes)
app.use("/api/first-aid-guidance", firstAidRoute)
app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.listen(3000, () => {
    console.log("server is running on http://localhost:3000")
})