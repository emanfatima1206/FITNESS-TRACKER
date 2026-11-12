import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  updatePreferences,
} from "../Controller/usercontroller.js";
import verifyAuthToken from "../Middleware/authmiddleware.js";

const router = express.Router();

router.use(verifyAuthToken);

router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);
router.put("/change-password", changePassword);
router.put("/preferences", updatePreferences);

export default router;
