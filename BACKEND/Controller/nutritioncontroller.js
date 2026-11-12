import Nutrition from "../Models/nutritionmodel.js";

// Add Nutrition
export const addNutrition = async (req, res) => {
  try {
    const {
      foodName,
      mealType,
      calories,
      protein,
      carbs,
      fats,
      date,
      notes
    } = req.body;

    if (!foodName || !mealType || calories === undefined) {
      return res.status(400).json({
        message: "Food name, meal type and calories are required"
      });
    }

    const nutrition = new Nutrition({
      userId: req.user.id,
      foodName: foodName,
      mealType: mealType,
      calories: Number(calories),
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fats: Number(fats) || 0,
      date: date || new Date(),
      notes: notes || ""
    });

    await nutrition.save();

    res.status(201).json({
      message: "Nutrition added successfully",
      nutrition
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// Get Nutrition
export const getNutrition = async (req, res) => {
  try {
    const query = {
      userId: req.user.id
    };

    // Optional date filter
    if (req.query.date) {
      const startDate = new Date(req.query.date);
      const endDate = new Date(req.query.date);

      endDate.setHours(23, 59, 59, 999);

      query.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const nutrition = await Nutrition.find(query)
      .sort({ date: -1 });

    res.json(nutrition);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// Update Nutrition
export const updateNutrition = async (req, res) => {
  try {
    const nutrition = await Nutrition.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!nutrition) {
      return res.status(404).json({
        message: "Nutrition record not found"
      });
    }

    if (req.body.foodName !== undefined) {
      nutrition.foodName = req.body.foodName;
    }

    if (req.body.mealType !== undefined) {
      nutrition.mealType = req.body.mealType;
    }

    if (req.body.calories !== undefined) {
      nutrition.calories = Number(req.body.calories);
    }

    if (req.body.protein !== undefined) {
      nutrition.protein = Number(req.body.protein);
    }

    if (req.body.carbs !== undefined) {
      nutrition.carbs = Number(req.body.carbs);
    }

    if (req.body.fats !== undefined) {
      nutrition.fats = Number(req.body.fats);
    }

    if (req.body.date !== undefined) {
      nutrition.date = req.body.date;
    }

    if (req.body.notes !== undefined) {
      nutrition.notes = req.body.notes;
    }

    await nutrition.save();

    res.json({
      message: "Nutrition updated successfully",
      nutrition
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// Delete Nutrition
export const deleteNutrition = async (req, res) => {
  try {
    const nutrition = await Nutrition.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!nutrition) {
      return res.status(404).json({
        message: "Nutrition record not found"
      });
    }

    await nutrition.deleteOne();

    res.json({
      message: "Nutrition deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};