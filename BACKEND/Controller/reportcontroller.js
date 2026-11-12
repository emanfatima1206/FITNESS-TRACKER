import Workout from "../Models/workoutmodel.js";
import Nutrition from "../Models/nutritionmodel.js";
import Progress from "../Models/progressmodel.js";
import Goal from "../Models/goalmodel.js";

// Dashboard Data
export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    const workouts = await Workout.find({ userId });
    const nutrition = await Nutrition.find({ userId });
    const progress = await Progress.find({ userId }).sort({ date: -1 });
    const goals = await Goal.find({ userId });

    // Weight
    let currentWeight = 0;
    let weightChange = 0;

    if (progress.length > 0) {
      currentWeight = progress[0].weight;
    }

    if (progress.length > 1) {
      weightChange = currentWeight - progress[1].weight;
    }

    // Workout totals
    let totalDuration = 0;
    let totalCaloriesBurned = 0;

    for (const workout of workouts) {
      totalDuration += Number(workout.duration) || 0;
      totalCaloriesBurned += Number(workout.calories) || 0;
    }

    // Today's date
    const today = new Date().toISOString().split("T")[0];

    let todayCalories = 0;
    let todayProtein = 0;
    let todayCarbs = 0;
    let todayFats = 0;

    // Today's nutrition
    for (const item of nutrition) {
      const date = new Date(item.date)
        .toISOString()
        .split("T")[0];

      if (date === today) {
        todayCalories += Number(item.calories) || 0;
        todayProtein += Number(item.protein) || 0;
        todayCarbs += Number(item.carbs) || 0;
        todayFats += Number(item.fats) || 0;
      }
    }

    // Today's workouts
    const todayWorkouts = [];

    for (const workout of workouts) {
      const date = new Date(workout.date)
        .toISOString()
        .split("T")[0];

      if (date === today) {
        todayWorkouts.push(workout);
      }
    }

    // Completed goals
    let completedGoals = 0;

    for (const goal of goals) {
      if (
        goal.status === "completed" ||
        goal.currentValue >= goal.targetValue
      ) {
        completedGoals++;
      }
    }

    res.json({
      success: true,

      summary: {
        currentWeight,
        weightChange,
        totalCaloriesToday: todayCalories,
        caloriesGoal: 2000,
        totalWorkouts: workouts.length,
        totalDuration,
        totalCaloriesBurned,
        completedGoals,

        macros: {
          protein: todayProtein,
          carbs: todayCarbs,
          fats: todayFats
        }
      },

      todayWorkouts
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// Reports and Analytics
export const getReportsAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const workouts = await Workout.find({ userId });
    const nutrition = await Nutrition.find({ userId });
    const progress = await Progress.find({ userId }).sort({ date: 1 });
    const goals = await Goal.find({ userId });

    // Workout statistics
    let totalDuration = 0;
    let totalCaloriesBurned = 0;

    for (const workout of workouts) {
      totalDuration += Number(workout.duration) || 0;
      totalCaloriesBurned += Number(workout.calories) || 0;
    }

    const totalWorkouts = workouts.length;

    let averageWorkoutDuration = 0;

    if (totalWorkouts > 0) {
      averageWorkoutDuration =
        Math.round(totalDuration / totalWorkouts);
    }

    // Nutrition statistics
    let totalCaloriesConsumed = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    for (const item of nutrition) {
      totalCaloriesConsumed += Number(item.calories) || 0;
      totalProtein += Number(item.protein) || 0;
      totalCarbs += Number(item.carbs) || 0;
      totalFats += Number(item.fats) || 0;
    }

    // Weight progress
    const weightProgressData = progress.map((item) => ({
      date: new Date(item.date).toLocaleDateString(),
      weight: item.weight
    }));

    // Workout types
    const workoutTypes = {};

    for (const workout of workouts) {
      const type = workout.type || "Other";

      if (!workoutTypes[type]) {
        workoutTypes[type] = 0;
      }

      workoutTypes[type]++;
    }

    const workoutTypeData = Object.keys(workoutTypes).map(
      (type) => ({
        name: type,
        value: workoutTypes[type]
      })
    );

    // Completed goals
    let goalsCompleted = 0;

    for (const goal of goals) {
      if (
        goal.status === "completed" ||
        goal.currentValue >= goal.targetValue
      ) {
        goalsCompleted++;
      }
    }

    res.json({
      success: true,

      stats: {
        totalWorkouts,
        totalDuration,
        totalCaloriesBurned,
        averageWorkoutDuration,
        totalCaloriesConsumed,
        totalProtein,
        totalCarbs,
        totalFats,
        goalsCount: goals.length,
        goalsCompleted
      },

      weightProgressData,
      workoutTypeData
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};