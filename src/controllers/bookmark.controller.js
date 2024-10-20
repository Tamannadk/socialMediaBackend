import mongoose from "mongoose";
import { Bookmark } from "../models/bookmark.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const bookmarkPost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
  
    if (!postId) {
      throw new ApiError(400, "PostId is required!!");
    }
  
    // Check if the post is already bookmarked by this user
    const bookmarkedPost = await Bookmark.findOne({
      postId: new mongoose.Types.ObjectId(postId),
      userId: new mongoose.Types.ObjectId(req.user._id),
    });
  
    // If not bookmarked, create a bookmark
    if (!bookmarkedPost) {
      const bookmarkingPost = await Bookmark.create({
        userId: req.user._id,
        postId: postId,
        createdAt: Date.now(),
      });
  
      if (!bookmarkingPost) {
        throw new ApiError(400, "Error while bookmarking the post!!");
      }
  
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { isBookmarked: true },
            "Post bookmarked successfully!!"
          )
        );
    } else {
      // If already bookmarked, remove the bookmark
      const removeBookmarkedPost = await Bookmark.findByIdAndDelete(bookmarkedPost._id);
  
      if (!removeBookmarkedPost) {
        throw new ApiError(400, "Error while removing bookmarked post!!");
      }
  
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { isBookmarked: false },
            "Post unBookmarked successfully!!"
          )
        );
    }
  });
  
const getAllBookmarkedPosts = async (req, res) => {
  const allBookmarkedPosts = await Bookmark.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "posts",
        localField: "postId",
        foreignField: "_id",
        as: "postDetails",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "author",
              foreignField: "_id",
              as: "userDetails",
            },
          },
          {
            $unwind: "$userDetails", // Unwind if you want to flatten userDetails array
          },
        ],
      },
    },
    {
      $unwind: "$postDetails",
    },
    {
      $project: {
        "postDetails._id":1,
        "postDetails.postImage": 1,
        "postDetails.description": 1,
        "postDetails.likes": 1,
        "postDetails.comments": 1,
        "postDetails.author": 1,
        "postDetails.userDetails.username": 1,
        "postDetails.userDetails.avatar": 1,
        "postDetails.userDetails.fullName": 1,
        isBookmarked: { $literal: true }
        
      },
    },
  ]);
  if (!allBookmarkedPosts.length) {
    return res
    .status(200)
    .json(
      new ApiResponse(200, [], "No bookmarked posts yet!!")
    );
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, allBookmarkedPosts, "All bookmarked posts fetched!!")
    );
};

export { bookmarkPost, getAllBookmarkedPosts };
