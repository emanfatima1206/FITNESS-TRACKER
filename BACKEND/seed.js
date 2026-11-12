import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDb from "./Config/db.js";
import User from "./Models/usermodel.js";
import Workout from "./Models/workoutmodel.js";
import Nutrition from "./Models/nutritionmodel.js";
import Progress from "./Models/progressmodel.js";
import Goal from "./Models/goalmodel.js";
import Reminder from "./Models/remindermodel.js";

async function seed() {
  console.log("=========================================");
  console.log("  FITNESS TRACKER - DATABASE SEED SCRIPT ");
  console.log("=========================================");

  try {
    await connectDb();

    // 5 Realistic Test Users
    const rawUsers = [
      {
        name: "Alex Johnson",
        username: "alex_fit",
        email: "alex@fittrack.com",
        password: "Password123!",
        age: 28,
        gender: "Male",
        height: 180,
        weight: 78.5,
        profilePic: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
        preferences: { theme: "dark", units: "metric", workoutReminders: true }
      },
      {
        name: "Sarah Miller",
        username: "sarah_lifts",
        email: "sarah@fittrack.com",
        password: "Password123!",
        age: 26,
        gender: "Female",
        height: 168,
        weight: 62.0,
        profilePic: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
        preferences: { theme: "light", units: "metric", workoutReminders: true }
      },
      {
        name: "David Chen",
        username: "david_run",
        email: "david@fittrack.com",
        password: "Password123!",
        age: 32,
        gender: "Male",
        height: 175,
        weight: 72.0,
        profilePic: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
        preferences: { theme: "dark", units: "metric", workoutReminders: true }
      },
      {
        name: "Elena Rostova",
        username: "elena_yoga",
        email: "elena@fittrack.com",
        password: "Password123!",
        age: 29,
        gender: "Female",
        height: 170,
        weight: 58.5,
        profilePic: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80",
        preferences: { theme: "light", units: "metric", workoutReminders: true }
      },
      {
        name: "Marcus Vance",
        username: "marcus_crossfit",
        email: "marcus@fittrack.com",
        password: "Password123!",
        age: 35,
        gender: "Male",
        height: 185,
        weight: 86.0,
        profilePic: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
        preferences: { theme: "dark", units: "metric", workoutReminders: true }
      }
    ];

    const seededUsers = [];

    for (const rawUser of rawUsers) {
      let existingUser = await User.findOne({
        $or: [{ email: rawUser.email }, { username: rawUser.username }]
      });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(rawUser.password, 10);
        existingUser = new User({
          ...rawUser,
          password: hashedPassword
        });
        await existingUser.save();
        console.log(` Created user: ${existingUser.name} (${existingUser.email})`);
      } else {
        console.log(` Found existing user: ${existingUser.name} (${existingUser.email})`);
      }

      seededUsers.push({ doc: existingUser, plainPassword: rawUser.password });
    }

    // Now seed realistic related records for the first 3 users (Alex, Sarah, David)
    // User 1: Alex Johnson (Strength / Hypertrophy focus)
    const user1 = seededUsers[0].doc;
    await Workout.deleteMany({ userId: user1._id });
    await Nutrition.deleteMany({ userId: user1._id });
    await Progress.deleteMany({ userId: user1._id });
    await Goal.deleteMany({ userId: user1._id });
    await Reminder.deleteMany({ userId: user1._id });

    await Workout.insertMany([
      {
        userId: user1._id,
        name: "Heavy Chest & Triceps Blast",
        type: "Strength",
        duration: 60,
        calories: 450,
        sets: 4,
        reps: 10,
        weight: 85,
        date: new Date(Date.now() - 2 * 86400000),
        notes: "Barbell bench press 85kg 4x10, Incline DB press 30kg."
      },
      {
        userId: user1._id,
        name: "Back Deadlift & Pull Session",
        type: "Strength",
        duration: 55,
        calories: 520,
        sets: 5,
        reps: 6,
        weight: 140,
        date: new Date(Date.now() - 1 * 86400000),
        notes: "Deadlifts up to 140kg, Weighted pull-ups +15kg."
      },
      {
        userId: user1._id,
        name: "HIIT Sprints & Core",
        type: "HIIT",
        duration: 35,
        calories: 380,
        sets: 6,
        reps: 1,
        weight: 0,
        date: new Date(),
        notes: "10x 100m sprint intervals with 45s rest."
      }
    ]);

    await Nutrition.insertMany([
      {
        userId: user1._id,
        foodName: "Oatmeal with Whey Protein & Berries",
        mealType: "Breakfast",
        calories: 480,
        protein: 38,
        carbs: 65,
        fats: 9,
        date: new Date(),
        notes: "Pre-workout breakfast"
      },
      {
        userId: user1._id,
        foodName: "Grilled Chicken Breast, Brown Rice & Broccoli",
        mealType: "Lunch",
        calories: 650,
        protein: 55,
        carbs: 70,
        fats: 14,
        date: new Date(),
        notes: "Clean meal prep"
      },
      {
        userId: user1._id,
        foodName: "Salmon Fillet with Sweet Potato",
        mealType: "Dinner",
        calories: 580,
        protein: 45,
        carbs: 50,
        fats: 20,
        date: new Date(),
        notes: "Omega-3 rich dinner"
      }
    ]);

    await Progress.insertMany([
      {
        userId: user1._id,
        date: new Date(Date.now() - 14 * 86400000),
        weight: 80.2,
        chest: 104,
        waist: 86,
        hips: 98,
        arms: 38.5,
        notes: "Starting cut phase"
      },
      {
        userId: user1._id,
        date: new Date(Date.now() - 7 * 86400000),
        weight: 79.3,
        chest: 104.5,
        waist: 85,
        hips: 97.5,
        arms: 39.0,
        notes: "Waist down 1cm, strength maintained"
      },
      {
        userId: user1._id,
        date: new Date(),
        weight: 78.5,
        chest: 105,
        waist: 84,
        hips: 97,
        arms: 39.2,
        notes: "Body weight 78.5kg target progression"
      }
    ]);

    await Goal.insertMany([
      {
        userId: user1._id,
        title: "Reach 76kg Lean Weight",
        category: "Weight",
        targetValue: 76.0,
        currentValue: 78.5,
        unit: "kg",
        direction: "decrease",
        deadline: new Date(Date.now() + 25 * 86400000),
        status: "in-progress",
        description: "Shredding for upcoming summer physique contest"
      },
      {
        userId: user1._id,
        title: "Bench Press 100kg for 5 Reps",
        category: "Strength",
        targetValue: 100,
        currentValue: 90,
        unit: "kg",
        direction: "increase",
        deadline: new Date(Date.now() + 45 * 86400000),
        status: "in-progress",
        description: "Milestone upper body goal"
      }
    ]);

    await Reminder.insertMany([
      {
        userId: user1._id,
        title: "Morning Leg Hypertrophy Workout",
        type: "Workout",
        date: new Date().toISOString().split("T")[0],
        time: "07:30",
        enabled: true,
        description: "Squats, leg press, Romanian deadlifts."
      },
      {
        userId: user1._id,
        title: "Post-Workout Protein & Creatine Shake",
        type: "Nutrition",
        date: new Date().toISOString().split("T")[0],
        time: "09:15",
        enabled: true,
        description: "Take 40g whey + 5g creatine monohydrate."
      }
    ]);

    // User 2: Sarah Miller (Cardio, HIIT & Functional Training)
    const user2 = seededUsers[1].doc;
    await Workout.deleteMany({ userId: user2._id });
    await Nutrition.deleteMany({ userId: user2._id });
    await Progress.deleteMany({ userId: user2._id });
    await Goal.deleteMany({ userId: user2._id });
    await Reminder.deleteMany({ userId: user2._id });

    await Workout.insertMany([
      {
        userId: user2._id,
        name: "Morning 6km Lake Run",
        type: "Cardio",
        duration: 36,
        calories: 340,
        date: new Date(Date.now() - 2 * 86400000),
        notes: "Avg pace 5:58 /km, steady aerobic zone."
      },
      {
        userId: user2._id,
        name: "Full Body Kettlebell Circuit",
        type: "HIIT",
        duration: 40,
        calories: 390,
        sets: 4,
        reps: 15,
        weight: 16,
        date: new Date(Date.now() - 1 * 86400000),
        notes: "Kettlebell swings 16kg, goblet squats, clean & press."
      },
      {
        userId: user2._id,
        name: "Spinning & Interval Cycling",
        type: "Cardio",
        duration: 45,
        calories: 420,
        date: new Date(),
        notes: "High cadence resistance drills."
      }
    ]);

    await Nutrition.insertMany([
      {
        userId: user2._id,
        foodName: "Greek Yogurt with Honey & Chia Seeds",
        mealType: "Breakfast",
        calories: 320,
        protein: 24,
        carbs: 38,
        fats: 8,
        date: new Date(),
        notes: "High protein gut-friendly breakfast"
      },
      {
        userId: user2._id,
        foodName: "Quinoa Bowl with Tofu and Avocado",
        mealType: "Lunch",
        calories: 490,
        protein: 26,
        carbs: 58,
        fats: 16,
        date: new Date(),
        notes: "Plant-powered nutrient rich lunch"
      },
      {
        userId: user2._id,
        foodName: "Grilled Turkey Strips & Sweet Potato Mash",
        mealType: "Dinner",
        calories: 450,
        protein: 42,
        carbs: 45,
        fats: 10,
        date: new Date(),
        notes: "Clean lean protein dinner"
      }
    ]);

    await Progress.insertMany([
      {
        userId: user2._id,
        date: new Date(Date.now() - 14 * 86400000),
        weight: 63.8,
        chest: 88,
        waist: 71,
        hips: 95,
        arms: 27.5,
        notes: "Starting summer routine"
      },
      {
        userId: user2._id,
        date: new Date(Date.now() - 7 * 86400000),
        weight: 62.9,
        chest: 88,
        waist: 70,
        hips: 94.5,
        arms: 27.5,
        notes: "Good energy throughout the week"
      },
      {
        userId: user2._id,
        date: new Date(),
        weight: 62.0,
        chest: 87.5,
        waist: 69,
        hips: 94,
        arms: 28.0,
        notes: "Targeting 60kg marathon weight"
      }
    ]);

    await Goal.insertMany([
      {
        userId: user2._id,
        title: "Complete 10km Run Under 50 Mins",
        category: "Cardio",
        targetValue: 50,
        currentValue: 56,
        unit: "min",
        direction: "decrease",
        deadline: new Date(Date.now() + 30 * 86400000),
        status: "in-progress",
        description: "Marathon endurance prep"
      },
      {
        userId: user2._id,
        title: "Hit 60kg Race Body Weight",
        category: "Weight",
        targetValue: 60.0,
        currentValue: 62.0,
        unit: "kg",
        direction: "decrease",
        deadline: new Date(Date.now() + 40 * 86400000),
        status: "in-progress",
        description: "Aerobic power-to-weight optimization"
      }
    ]);

    await Reminder.insertMany([
      {
        userId: user2._id,
        title: "Morning 5km Tempo Run",
        type: "Workout",
        date: new Date().toISOString().split("T")[0],
        time: "06:30",
        enabled: true,
        description: "Lace up road shoes, stretch calves."
      },
      {
        userId: user2._id,
        title: "Daily Hydration Check (1.5L by Noon)",
        type: "Health",
        date: new Date().toISOString().split("T")[0],
        time: "12:00",
        enabled: true,
        description: "Keep electrolyte water bottle filled."
      }
    ]);

    // User 3: David Chen (Marathon & Consistency focus)
    const user3 = seededUsers[2].doc;
    await Workout.deleteMany({ userId: user3._id });
    await Nutrition.deleteMany({ userId: user3._id });
    await Progress.deleteMany({ userId: user3._id });
    await Goal.deleteMany({ userId: user3._id });
    await Reminder.deleteMany({ userId: user3._id });

    await Workout.insertMany([
      {
        userId: user3._id,
        name: "Interval Track Sprints 8x400m",
        type: "Cardio",
        duration: 45,
        calories: 460,
        date: new Date(Date.now() - 2 * 86400000),
        notes: "400m repeat at 85s pace."
      },
      {
        userId: user3._id,
        name: "Leg Strength & Mobility",
        type: "Flexibility",
        duration: 40,
        calories: 220,
        sets: 3,
        reps: 12,
        weight: 40,
        date: new Date(Date.now() - 1 * 86400000),
        notes: "Hip flexor mobility, Bulgarian split squats."
      },
      {
        userId: user3._id,
        name: "Long Weekend Aerobic Run 12km",
        type: "Cardio",
        duration: 65,
        calories: 680,
        date: new Date(),
        notes: "Heart rate steady at 145 bpm."
      }
    ]);

    await Nutrition.insertMany([
      {
        userId: user3._id,
        foodName: "Banana Peanut Butter Toast & Black Coffee",
        mealType: "Breakfast",
        calories: 380,
        protein: 14,
        carbs: 56,
        fats: 12,
        date: new Date(),
        notes: "Pre-run energy meal"
      },
      {
        userId: user3._id,
        foodName: "Chicken Burrito Bowl with Black Beans",
        mealType: "Lunch",
        calories: 620,
        protein: 48,
        carbs: 75,
        fats: 15,
        date: new Date(),
        notes: "Post-workout recovery"
      },
      {
        userId: user3._id,
        foodName: "Baked Salmon & Steamed Vegetables",
        mealType: "Dinner",
        calories: 510,
        protein: 42,
        carbs: 30,
        fats: 18,
        date: new Date(),
        notes: "Healthy fats & clean recovery"
      }
    ]);

    await Progress.insertMany([
      {
        userId: user3._id,
        date: new Date(Date.now() - 14 * 86400000),
        weight: 73.5,
        chest: 96,
        waist: 82,
        hips: 94,
        arms: 33,
        notes: "Initial check-in"
      },
      {
        userId: user3._id,
        date: new Date(Date.now() - 7 * 86400000),
        weight: 72.8,
        chest: 96,
        waist: 81,
        hips: 93.5,
        arms: 33,
        notes: "Mileage increasing"
      },
      {
        userId: user3._id,
        date: new Date(),
        weight: 72.0,
        chest: 95.5,
        waist: 80,
        hips: 93,
        arms: 33.2,
        notes: "On track for half-marathon"
      }
    ]);

    await Goal.insertMany([
      {
        userId: user3._id,
        title: "Log 80km Total Running This Month",
        category: "Cardio",
        targetValue: 80,
        currentValue: 54,
        unit: "km",
        direction: "increase",
        deadline: new Date(Date.now() + 20 * 86400000),
        status: "in-progress",
        description: "Aerobic base building"
      },
      {
        userId: user3._id,
        title: "Drink 3 Liters Water Daily for 30 Days",
        category: "Consistency",
        targetValue: 30,
        currentValue: 18,
        unit: "days",
        direction: "increase",
        deadline: new Date(Date.now() + 12 * 86400000),
        status: "in-progress",
        description: "Optimal hydration habit"
      }
    ]);

    await Reminder.insertMany([
      {
        userId: user3._id,
        title: "Track Session - Interval Sprints",
        type: "Workout",
        date: new Date().toISOString().split("T")[0],
        time: "18:00",
        enabled: true,
        description: "Warm up with 2km easy jog."
      },
      {
        userId: user3._id,
        title: "Evening Foam Rolling & Stretching",
        type: "Health",
        date: new Date().toISOString().split("T")[0],
        time: "21:30",
        enabled: true,
        description: "15 mins hip flexors, hamstrings and IT bands."
      }
    ]);

    console.log("\n=======================================================");
    console.log("  SEED COMPLETED SUCCESSFULLY! TEST ACCOUNTS: ");
    console.log("=======================================================");
    seededUsers.forEach((u, i) => {
      console.log(`[User ${i + 1}]`);
      console.log(`  Name:     ${u.doc.name}`);
      console.log(`  Username: ${u.doc.username}`);
      console.log(`  Email:    ${u.doc.email}`);
      console.log(`  Password: ${u.plainPassword}`);
      console.log(`  User ID:  ${u.doc._id}`);
      console.log("-------------------------------------------------------");
    });

    console.log("Database connection closing...");
    await mongoose.connection.close();
    console.log("Done!");
    process.exit(0);

  } catch (error) {
    console.error("FATAL ERROR IN SEED:", error);
    process.exit(1);
  }
}

seed();
