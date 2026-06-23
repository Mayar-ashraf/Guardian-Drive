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
import { createServer } from "http"; // 🌟 1. Import Node's native HTTP server creator
import { Server } from "socket.io";  // 🌟 2. Import Socket.io
import cors from "cors"

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Matches your Express cors config
        methods: ["GET", "POST"]
    }
});

// 🌟 4. Share the 'io' instance globally with Express controllers
app.set("io", io);

// 🌟 5. Define your real-time WebSocket connection handling logic
io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Listen for the Fleet Manager authentication/room assignment event
    socket.on("join_manager_room", (fleetManagerId) => {
        const roomName = `manager_${fleetManagerId}`;
        socket.join(roomName);
        console.log(`👤 Fleet Manager ${fleetManagerId} joined room: ${roomName}`);
    });

    socket.on("disconnect", () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
    });
});

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
app.use("/api/cars", carsRoutes)

app.use("/api/emergency-service-request", authMiddleware.authenticate, emergencyServiceRequestRoute)
app.use("/api/towing-requests", authMiddleware.authenticate, towingRequestRoute);
app.use("/api/wearablebands", authMiddleware.authenticate, wearablebandsRoute);
app.use("/api/reports", authMiddleware.authenticate, authMiddleware.authorize(Role.ADMIN), reportsRoute)

app.use("/api/admin", adminRoute)

app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.urlencoded({ extended: true }));
// app.listen(3000, () => {
//     console.log("server is running on http://localhost:3000")
// })
server.listen(3000, () => {
    console.log("server and socket is running on http://localhost:3000")
})
