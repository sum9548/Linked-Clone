import Notification from "../models/notification.model.js"
import Post from "../models/post.model.js";



// export const getNotifications = async (req,res) =>{
//     try {
        
//         const notification = await Notification.find({receiver:req.userId})
//         .populate("relatedUser","firstName lastName userName profileImage headline")
//         .populate("relatedPost","image description")
//         .sort({createdAt: -1});
//         return res.status(200).json(notification)

//     } catch (error) {
//          console.log("Get notification error:", error);
//         return res.status(500).json({message:`get notification error ${error}`})
//     }
// }


// export const deleteNotification = async (req,res) =>{
//     try {
//         const {id} = req.params
        
//          await Notification.findOneAndDelete({
//             _id:id,
//             receiver:req.userId
//          })
//         return res.status(200).json({message:"notification deleted successfully"})

//     } catch (error) {
//         return res.status(500).json({message:`delete notification error ${error}`})
//     }
// }


// export const clearAllNotification = async (req,res) =>{
//     try {
       
//          await Notification.deleteMany({
//             receiver:req.userId
//          })
//         return res.status(200).json({message:"all notification deleted successfully"})

//     } catch (error) {
//         return res.status(500).json({message:`delete all notification error ${error}`})
//     }
// }



// ===============================
// GET ALL NOTIFICATIONS
// ===============================

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      receiver: req.userId,
    })
      .populate(
        "relatedUser",
        "firstName lastName userName profileImage headline"
      )
      .populate(
        "relatedPost",
        "image description author"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json(notifications);

  } catch (error) {
    console.log("Get notification error:", error);

    return res.status(500).json({
      message: `Get notification error: ${error.message}`,
    });
  }
};


// ===============================
// DELETE ONE NOTIFICATION
// ===============================
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    await Notification.findOneAndDelete({
      _id: id,
      receiver: req.userId,
    });

    return res.status(200).json({
      message: "Notification deleted successfully",
    });

  } catch (error) {
    console.log("Delete notification error:", error);

    return res.status(500).json({
      message: `Delete notification error: ${error.message}`,
    });
  }
};


// ===============================
// DELETE ALL NOTIFICATIONS
// ===============================
export const clearAllNotification = async (req, res) => {
  try {
    await Notification.deleteMany({
      receiver: req.userId,
    });

    return res.status(200).json({
      message: "All notifications deleted successfully",
    });

  } catch (error) {
    console.log("Delete all notification error:", error);

    return res.status(500).json({
      message: `Delete all notification error: ${error.message}`,
    });
  }
};