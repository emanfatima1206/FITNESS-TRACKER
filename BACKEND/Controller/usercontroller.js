import bcrypt from "bcryptjs";
import User from "../Models/usermodel.js";

// Get User Profile
export const getUserProfile = async (req, res) => {
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


// Update User Profile
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (req.body.name !== undefined) {
      user.name = req.body.name;
    }

    if (req.body.username !== undefined) {
      user.username = req.body.username.toLowerCase();
    }

    if (req.body.email !== undefined) {
      user.email = req.body.email.toLowerCase();
    }

    if (req.body.age !== undefined) {
      user.age = Number(req.body.age);
    }

    if (req.body.gender !== undefined) {
      user.gender = req.body.gender;
    }

    if (req.body.height !== undefined) {
      user.height = Number(req.body.height);
    }

    if (req.body.weight !== undefined) {
      user.weight = Number(req.body.weight);
    }

    if (req.body.profilePic !== undefined) {
      user.profilePic = req.body.profilePic;
    }

    if (req.body.preferences !== undefined) {
      user.preferences = req.body.preferences;
    }

    await user.save();

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
    const {
      currentPassword,
      newPassword
    } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required"
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
        message: "Incorrect current password"
      });
    }

    user.password = await bcrypt.hash(
      newPassword,
      10
    );

    await user.save();

    res.json({
      message: "Password changed successfully"
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
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    user.preferences = req.body;

    await user.save();

    res.json({
      message: "Preferences updated successfully",
      preferences: user.preferences
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};