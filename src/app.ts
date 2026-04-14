import express, { Application, Request, Response } from "express";
import cors from "cors";
import { router } from "./app/routes/index.js";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler.js";
import notFound from "./app/middlewares/notFound.js";
import cookieParser from "cookie-parser";
import passport from "passport";
import expressSession from "express-session";
import "./app/config/passport.js";

const app: Application = express();
app.use(
  expressSession({
    secret: process.env.EXPRESS_SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.send({
    message: "Code Orbit API is running smoothly!!!",
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.json("I can do this all day💪 My Blog website");
});

app.use(globalErrorHandler);

app.use(notFound);

export default app;


// app.ts start
//    ↓
// import passport config file
//    ↓
// passport.use() runs
//    ↓
// routes use passport.authenticate()
//    ↓
// everything works ✅