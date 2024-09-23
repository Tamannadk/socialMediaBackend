import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary,uploadMultipleFiles} from "../utils/cloudinary.js"
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
    return res.status(200).json(new ApiError(200,post,"Post created successfully!"))
})

const updatePost=asyncHandler(async(req,res)=>{
    const {postId}=req.params;

    
})

export {createPost}