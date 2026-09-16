import mongoose from "mongoose"

// const notificationSchema = new mongoose.Schema({
//     receiver:{
//         type:mongoose.Schema.Types.ObjectId,
//         ref:"User",
//         required: true,

//     },
//     type:{
//         type:String,
//         enum:["like","comment","connectionAccepted"],
//         required: true,
//     },
//     relatedUser:{
//         type:mongoose.Schema.Types.ObjectId,
//         ref:'User',
       
//     },
//     relatedPost:{
//         type:mongoose.Schema.Types.ObjectId,
//         ref:'Post'
//     },

//      // For comment notification
//     message: {
//       type: String,
//       default: "",
//     },
// },{timestamps:true})

// const Notification = mongoose.model("Notification",notificationSchema)

// export default Notification




const notificationSchema = new mongoose.Schema(
  {
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["like", "comment", "connectionAccepted"],
      required: true,
    },

    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    relatedPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },

    // Used for storing the actual comment
    message: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

export default Notification;