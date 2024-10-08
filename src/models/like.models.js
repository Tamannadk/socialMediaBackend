import mongoose from "mongoose";

const likeSchema=new mongoose.Schema
(
    {
        likedBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        comment:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Comment"
        },
        post:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Post"
        }
    },
    {
        timestamps:true
    }
)

export const Like=mongoose.model("Like",likeSchema)