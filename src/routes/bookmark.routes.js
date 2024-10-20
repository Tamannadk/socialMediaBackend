import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {bookmarkPost, getAllBookmarkedPosts} from "../controllers/bookmark.controller.js"
const router=Router();

router.route("/bookmark/:postId").post(verifyJWT,bookmarkPost)
router.route("/allBookmarkedPosts").get(verifyJWT,getAllBookmarkedPosts)
export default router;