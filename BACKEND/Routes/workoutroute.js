import express from "express";
import { addWorkout,getWorkouts,updateWorkout,deleteWorkout,} from "../Controller/workoutcontroller.js";
import protect from "../Middleware/authmiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", addWorkout);
router.get("/", getWorkouts);
router.put("/:id", updateWorkout);
router.delete("/:id", deleteWorkout);

export default router;
