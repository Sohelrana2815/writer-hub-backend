import express, { Application, Request, Response } from "express";
import cors from "cors";
import { router } from "./app/routes/index.js";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler.js";
import notFound from "./app/middlewares/notFound.js";
import cookieParser from "cookie-parser";

const app: Application = express();
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
  res.send("I can do this all day💪 My Blog website");
});

app.use(globalErrorHandler);

app.use(notFound);

export default app;
