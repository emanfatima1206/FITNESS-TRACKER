import Goal from "../Models/goalmodel.js";

// Add Goal
export const addGoal = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      targetValue,
      currentValue,
      unit,
      direction,
      deadline,
      status
    } = req.body;

    if (!title || targetValue === undefined) {
      return res.status(400).json({
        message: "Title and target value are required"
      });
    }

    const goal = new Goal({
      userId: req.user.id,
      title,
      description: description || "",
      category: category || "Weight",
      targetValue: Number(targetValue),
      currentValue: Number(currentValue) || 0,
      unit: unit || "kg",
      direction: direction || "increase",
      deadline: deadline || null,
      status: status || "in-progress"
    });

    await goal.save();

    res.status(201).json({
      message: "Goal added successfully",
      goal
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// Get Goals
export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({
      userId: req.user.id
    }).sort({ createdAt: -1 });

    res.json(goals);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// Update Goal
export const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!goal) {
      return res.status(404).json({
        message: "Goal not found"
      });
    }

    if (req.body.title !== undefined) {
      goal.title = req.body.title;
    }

    if (req.body.description !== undefined) {
      goal.description = req.body.description;
    }

    if (req.body.category !== undefined) {
      goal.category = req.body.category;
    }

    if (req.body.targetValue !== undefined) {
      goal.targetValue = Number(req.body.targetValue);
    }

    if (req.body.currentValue !== undefined) {
      goal.currentValue = Number(req.body.currentValue);
    }

    if (req.body.unit !== undefined) {
      goal.unit = req.body.unit;
    }

    if (req.body.direction !== undefined) {
      goal.direction = req.body.direction;
    }

    if (req.body.deadline !== undefined) {
      goal.deadline = req.body.deadline;
    }

    if (req.body.status !== undefined) {
      goal.status = req.body.status;
    }

    await goal.save();

    res.json({
      message: "Goal updated successfully",
      goal
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// Delete Goal
export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!goal) {
      return res.status(404).json({
        message: "Goal not found"
      });
    }

    await goal.deleteOne();

    res.json({
      message: "Goal deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};