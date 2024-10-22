import { mongoose } from "mongoose";
import { Notification } from "../models/notification.models";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

const createNotification = asyncHandler(async (req, res) => {
  const { typeOfNotification, fromUserId, postId, commentId, likeId } =
    req.body;
  const userId = req.user._id;
  const newNotification = await Notification.create({
    user: userId,
    typeOfNotification,
    fromUser: fromUserId,
    Post: postId,
    Comment: commentId,
    Like: likeId,
  });
  if (!newNotification) {
    throw new ApiError(400, "Error while creating notification!!");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, newNotification, "Notification sent successfully!!")
    );
});

const getAllNotifications=asyncHandler(async(req,res)=>{
    const userId=req.user._id;
    const allNotifiations=await Notification.aggregate(
        [
            {
                $match:{
                    user:new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup:{
                    from:"users",
                    localField:"user",
                    foreignField:"_id",
                    as:"userDetails"
                }
            }
        ]
    )

})

export {createNotification}