import express from "express"
import authRoute from "./routes/authRoute.js"
import passwordRoutes from "./routes/password.routes.ts";
import path from "path"
import usersRoutes from "./routes/users.routes.ts";
const app = express();
app.use(express.json())
app.use("/api/auth", authRoute)
app.use("/api/password",passwordRoutes)
app.use("/api/users",usersRoutes)
app.use(express.static(path.join(process.cwd(), "public")));
app.listen(3000, () => {
    console.log("server is running on http://localhost:3000")
})