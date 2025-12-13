import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import postRouter from "./routes/postRoutes.js";
import path from "path";

const app = express();
const port = process.env.PORT || 4000
connectDB();

const allowedOrigins = ['http://localhost:5173'];

app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowedOrigins, credentials: true}))

// API endpoints
app.get('/', (req, res)=> res.send("ⵜⴰⵡⵡⵓⵔⵉ ⵜⴳⴰⴷⴷⴰ ⵜⴼⵓⵍⴽⵉ ⵜⵖⵓⴷⴰ ⵜⵃⵍⴰ ⵜⵊⵊⴰ ⵜⴼⵍⵓⵊⵊⴰ"))
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/post', postRouter)
app.use('/uploads', (req, res, next) => {
    // Empêche les navigateurs de "deviner" le type de fichier (sniffing)
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', 'attachment'); 
    next();
}, express.static('uploads'));

app.listen(port, ()=> console.log(`Server started on PORT: ${port}`));
