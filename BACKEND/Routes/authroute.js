import express from "express";
import { register, login, logout, profile, updateProfile, changePassword, updatePreferences, uploadAvatar } from "../Controller/authcontroller.js";
import protect from "../Middleware/authmiddleware.js";
import upload from "../Middleware/upload.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", protect, profile);
router.put("/profile", protect, updateProfile);
router.post("/change-password", protect, changePassword);
router.put("/preferences", protect, updatePreferences);
router.post("/upload-avatar", protect, upload.single("image"), uploadAvatar);

export default router;
