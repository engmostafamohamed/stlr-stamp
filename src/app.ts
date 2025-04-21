import express from "express";
import dotenv from "dotenv";
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import cors from "cors";
import connectDB from "./config/database";
import routes from "./routes";
import i18nMiddleware from "./middleware/i18n";
import { setupSwagger } from "./config/swagger";
import passport from "passport";
import session from "express-session";

// import "./config/passport"; // 👈 Register strategies globally
dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === "production";
// app.use(session({ secret: "keyboard cat", resave: false, saveUninitialized: false }));
// app.use(passport.initialize());
// app.use(passport.session());

// Middlewares
app.use(cors())
app.use(helmet())
app.use(compression())
if (!isProduction) {
    app.use(morgan("dev"));
}
  
app.use(express.json())

// Use the middleware for localization
app.use(i18nMiddleware);
app.get('/', (req, res) =>{res.send('Hello from Express + Vercel!')});

// Routes
app.use("/api", routes);

// Setup Swagger documentation
setupSwagger(app);

export default app;