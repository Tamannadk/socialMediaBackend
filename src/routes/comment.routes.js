import { Router } from "express";
import { addComments, deleteComment, getCommentsByPost, updateComment } from "../controllers/comment.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router=Router();
router.route("/add-comment/:postId").post(verifyJWT,addComments)
router.route("/update-comment/:commentId").post(verifyJWT,updateComment)
router.route("/getCommentsByPost/:postId").get(getCommentsByPost)
// router.route("delete-comment/:commentId").delete(verifyJWT,deleteComment)

router.route("/delete/:commentId").delete(verifyJWT, (req, res, next) => {
    console.log("Route reached: DELETE /delete/:commentId");
    next();
}, deleteComment);

export default router