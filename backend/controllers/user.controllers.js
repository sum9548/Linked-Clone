import uploadOnCloudinary from "../config/cloudinary.js";
import upload from "../middlewares/multer.js";
import User from "../models/user.model.js";

export const getCurrentUser = async (req, res) => {
  try {
    const id = req.userId;
    // console.log(id);

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(400).json({ message: "user does not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "get current user error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    // =========
    console.log("========== BODY ==========");
    console.log(req.body);

    console.log("skills =", req.body.skills);
    console.log("education =", req.body.education);
    console.log("experience =", req.body.experience);

    // ========
    console.log(req.files);
    const { firstName, lastName, userName, headline, location, gender } =
      req.body;
    const skills = req.body.skills ? JSON.parse(req.body.skills) : [];
    const education = req.body.education ? JSON.parse(req.body.education) : [];
    const experience = req.body.experience
      ? JSON.parse(req.body.experience)
      : [];
    console.log("Step 1");

    let profileImage;
    let coverImage;
    console.log(req.files);
    if (req.files.profileImage) {
      profileImage = await uploadOnCloudinary(req.files.profileImage[0].path);
    }
    console.log("Step 2");
    if (req.files.coverImage) {
      coverImage = await uploadOnCloudinary(req.files.coverImage[0].path);
    }
    console.log("Step 3");

    console.log("Step 4");

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        firstName,
        lastName,
        userName,
        headline,
        location,
        gender,
        skills,
        education,
        experience,
        profileImage,
        coverImage,
      },
      { returnDocument: "after" },
    ).select("-password");
    console.log("Step 5", user);
    return res.status(200).json(user);
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:");
    console.error(error);
    console.error(error.message);
    console.error(error.stack);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// getting anothor user data like post, skills, education , ecperience

export const getProfile = async (req, res) => {
  try {
    const { userName } = req.params;

    const user = await User.findOne({ userName }).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "Username doesn't exist",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({
      message: `Get profile error: ${error.message}`,
    });
  }
};

// search controller

export const search = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "query is required" });
    }

    const users = await User.find({
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { userName: { $regex: query, $options: "i" } },
        { skills: { $in: [query] } },
      ],
    });

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({
      message: `search error : ${error.message}`,
    });
  }
};

export const getSuggestedUser = async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId).select("connection");

    const suggestedUsers = await User.find({
     _id:{
       $ne: req.userId,
      $nin: currentUser.connection
     }
    }).select("-password")

    return res.status(200).json(suggestedUsers);
  } catch (error) {
    return res.status(500).json({
      message: `Suggested User Error : ${error.message}`,
    });
  }
};
