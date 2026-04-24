import { Router } from "express";
// import auth from "../../middlewares/auth.js";
import { CategoryControllers } from "./category.controller.js";
import auth from "../../middlewares/auth.js";
import { Role } from "@prisma/client";

const router = Router();
router.post(
  "/",
  auth(Role.ADMIN, Role.AUTHOR),
  CategoryControllers.createCategory,
);

router.get("/", auth("ADMIN"), CategoryControllers.getAllCategories);
export const CategoryRoutes = router;
