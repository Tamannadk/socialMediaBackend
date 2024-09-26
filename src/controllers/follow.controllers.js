import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Follow } from "../models/follow.models.js";


const followUser=asyncHandler(async(req,res)=>{

})

const unfollowUser=asyncHandler(async(req,res)=>{

})

const getFollowers = asyncHandler(async (req, res) => {
    const { userId } = req.params; // Assuming you're passing the userId as a parameter

    // Fetch followers
    const followers = await Follow.aggregate([
        {
            $match: {
                following: new mongoose.Types.ObjectId(userId) // Match by the user who is being followed
            }
        },
        {
            $lookup: {
                from: "users", // Lookup from the users collection
                localField: "follower", // Field in Follow schema representing the follower
                foreignField: "_id", // Match the user's ID
                as: "followerDetails" // Store the result as followerDetails array
            }
        },
        {
            $unwind: "$followerDetails" // Unwind the followerDetails array to flatten it
        },
        {
            $project: {
                "followerDetails.username": 1, // Select only necessary fields
                "followerDetails.fullName": 1,
                "followerDetails.avatar": 1,
                "followerDetails.createdAt": 1
            }
        },
        {
            $group: {
                _id: null, // Grouping all followers for count
                followersList: { $push: "$followerDetails" }, // Push all follower details into an array
                followersCount: { $sum: 1 } // Calculate total number of followers
            }
        }
    ]);

    // Check if no followers found
    if (!followers.length) {
        return res.status(200).json(new ApiResponse(200, [], "No followers found!"));
    }

    return res.status(200).json(new ApiResponse(200, followers[0], "All followers fetched!!"));
});


const getFollowing=asyncHandler(async(req,res)=>{
    const {userId}=req.params;
    
})

export {followUser,unfollowUser,getFollowers,getFollowing}