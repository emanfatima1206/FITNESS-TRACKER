import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Weight,
  Flame,
  Dumbbell,
  Droplets,
  TrendingDown,
  Plus,
  Activity,
  Utensils,
  Target,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import StatCard from "../components/ui/StatCard";
import Modal from "../components/ui/Modal";
import { workoutApi, nutritionApi, progressApi, goalApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();

  // Simple state for each module
  const [workouts, setWorkouts] = useState([]);
  const [nutrition, setNutrition] = useState([]);
  const [progress, setProgress] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Action Modal states
  const [activeModal, setActiveModal] = useState(null);

  // Quick Form states
  const [workoutName, setWorkoutName] = useState("");
  const [workoutType, setWorkoutType] = useState("Cardio");
  const [workoutDuration, setWorkoutDuration] = useState("30");
  const [workoutCalories, setWorkoutCalories] = useState("200");

  const [foodName, setFoodName] = useState("");
  const [mealType, setMealType] = useState("Breakfast");
  const [foodCalories, setFoodCalories] = useState("300");
  const [protein, setProtein] = useState("15");
  const [carbs, setCarbs] = useState("40");
  const [fats, setFats] = useState("10");

  const [weight, setWeight] = useState("");
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTarget, setGoalTarget] = useState("70");

  // Load all user data from backend
  const loadData = async () => {
    try {
      setLoading(true);
      const [wData, nData, pData, gData] = await Promise.all([
        workoutApi.getAll(),
        nutritionApi.getAll(),
        progressApi.getAll(),
        goalApi.getAll(),
      ]);

      setWorkouts(Array.isArray(wData) ? wData : wData.workouts || []);
      setNutrition(Array.isArray(nData) ? nData : nData.nutrition || []);
      setProgress(Array.isArray(pData) ? pData : pData.progress || []);
      setGoals(Array.isArray(gData) ? gData : gData.goals || []);
    } catch (err) {
      console.log("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Quick Add Workout
  const handleAddWorkout = async (e) => {
    e.preventDefault();
    if (!workoutName) return;
    try {
      await workoutApi.create({
        name: workoutName,
        type: workoutType,
        duration: Number(workoutDuration) || 0,
        calories: Number(workoutCalories) || 0,
        date: new Date(),
      });
      setWorkoutName("");
      setActiveModal(null);
      await loadData();
    } catch (err) {
      alert(err.message || "Failed to add workout");
    }
  };

  // Quick Add Food
  const handleAddFood = async (e) => {
    e.preventDefault();
    if (!foodName) return;
    try {
      await nutritionApi.create({
        foodName,
        mealType,
        calories: Number(foodCalories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fats: Number(fats) || 0,
        date: new Date(),
      });
      setFoodName("");
      setActiveModal(null);
      await loadData();
    } catch (err) {
      alert(err.message || "Failed to add food log");
    }
  };

  // Quick Add Progress
  const handleAddProgress = async (e) => {
    e.preventDefault();
    if (!weight) return;
    try {
      await progressApi.create({
        weight: Number(weight),
        date: new Date(),
      });
      setWeight("");
      setActiveModal(null);
      await loadData();
    } catch (err) {
      alert(err.message || "Failed to save weight");
    }
  };

  // Quick Add Goal
  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!goalTitle) return;
    try {
      await goalApi.create({
        title: goalTitle,
        targetValue: Number(goalTarget) || 70,
        currentValue: progress[0]?.weight || user?.weight || 0,
        unit: "kg",
      });
      setGoalTitle("");
      setActiveModal(null);
      await loadData();
    } catch (err) {
      alert(err.message || "Failed to create goal");
    }
  };

  // Calculated statistics from real backend state
  const currentWeight = progress[0]?.weight || user?.weight || "—";
  const totalWorkouts = workouts.length;
  const totalDuration = workouts.reduce((s, w) => s + (Number(w.duration) || 0), 0);
  const totalCaloriesBurned = workouts.reduce((s, w) => s + (Number(w.calories) || 0), 0);
  const totalCaloriesConsumed = nutrition.reduce((s, n) => s + (Number(n.calories) || 0), 0);
  const totalProtein = nutrition.reduce((s, n) => s + (Number(n.protein) || 0), 0);
  const totalCarbs = nutrition.reduce((s, n) => s + (Number(n.carbs) || 0), 0);
  const totalFats = nutrition.reduce((s, n) => s + (Number(n.fats) || 0), 0);
  const completedGoals = goals.filter(
    (g) => g.status === "completed" || (Number(g.currentValue) >= Number(g.targetValue) && Number(g.targetValue) > 0)
  ).length;

  // Weekly workout chart data (grouped by day)
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyData = days.map((dayName, idx) => {
    const dayWorkouts = workouts.filter((w) => new Date(w.date).getDay() === idx);
    const cals = dayWorkouts.reduce((s, w) => s + (Number(w.calories) || 0), 0);
    const mins = dayWorkouts.reduce((s, w) => s + (Number(w.duration) || 0), 0);
    return { day: dayName, calories: cals, duration: mins };
  });

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      {/* Welcome Banner */}
      <div className="dashboard-welcome">
        <div className="dashboard-welcome-left">
          <div className="dashboard-welcome-tag">
            <Flame size={13} /> Gym & Fitness Hub
          </div>
          <h1>Ready to crush it, {user?.name || user?.username}? 🔥</h1>
          <p>
            Track your sets, hit your daily macronutrients, and monitor your body transformation.
          </p>
        </div>
        <div className="dashboard-quick-actions">
          <button className="btn btn-primary" onClick={() => setActiveModal("workout")}>
            <Plus size={16} /> Add Workout
          </button>
          <button className="btn btn-secondary" onClick={() => setActiveModal("nutrition")}>
            <Plus size={16} /> Add Food
          </button>
          <button className="btn btn-secondary" onClick={() => setActiveModal("progress")}>
            <Plus size={16} /> Log Weight
          </button>
          <button className="btn btn-secondary" onClick={() => setActiveModal("goal")}>
            <Plus size={16} /> Set Goal
          </button>
          <button className="btn btn-secondary" onClick={loadData} title="Refresh">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* 5 Summary Cards */}
      <div className="grid-cols-5 mb-6">
        <StatCard
          label="Current Weight"
          value={currentWeight}
          unit={typeof currentWeight === 'number' ? " kg" : ""}
          change="latest measurement"
          changeType="positive"
          icon={Weight}
          iconBg="var(--color-primary-light)"
          iconColor="var(--color-primary)"
        />
        <StatCard
          label="Calories Consumed"
          value={totalCaloriesConsumed}
          unit=" kcal"
          change="from logged food"
          changeType="positive"
          icon={Flame}
          iconBg="var(--color-warning-light)"
          iconColor="var(--color-warning)"
        />
        <StatCard
          label="Total Workouts"
          value={totalWorkouts}
          unit=" sessions"
          change={`${totalCaloriesBurned} kcal burned`}
          changeType="positive"
          icon={Dumbbell}
          iconBg="var(--color-info-light)"
          iconColor="var(--color-info)"
        />
        <StatCard
          label="Workout Duration"
          value={totalDuration}
          unit=" min"
          change="total active time"
          changeType="positive"
          icon={Droplets}
          iconBg="var(--color-purple-light)"
          iconColor="var(--color-purple)"
        />
        <StatCard
          label="Completed Goals"
          value={`${completedGoals} / ${goals.length}`}
          unit=" targets"
          change="fitness milestones"
          changeType="positive"
          icon={TrendingDown}
          iconBg="var(--color-orange-light)"
          iconColor="var(--color-orange)"
        />
      </div>

      {/* Charts Row */}
      <div className="grid-cols-2 mb-6">
        {/* Weekly Activity Bar Chart */}
        <div className="card">
          <div className="card-header">
            <h3>Weekly Workout Activity</h3>
            <span className="badge badge-green">Live Workouts</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "var(--color-text-muted)" }} />
                <YAxis tick={{ fontSize: 12, fill: "var(--color-text-muted)" }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  itemStyle={{ color: "var(--color-text)" }}
                />
                <Bar dataKey="calories" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="Calories (kcal)" />
                <Bar dataKey="duration" fill="var(--color-primary-light)" radius={[4, 4, 0, 0]} name="Duration (min)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Calories Consumed vs Burned */}
        <div className="card">
          <div className="card-header">
            <h3>Energy Balance</h3>
            <span className="badge badge-blue">Calories</span>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 10 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: "0.875rem" }}>
                  <span>Calories Consumed</span>
                  <strong>{totalCaloriesConsumed} kcal</strong>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${Math.min(100, (totalCaloriesConsumed / 2000) * 100)}%`, background: "var(--color-warning)" }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: "0.875rem" }}>
                  <span>Calories Burned</span>
                  <strong>{totalCaloriesBurned} kcal</strong>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${Math.min(100, (totalCaloriesBurned / 1000) * 100)}%`, background: "var(--color-primary)" }}
                  />
                </div>
              </div>

              <div style={{ padding: "12px", background: "var(--color-bg)", borderRadius: "var(--radius)", fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                Net Calorie Balance: <strong>{totalCaloriesConsumed - totalCaloriesBurned} kcal</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid-cols-3 mb-6">
        {/* Macronutrients */}
        <div className="card">
          <div className="card-header">
            <h3>Today&apos;s Macros</h3>
            <span className="text-sm text-muted">{nutrition.length} items logged</span>
          </div>
          <div className="card-body">
            <div className="nutrition-macro-row">
              <div className="nutrition-macro-item">
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Protein</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-primary)" }}>{totalProtein}g</div>
              </div>
              <div className="nutrition-macro-item">
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Carbs</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-warning)" }}>{totalCarbs}g</div>
              </div>
              <div className="nutrition-macro-item">
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Fats</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-info)" }}>{totalFats}g</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Workouts */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Workouts</h3>
            <Link to="/workouts" style={{ fontSize: "0.8125rem" }}>View All</Link>
          </div>
          <div className="card-body" style={{ padding: "12px 20px" }}>
            {workouts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px", color: "var(--color-text-muted)" }}>
                No workouts added yet.
              </div>
            ) : (
              workouts.slice(0, 3).map((w, i) => (
                <div key={w._id || i} className="today-workout-item">
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="workout-status-dot" />
                    <div>
                      <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>{w.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                        {w.duration} min · {w.calories} kcal
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-gray">{w.type}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Goals Progress */}
        <div className="card">
          <div className="card-header">
            <h3>Goals Overview</h3>
            <Link to="/goals" style={{ fontSize: "0.8125rem" }}>View All</Link>
          </div>
          <div className="card-body" style={{ padding: "12px 20px" }}>
            {goals.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px", color: "var(--color-text-muted)" }}>
                No goals set yet.
              </div>
            ) : (
              goals.slice(0, 3).map((g, i) => (
                <div key={g._id || i} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: 4 }}>
                    <strong>{g.title}</strong>
                    <span>{g.currentValue} / {g.targetValue} {g.unit}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.min(100, Math.round(((g.currentValue || 0) / (g.targetValue || 1)) * 100))}%`,
                        background: "var(--color-primary)",
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* QUICK ADD WORKOUT MODAL */}
      <Modal isOpen={activeModal === "workout"} onClose={() => setActiveModal(null)} title="Quick Add Workout">
        <form onSubmit={handleAddWorkout}>
          <div className="form-group">
            <label className="form-label">Workout Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. 5km Morning Jog"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-control" value={workoutType} onChange={(e) => setWorkoutType(e.target.value)}>
                <option>Cardio</option>
                <option>Strength</option>
                <option>HIIT</option>
                <option>Flexibility</option>
                <option>Sports</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Duration (min)</label>
              <input
                type="number"
                className="form-control"
                value={workoutDuration}
                onChange={(e) => setWorkoutDuration(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Calories Burned</label>
            <input
              type="number"
              className="form-control"
              value={workoutCalories}
              onChange={(e) => setWorkoutCalories(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add Workout</button>
          </div>
        </form>
      </Modal>

      {/* QUICK ADD NUTRITION MODAL */}
      <Modal isOpen={activeModal === "nutrition"} onClose={() => setActiveModal(null)} title="Quick Add Food">
        <form onSubmit={handleAddFood}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Food Item *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Grilled Chicken Bowl"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Meal Type</label>
              <select className="form-control" value={mealType} onChange={(e) => setMealType(e.target.value)}>
                <option>Breakfast</option>
                <option>Lunch</option>
                <option>Dinner</option>
                <option>Snacks</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Calories (kcal)</label>
              <input
                type="number"
                className="form-control"
                value={foodCalories}
                onChange={(e) => setFoodCalories(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Protein (g)</label>
              <input
                type="number"
                className="form-control"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Log Food</button>
          </div>
        </form>
      </Modal>

      {/* QUICK ADD PROGRESS MODAL */}
      <Modal isOpen={activeModal === "progress"} onClose={() => setActiveModal(null)} title="Quick Log Weight">
        <form onSubmit={handleAddProgress}>
          <div className="form-group">
            <label className="form-label">Current Weight (kg) *</label>
            <input
              type="number"
              step="0.1"
              className="form-control"
              placeholder="e.g. 74.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
            />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Weight</button>
          </div>
        </form>
      </Modal>

      {/* QUICK ADD GOAL MODAL */}
      <Modal isOpen={activeModal === "goal"} onClose={() => setActiveModal(null)} title="Quick Set Goal">
        <form onSubmit={handleAddGoal}>
          <div className="form-group">
            <label className="form-label">Goal Title *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Target weight 70kg"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Target Weight (kg) *</label>
            <input
              type="number"
              className="form-control"
              value={goalTarget}
              onChange={(e) => setGoalTarget(e.target.value)}
              required
            />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Goal</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
