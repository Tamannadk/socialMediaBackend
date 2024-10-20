import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Follow } from "../models/follow.models.js";
import mongoose from "mongoose";

const followUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "UserId is missing!!");
  }
  const followedUser = await Follow.aggregate([
    {
      $match: {
        $and: [
          { follower: new mongoose.Types.ObjectId(req.user._id) },
          {
            following: new mongoose.Types.ObjectId(userId),
          },
        ],
      },
    },
  ]);

  if (followedUser.length > 0) {
    return res
      .status(409)
      .json(
        new ApiResponse(409, { isFollowing: true }, "User is already followed.")
      );
  }

  const followingUser = await Follow.create({
    follower: req.user._id,
    following: userId,
  });
  if (!followingUser) {
    throw new ApiError(400, "Error while following user!!");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isFollowing: true },
        "User followed successfully!!"
      )
    );
});

const unfollowUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(404, "userId is missing!!");
  }
  const followedUser = await Follow.aggregate([
    {
      $match: {
        $and: [
            {follower: new mongoose.Types.ObjectId(req.user._id)},
          {following: new mongoose.Types.ObjectId(userId)},
        ]
      },
    },
  ]);
  if (followedUser.length == 0) {
    return res
      .status(409)
      .json(
        new ApiResponse(409, { isFollowing: true }, "User is not following.")
      );
  }
  const deleteFollow = await Follow.deleteOne({
    follower: req.user._id,
    following: userId,
  });
  if (deleteFollow.deletedCount === 0) {
    throw new ApiError(
      500,
      "Error occurred while trying to unfollow the user."
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isFollowing: false },
        "User unfollowed successfully!!"
      )
    );
});

const checkFollowing = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "User id is missing!!");
  }
  const followedUser = await Follow.aggregate([
    {
      $match: {
        $and: [
          { follower: new mongoose.Types.ObjectId(req.user._id) },
          {
            following: new mongoose.Types.ObjectId(userId),
          },
        ],
      },
    },
  ]);
  if (followedUser.length > 0) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, { isFollowing: true }, "User is already followed.")
      );
  } else {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { isFollowing: false },
          "User is already followed."
        )
      );
  }
});
const getFollowers = asyncHandler(async (req, res) => {
  const { userId } = req.params; // Assuming you're passing the userId as a parameter

  // Fetch followers
  const followers = await Follow.aggregate([
    {
      $match: {
        following: new mongoose.Types.ObjectId(userId), // This identifies all the users who are following the given userId.
      },
    },
    {
      $lookup: {
        from: "users", // Lookup from the users collection
        localField: "follower", // Field in Follow schema representing the follower
        foreignField: "_id", // Match the user's ID
        as: "followerDetails", // Store the result as followerDetails array
      },
    },
    {
      $unwind: "$followerDetails", // Unwind the followerDetails array to flatten it
    },
    {
      $project: {
        "followerDetails.username": 1, // Select only necessary fields
        "followerDetails.fullName": 1,
        "followerDetails.avatar": 1,
        "followerDetails.createdAt": 1,
        "followerDetails._id":1,
      },
    },
    {
      $group: {
        _id: null, // Grouping all followers for count
        followersList: { $push: "$followerDetails" }, // Push all follower details into an array
        followersCount: { $sum: 1 }, // Calculate total number of followers
      },
    },
  ]);

  // Check if no followers found
  if (!followers.length) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No followers found!"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, followers[0], "All followers fetched!!"));
});

const getFollowing = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const followings = await Follow.aggregate([
    {
      $match: {
        follower: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "following",
        foreignField: "_id",
        as: "followingDetails",
      },
    },
    {
      $unwind: "$followingDetails",
    },
    {
      $project: {
        "followingDetails.username": 1,
        "followingDetails.fullName": 1,
        "followingDetails.avatar": 1,
        "followingDetails.createdAt": 1,
        "followingDetails._id":1
      },
    },
    {
      $group: {
        _id: null, // Grouping all followers for count
        followingList: { $push: "$followingDetails" }, // Push all follower details into an array
        followingCount: { $sum: 1 }, // Calculate total number of followers
      },
    },
  ]);
  if(!followings.length)
  {
    return res.status(200).json(new ApiResponse(200,[],"You are not following anyone!"))
  }
  return res.status(200).json(new ApiResponse(200,followings[0],"All followed users fetced!!"))
});

export { followUser, unfollowUser, getFollowers, getFollowing ,checkFollowing};
