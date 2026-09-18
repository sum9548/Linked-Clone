import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import genToken from "../config/token.js";
import dotenv from "dotenv";

const cookieOptions = {
  httpOnly: true,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  sameSite: process.env.NODE_ENVIRONMENT === "production" ? "none" : "lax",
  secure: process.env.NODE_ENVIRONMENT === "production",
};

export const signUp = async (req, res) => {
  try {
    const { firstName, lastName, userName, email, password } = req.body;

    // Check if all fields are provided
    if (!firstName || !lastName || !userName || !email || !password) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    // Check email
    const existEmail = await User.findOne({ email });
    if (existEmail) {
      return res.status(400).json({
        message: "Email already exists.",
      });
    }

    // Check username
    const existUserName = await User.findOne({ userName });
    if (existUserName) {
      return res.status(400).json({
        message: "Username already exists.",
      });
    }

    // Validate password
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      userName,
      email,
      password: hashedPassword,
    });

    // Generate JWT
    const token = genToken(user._id);

    // Store token in cookie
    res.cookie("token", token, cookieOptions);

    // Remove password before sending response
    const { password: _, ...userWithoutPassword } = user._doc;

    return res.status(201).json({
      message: "Signup successful.",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Signup error.",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User does not exist.",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect password.",
      });
    }

    // Generate JWT
    const token = genToken(user._id);

    // Store token in cookie
    res.cookie("token", token, cookieOptions);

    // Remove password before sending response
    const { password: _, ...userWithoutPassword } = user._doc;

    return res.status(200).json({
      message: "Login successful.",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Login error.",
    });
  }
};

export const logOut = (req, res) => {
  res.clearCookie("token");

  return res.status(200).json({
    message: "Logout successful.",
  });
};
