import { Router } from "express";

import { createPost, deletePost, updatePost } from "../controllers/post.controllers.js";
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

export default router