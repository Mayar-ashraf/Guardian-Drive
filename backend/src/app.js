import express from "express"
import authRoute from "./routes/authRoute.js"
const app = express();
app.use(express.json())
app.use("/api/auth", authRoute)
app.listen(3000, () => {
    console.log("server is running on http://localhost:3000")
})