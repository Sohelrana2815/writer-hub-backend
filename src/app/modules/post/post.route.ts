import { Router } from "express";
import { PostControllers } from "./post.controller.js";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { PostValidation } from "./post.validation.js";

const router = Router();
router.post(
  "/",
  validateRequest(PostValidation.createPostZodSchema),
  auth("ADMIN"),
  PostControllers.createPost,
);

router.get("/",  PostControllers.getAllPosts);

router.get("/:slug", PostControllers.getPostBySlug);

export const PostRoutes = router;
