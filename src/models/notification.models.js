import mongoose from "mongoose";

const notificationSchema=new mongoose.Schema
(
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        typeOfNotification:{
            type:String,
            required:true
        },
        fromUser:{
            type:String,
            required:true,
        },
        Post:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Post"
        },
        Comment:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Comment"
        },
        Like:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Like"
        }
    },
    {
        timestamps:true
    }
)

export const Notification=mongoose.model("Notification",notificationSchema)