import express from "express";
import {addGoal,getGoals,updateGoal,deleteGoal,} from "../Controller/goalcontroller.js";
import protect from "../Middleware/authmiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", addGoal);
router.get("/", getGoals);
router.put("/:id", updateGoal);
router.delete("/:id", deleteGoal);

export default router;
