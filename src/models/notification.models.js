import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    typeOfNotification: {
      type: String,
      required: true,
      enum: ["like", "comment", "post", "mention", "follow"],
    },
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Notification = mongoose.model("Notification", notificationSchema);
