import Workout from "../Models/workoutmodel.js";

// Add Workout
export const addWorkout = async (req, res) => {
  try {
    const {
      name,
      type,
      duration,
      calories,
      sets,
      reps,
      weight,
      date,
      notes
    } = req.body;

    if (!name || duration === undefined || calories === undefined) {
      return res.status(400).json({
        message: "Workout name, duration and calories are required"
      });
    }

    const workout = new Workout({
      userId: req.user.id,
      name: name,
      type: type || "Cardio",
      duration: Number(duration),
      calories: Number(calories),
      sets: Number(sets) || 0,
      reps: Number(reps) || 0,
      weight: Number(weight) || 0,
      date: date || new Date(),
      notes: notes || ""
    });

    await workout.save();

    res.status(201).json({
      message: "Workout added successfully",
      workout
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// Get Workouts
export const getWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({
      userId: req.user.id
    }).sort({ date: -1 });

    res.json(workouts);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// Update Workout
export const updateWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!workout) {
      return res.status(404).json({
        message: "Workout not found"
      });
    }

    if (req.body.name !== undefined) {
      workout.name = req.body.name;
    }

    if (req.body.type !== undefined) {
      workout.type = req.body.type;
    }

    if (req.body.duration !== undefined) {
      workout.duration = Number(req.body.duration);
    }

    if (req.body.calories !== undefined) {
      workout.calories = Number(req.body.calories);
    }

    if (req.body.sets !== undefined) {
      workout.sets = Number(req.body.sets);
    }

    if (req.body.reps !== undefined) {
      workout.reps = Number(req.body.reps);
    }

    if (req.body.weight !== undefined) {
      workout.weight = Number(req.body.weight);
    }

    if (req.body.date !== undefined) {
      workout.date = req.body.date;
    }

    if (req.body.notes !== undefined) {
      workout.notes = req.body.notes;
    }

    await workout.save();

    res.json({
      message: "Workout updated successfully",
      workout
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// Delete Workout
export const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!workout) {
      return res.status(404).json({
        message: "Workout not found"
      });
    }

    await workout.deleteOne();

    res.json({
      message: "Workout deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};