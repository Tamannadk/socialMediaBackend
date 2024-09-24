import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.models.js";
import mongoose from "mongoose";
import { Like } from "../models/like.models.js";

const addComments=asyncHandler(async(req,res)=>{
    const {content}=req.body;
    const {postId}=req.params;
    if(!postId)
    {
        throw new ApiError(400,"Post Id is missing!!")
    }
    if(content.trim()=="")
    {
        throw new ApiError(400,"Some fields are missing!!")
    }
    const comment=await Comment.create(
        {
            content:content,
            post:postId,
            author:req.user._id
        }
    )
    if(!comment)
    {
        throw new ApiError(400,"Error while creating comment!!")
    }
    return res.status(200).json(new ApiResponse(200,comment,"Comment created successfully!!"))
})

const updateComment=asyncHandler(async(req,res)=>{
    const {commentId}=req.params
    const {contentToUpdate}=req.body;
    if(!commentId)
    {
        throw new ApiError(400,"Comment Id is missing!!")
    }
    if(!contentToUpdate)
    {
        throw new ApiError(400,"Content is missing!");
    }
    const updatedComment=await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content:contentToUpdate,
            }
        },
        {
            new:true
        }
    )
    if(!updatedComment)
    {
        throw new ApiError(400,"Error while updating comment!")
    }
    return res.status(200).json(new ApiResponse(200,updatedComment,"Comment updated successfully!!"))
})

const getCommentsByPost=asyncHandler(async(req,res)=>{
    const {postId}=req.params;
    if(!postId)
    {
        throw new ApiError(400,"post id is missing!!");
    }
    const comments=await Comment.aggregate(
        [
            {
                $match:{
                    post:new mongoose.Types.ObjectId(postId)
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
    return res.status(200).json(new ApiResponse(200,comments,"all comments for this post fetched successfully!!"))
})

const deleteComment=asyncHandler(async(req,res)=>{
    const {commentId}=req.params;
    if(!commentId)
    {
        throw new ApiError(400,"comment Id is missing!!")
    }
    //delete likes for this particular comment
    await Like.deleteMany({comment:commentId})
    //deleting comments from database
    const deletedComments=await Comment.findByIdAndDelete(commentId)
    if(!deletedComments)
    {
        throw new ApiError(400,"Error while deleting comments!!")
    }
    return res.status(200).json(new ApiResponse(200,deletedComments,"Comments deleted successfully!!"))
})

export {addComments,updateComment,getCommentsByPost,deleteComment}