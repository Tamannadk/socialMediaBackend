import { Router } from "express";

import { createPost } from "../controllers/post.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();

router.route("/create-post").post(
    verifyJWT,
    upload.single("postImage")
    ,createPost
)

export default router