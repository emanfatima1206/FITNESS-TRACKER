import express from "express";
import {addReminder,getReminders,updateReminder,deleteReminder,} from "../Controller/remindercontroller.js";
import protect from "../Middleware/authmiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", addReminder);
router.get("/", getReminders);
router.put("/:id", updateReminder);
router.delete("/:id", deleteReminder);

export default router;
