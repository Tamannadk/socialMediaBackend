import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { followUser, getFollowers, getFollowing, unfollowUser,checkFollowing } from "../controllers/follow.controllers.js";

const router=Router();

router.route("/followUser/:userId").post(verifyJWT,followUser);
router.route("/unfollow/:userId").post(verifyJWT,unfollowUser);
router.route("/get-followers/:userId").get(getFollowers);
router.route("/get-following/:userId").get(verifyJWT,getFollowing)
router.route("/check-following/:userId").get(verifyJWT,checkFollowing)

export default router