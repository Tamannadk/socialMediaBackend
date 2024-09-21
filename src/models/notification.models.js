import mongoose from "mongoose";

const notificationSchema=new mongoose.Schema
(
    {

    },
    {
        timestamps:true
    }
)

export const Notification=mongoose.model("Notification",notificationSchema)