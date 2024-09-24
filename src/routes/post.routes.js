import { Router } from "express";

import { createPost, deletePost, getAllPosts, getPostById, getPostsByUser, updatePost } from "../controllers/post.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();

router.route("/create-post").post(
    verifyJWT,
    upload.array("postImage",10)
    ,createPost
)
router.route("/update-post/:postId").post(verifyJWT,upload.fields([
    { name: 'newImages'},       // Allow up to 10 new images
    { name: 'imagePathsToRemove'} // Allow up to 10 image paths to remove
]),updatePost)

router.route("/delete-post/:postId").delete(verifyJWT,deletePost)
router.route("/get-allposts/:userId").get(getPostsByUser)
router.route("/get-posts").get(verifyJWT,getAllPosts)
router.route("/get-post-by-id/:postId").get(getPostById)
export default router