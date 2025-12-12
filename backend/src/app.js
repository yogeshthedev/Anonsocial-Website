import express from "express";
import userAuth from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import postRoutes from "./routes/post.routes.js";
import cookieParser from "cookie-parser";
import cors from 'cors'

const app = express();
app.use(cors({
    origin:"http://localhost:5173",
     credentials: true,   
}))
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth/", userAuth);
app.use("/api/auth/", profileRoutes);
app.use("/api/auth/", postRoutes);

export default app;
