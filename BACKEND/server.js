import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDb from "./Config/db.js";
import authroute from "./Routes/authroute.js";
import workoutroute from "./Routes/workoutroute.js";
import progressrouter from "./Routes/progressroute.js";
import nutritionrouter from "./Routes/nutritionroute.js";
import goalroute from "./Routes/goalroute.js";
import reminderroute from "./Routes/reminderroute.js";
import reportroute from "./Routes/reportroute.js";
import userroute from "./Routes/userroute.js";

const app = express();
const port = process.env.PORT || 5000;

connectDb();

// CORS configuration supporting credentials from frontend
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Disable caching for all API endpoints to prevent history / bfcache exposure
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

app.get("/", (req, res) => {
  res.json({ message: "Fitness Tracker API is running" });
});

app.use("/api/auth", authroute);
app.use("/api/user", userroute);
app.use("/api/workouts", workoutroute);
app.use("/api/progress", progressrouter);
app.use("/api/nutrition", nutritionrouter);
app.use("/api/goals", goalroute);
app.use("/api/reminders", reminderroute);
app.use("/api/reports", reportroute);

app.listen(port, () => {
  console.log(`Server running at port = ${port}`);
});

export default app;
