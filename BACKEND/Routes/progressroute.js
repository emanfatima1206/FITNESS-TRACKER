import express from "express";
import {addProgress, getProgress,updateProgress,deleteProgress} from "../Controller/progresscontroller.js";
import protect from "../Middleware/authmiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", addProgress);
router.get("/", getProgress);
router.put("/:id", updateProgress);
router.delete("/:id", deleteProgress);

export default router;
