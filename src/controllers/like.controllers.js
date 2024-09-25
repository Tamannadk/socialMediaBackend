import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Like } from "../models/like.models.js";

const togglePostLike = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  if (!postId) {
    throw new ApiError(400, "PostId is missing!!");
  }
  const likedPost = await Like.aggregate([
    {
      $match: {
        $and: [
          { likedBy: new mongoose.Types.ObjectId(req.user._id) },
          { post: new mongoose.Types.ObjectId(postId) },
        ],
      },
    },
  ]);
  if (likedPost.length == 0) {
    const likingPost = await Like.create({
      likedBy: req.user._id,
      post: postId,
    });
    if (!likingPost) {
      throw new ApiError(400, "Error while liking post!");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, { isLiked: true }, "Post liked successfully!!")
      );
  } else {
    const unlikedPost = await Like.findByIdAndDelete(likedPost[0]._id);
    if (!unlikedPost) {
      throw new ApiError(400, "Error while unliking post!!");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, { isLiked: false }, "Post unliked successfully!!")
      );
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "comment id is missing!!");
  }
  const likedComment = await Like.aggregate([
    {
      $match: {
        $and: [
          { likedBy: new mongoose.Types.ObjectId(req.user._id) },
          { comment: new mongoose.Types.ObjectId(commentId) },
        ],
      },
    },
  ]);
  if (likedComment.length == 0) {
    const likingComment = await Like.create({
      likedBy: req.user._id,
      comment: commentId,
    });
    if (!likingComment) {
      throw new ApiError(400, "Error while liking comment!!");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, { isLiked: true }, "Comment liked successfully!!")
      );
  } else {
    await Like.findByIdAndDelete(likedComment[0]._id);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { isLiked: false },
          "Comment unliked successfully!!"
        )
      );
  }
});

const getPostLikes = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  if (!postId) {
    throw new ApiError(400, "Post id is missing!!");
  }
  const usersLikedPost = await Like.aggregate([
    {
      $match: {
        post: new mongoose.Types.ObjectId(postId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "likedBy",
        foreignField: "_id",
        as: "usersWhoLiked",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
              _id: 1,
              createAt: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likeCount: { $size: "$usersWhoLiked" }, // Adding like count outside the lookup
        usersWhoLiked: { $first: "$usersWhoLiked" },
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        usersLikedPost,
        "users who liked this post fetched successfully!!"
      )
    );
});

const getUserLikedPosts=asyncHandler(async(req,res)=>{
    const posts=await Like.aggregate(
        [
            {
                $match:{
                    likedBy:new mongoose.Types.ObjectId(req.user._id),
                    post: { $exists: true }
                }
            },
            {
                $lookup:{
                    from:"posts",
                    localField:"post",
                    foreignField:"_id",
                    as:"likedPosts",
                    pipeline:[
                        {
                            $lookup:{
                                from:"users",
                                localField:"author",
                                foreignField:"_id",
                                as:"author",
                                pipeline:[
                                    {
                                        $project:{
                                            fullName:1,
                                            username:1,
                                            avatar:1,
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        ]
    )
    console.log(posts)
    if(posts.length==0)
    {
        res.status(200).json(new ApiResponse(200,posts,"You haven't liked any post yet!"))
    }
    else{
        res.status(200).json(new ApiResponse(200,posts,"All liked posts fetched!!"))
    }
})


export { togglePostLike, toggleCommentLike, getPostLikes,getUserLikedPosts };
