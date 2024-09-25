import { Router } from "express";
import { togglePostLike,toggleCommentLike,getPostLikes, getUserLikedPosts } from "../controllers/like.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router=Router();

router.route("/toggle-post-like/:postId").post(verifyJWT,togglePostLike);
router.route("/toggle-comment-like/:commentId").post(verifyJWT,toggleCommentLike)
router.route("/get-post-likes/:postId").get(getPostLikes)
router.route("/get-all-posts").get(verifyJWT,getUserLikedPosts)

export default router