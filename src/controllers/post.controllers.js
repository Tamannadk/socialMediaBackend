import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary,uploadMultipleFiles, deleteFile} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { Post } from "../models/post.models.js";
import { Like } from "../models/like.models.js";
import { Comment } from "../models/comment.models.js";


const createPost=asyncHandler(async(req,res)=>{
    const {description}=req.body
    if(description.trim()=="")
    {
        throw new ApiError(400,"Description is required!!")
    }
    const postImage=req.files;
    console.log("postImage",postImage)
    // const updatedPostImage=await uploadOnCloudinary(postImage);
    let updatedPostImagePaths=[];
    for(let i=0;i<postImage.length;i++)
    {
        let paths=postImage[0].path;
        updatedPostImagePaths.push(paths)
    }
    console.log("updatedPostImagePaths",updatedPostImagePaths)
    const uploadedPosts=await uploadMultipleFiles(updatedPostImagePaths)
    const post=await Post.create(
        {
            description,
            author:req.user._id,
            postImage:uploadedPosts.map(file=>{
                return file.secure_url
            })
        }
    )
    if(!post)
    {
        throw new ApiError(404,"Error while creating post!!");
    }
    return res.status(200).json(new ApiResponse(200,post,"Post created successfully!"))
})

const updatePost=asyncHandler(async(req,res)=>{
    const {postId}=req.params;
    const {description}=req.body;
    const imagePathsToRemove=req.files['imagePathsToRemove']
    // console.log("imagePathsToRemove",imagePathsToRemove)
    const newImages=req.files['newImages'];
    const userId=req.user._id;
    const post=await Post.findById(postId)
    // console.log("Post details",post)
    if(!post)
    {
        throw new ApiError(400,"Post not found!!")
    }
    if(post.author.toString()!=userId.toString())
    {
        throw new ApiError(404,"Unauthorized to edit this post!")
    }
    // Handle image removal
    if(imagePathsToRemove && imagePathsToRemove.length>0)
    {
        await Promise.all(
            imagePathsToRemove.map(async(imagePath)=>await deleteFile(imagePath))
        )
        post.postImage=post.postImage.filter((path)=>!imagePathsToRemove.includes(path))
    }
    //handle addition of new images
    let updatedPostImagesPath=[]
    if(newImages && newImages.length>0)
    {
        updatedPostImagesPath=newImages.map((image)=>image.path)
    }
    const uploadedPosts=await uploadMultipleFiles(updatedPostImagesPath);
    // console.log("uploadedPosts",uploadedPosts)
    const updatedpost=await Post.findByIdAndUpdate(
        postId,
        {
            $set:{
                description:description,
                postImage:[...post.postImage,...uploadedPosts.map(file=>file?.secure_url)],
                author:req.user._id
            }
        },
        {
            new:true
        }
    )
    return res.status(200).json(new ApiResponse(200,updatedpost,"Fetched"))
})

const deletePost=asyncHandler(async(req,res)=>{
    const {postId}=req.params;
    if(!postId)
    {
        throw new ApiError(400,"Post Id is missing!!")
    }
    //find the post
    const post=await Post.findById(postId)
    if(!post)
    {
        throw new ApiError(400,"Invalid posts!!")
    }
    //delete files from cloudinary
    const images=post.postImage;
    const deletedImages=await deleteFile(images)
    if(!deletedImages)
    {
        throw new ApiError(400,"Error while deleting post images from cloudinary!")
    }
    //delete likes and comments
    await Like.deleteMany({post:postId})
    await Comment.deleteMany({post:postId})

    //delete postInfo from database
    const deletedPost=await Post.findByIdAndDelete(postId);
    if(!deletedPost)
        {
            throw new ApiError(400,"Error while deleting posts")
        } 
    return res.status(200).json(new ApiResponse(200,deletedPost,"Post deleted successfully!!"))
})

const getPostsByUser=asyncHandler(async(req,res)=>{
    const {userId}=req.params;

    const posts=await Post.aggregate(
        [
            {
                $match:{
                    author:new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup:{
                    from:"users",
                    localField:"author",
                    foreignField:"_id",
                    as:"author",
                    pipeline:[
                        {
                            $lookup:{
                                from:"follows",
                                localField:"_id",
                                foreignField:"following",
                                as:"followers"
                            }
                        },
                        {
                            $lookup:{
                                from:"follows",
                                localField:"_id",
                                foreignField:"follower",
                                as:"following"
                            }
                        },
                        {
                            $addFields:{
                                followersCount:{
                                    $size:"$followers"
                                },
                                followingCount:{
                                    $size:"$following"
                                },
                                isFollowing:{
                                    $cond: {
                                        if: { $in: [new mongoose.Types.ObjectId(userId), "$followers.follower"] },
                                        then: true,
                                        else: false,
                                      },
                                },
                            }
                        },
                        {
                            $project:{
                                fullName:1,
                                username:1,
                                avatar:1,
                                followersCount:1,
                                followingCount:1,
                                isFollowing:1
                            }
                        }
                    ]
                }
            },
            {
                $addFields:{
                    author: {
                        $first: "$author",
                    },
                }
            }
        ]
    )

    return res.status(200).json(new ApiResponse(200,posts,"all posts fetched successfully!!"))
})

const getAllPosts=asyncHandler(async(req,res)=>{
    const userId=req.user._id;
    const posts=await Post.aggregate(
        [
            {
                $match:{
                    author:new mongoose.Types.ObjectId(userId)
                }
            },
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
                                createdAt:1
                            }
                        }
                    ]
                }
            },
            {
                $addFields:{
                    author:{
                        $first:"$author"
                    }
                }
            }
        ]
    )
    return res.status(200).json(new ApiResponse(200,posts,"All posts fetched successfully!!"))
})

const getPostById=asyncHandler(async(req,res)=>{
    const {postId}=req.params;
    if(!postId)
    {
        throw new ApiError(400,"post id is missing!!")
    }
    // Validate if the postId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, "Invalid Post ID format!!");
    }
    const post=await Post.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(postId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"author",
                foreignField:"_id",
                as:"author",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            fullName:1,
                            avatar:1,
                            createdAt:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                author:{
                    $first:"$author"
                }
            }
        }
    ])
    if(!post)
    {
        throw new ApiError(400,"Post doesn't exist!!")
    }
    return res.status(200).json(new ApiResponse(200,post,"Post fetched successfully!"))
})

export {createPost,updatePost,deletePost,getPostsByUser,getAllPosts,getPostById}