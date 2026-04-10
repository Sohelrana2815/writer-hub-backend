import { Router } from "express";
// import auth from "../../middlewares/auth.js";
import { CategoryControllers } from "./category.controller.js";
import auth from "../../middlewares/auth.js";

const router = Router();
router.post("/", auth("ADMIN"), CategoryControllers.createCategory);
router.get("/", auth("ADMIN"), CategoryControllers.getAllCategories);
export const CategoryRoutes = router;
