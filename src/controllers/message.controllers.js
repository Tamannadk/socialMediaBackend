import { Message } from "../models/message.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const sendMessage = asyncHandler(async (req, res) => {
  const { senderId, receiverId, message, images } = req.body;
  try {
    const messageSent = new Message({
      sender: senderId,
      receiver: receiverId,
      message,
      images,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, messageSent, "Message sent successfully!!"));
  } catch (error) {
    throw new ApiError(400, "Error sending message");
  }
});

const getChatHistory = asyncHandler(async (req, res) => {
  const { senderId, receiverId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    }).sort({ createdAt: 1 });
    return res
      .status(200)
      .json(new ApiResponse(200, messages, "Message sent successfully!!"));
  } catch (error) {
    throw new ApiError(400, "Error fetching chat history!!");
  }
});

const deleteMessage = asyncHandler(async (req,res) => {
  const { messageId } = req.params;
  try {
    const message = await Message.findByIdAndDelete(messageId);
    if (!message) {
      throw new ApiError(400, "Message not found!!");
    }
    return res.status(200).json(new ApiResponse(200, {}, "Message deleted successfully!!"));
  } catch (error) {
    throw new ApiError(400, "Error deleting message!!");
  }
});

const editMessageContent = asyncHandler(async (req, res) => {
    const { messageId } = req.params;  
    const { message } = req.body;      
  
    try {
      const updatedMessage = await Message.findByIdAndUpdate(
        messageId,                      
        {
          $set: { message: message },    
        },
        {
          new: true                      
        }
      );
  
      // Check if the message was found and updated
      if (!updatedMessage) {
        return res.status(404).json({
          success: false,
          message: "Message not found",
        });
      }
  
      // Return the updated message with a success message
      return res.status(200).json({
        success: true,
        updatedMessage,
        message: "Message updated successfully!",
      });
    } catch (error) {
      // Handle errors
      return res.status(500).json({
        success: false,
        message: "Failed to update message",
        error: error.message,
      });
    }
  });
  
const markMessagesAsRead = async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    await Message.updateMany(
      { sender: senderId, receiver: receiverId, read: false }, // Find all unread messages
      { $set: { read: true } } // Mark them as read
    );

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update messages" });
  }
};

export { sendMessage, getChatHistory, deleteMessage, markMessagesAsRead,editMessageContent };
