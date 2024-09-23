import mongoose from "mongoose";

const postSchema=new mongoose.Schema(
    {
        author:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        postImage:{
            type:[String],
        },
        description:{
            type:String,
            required:true
        },
        likes:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Like"
        },
        comments:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Comment"
        },
        shares:{
            type:Number,
            default:0
        }
    },
    {
        timestamps:true
    }
)

export const Post=mongoose.model("Post",postSchema)