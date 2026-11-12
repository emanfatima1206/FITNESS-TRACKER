import express from "express";
import {addNutrition,getNutrition,updateNutrition,deleteNutrition,} from "../Controller/nutritioncontroller.js";
import protect from "../Middleware/authmiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", addNutrition);
router.get("/", getNutrition);
router.put("/:id", updateNutrition);
router.delete("/:id", deleteNutrition);

export default router;
