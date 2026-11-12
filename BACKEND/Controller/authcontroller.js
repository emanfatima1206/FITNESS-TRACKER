import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../Models/usermodel.js";
import cloudinary from "../Config/cloudinary.js";

const JWT_SECRET =
  process.env.JWT_SECRET || "fit_track_secret_key_2026";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: false,
  maxAge: 7 * 24 * 60 * 60 * 1000
};

// Register
export const register = async (req, res) => {
  try {
    const { username, name, email, password } = req.body;

    if (!username || !name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email or username already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: username.toLowerCase(),
      name: name,
      email: email.toLowerCase(),
      password: hashedPassword
    });

    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, cookieOptions);

    res.status(201).json({
      message: "Registered successfully",
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic || ""
      }
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email/username and password are required"
      });
    }

    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: email.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, cookieOptions);

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic || ""
      }
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// Get Profile
export const profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json(user);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// Update Profile
export const updateProfile = async (req, res) => {
  try {
    const {
      name,
      username,
      email,
      age,
      gender,
      height,
      weight,
      profilePic
    } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        username,
        email,
        age,
        gender,
        height,
        weight,
        profilePic
      },
      {
        new: true,
        runValidators: true
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json({
      message: "Profile updated successfully",
      user: user
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// Change Password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Both passwords are required"
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordMatch) {
      return res.status(400).json({
        message: "Current password is incorrect"
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    res.json({
      message: "Password updated successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// Update Preferences
export const updatePreferences = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        preferences: req.body
      },
      {
        new: true
      }
    ).select("-password");

    res.json({
      message: "Preferences updated successfully",
      user: user
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// Logout
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", cookieOptions);

    res.json({
      message: "Logged out successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// Upload Profile Picture
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select an image"
      });
    }

    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
      {
        folder: "fitness_profiles"
      }
    );

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        profilePic: result.secure_url
      },
      {
        new: true
      }
    ).select("-password");

    res.json({
      message: "Profile picture uploaded successfully",
      profilePic: result.secure_url,
      user: user
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};