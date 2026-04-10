import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route.js";
import { UserRoutes } from "../modules/user/user.route.js";
import { PostRoutes } from "../modules/post/post.route.js";
import { CategoryRoutes } from "../modules/category/category.route.js";

export const router = Router();

const moduleRoutes = [
  { path: "/auth", route: AuthRoutes },
  { path: "/users", route: UserRoutes },
  { path: "/posts", route: PostRoutes },
  { path: "/categories", route: CategoryRoutes },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
