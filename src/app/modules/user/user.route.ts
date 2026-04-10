import { Router } from "express";
import { UserControllers } from "./user.controller.js";
import auth from "../../middlewares/auth.js";

const router = Router();

router.get("/", auth("ADMIN"), UserControllers.getAllUsers); // All Users Admin Route

export const UserRoutes = router;
