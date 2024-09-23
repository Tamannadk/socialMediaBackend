import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { Post } from "../models/post.models.js";


const createPost=asyncHandler(async(req,res)=>{
    const {description}=req.body
    if(description.trim()=="")
    {
        throw new ApiError(400,"Description is required!!")
    }
    const postImage=req.files?.postFile[0].path;
    const updatedPostImage=await uploadOnCloudinary(postImage);
    const post=await Post.create(
        {
            description,
            author:req.user._id,
            postImage:updatedPostImage||""
        }
    )
    if(!post)
    {
        throw new ApiError(404,"Error while creating post!!");
    }
    return res.status(200).json(new ApiError(200,post,"Post created successfully!"))
})

const updatePost=asyncHandler(async(req,res)=>{
    const {postId}=req.params;

    
})

export {createPost}