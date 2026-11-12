export const workouts = [
  { id: 1, name: 'Morning Run', type: 'Cardio', duration: 45, calories: 420, date: '2026-11-11', notes: 'Felt great today!' },
  { id: 2, name: 'Upper Body Strength', type: 'Strength', duration: 60, calories: 380, date: '2026-11-10', notes: 'Increased bench press weight' },
  { id: 3, name: 'Yoga Flow', type: 'Flexibility', duration: 30, calories: 120, date: '2026-11-09', notes: '' },
  { id: 4, name: 'Cycling', type: 'Cardio', duration: 55, calories: 480, date: '2026-11-08', notes: 'Hill intervals' },
  { id: 5, name: 'Leg Day', type: 'Strength', duration: 70, calories: 450, date: '2026-11-07', notes: 'Squats PR!' },
  { id: 6, name: 'Swimming', type: 'Cardio', duration: 40, calories: 350, date: '2026-11-06', notes: '' },
  { id: 7, name: 'HIIT Circuit', type: 'HIIT', duration: 25, calories: 300, date: '2026-11-05', notes: 'Intense session' },
];

export const nutritionEntries = [
  { id: 1, name: 'Oatmeal with Berries', meal: 'Breakfast', calories: 320, protein: 12, carbs: 54, fats: 6, date: '2026-11-11' },
  { id: 2, name: 'Greek Yogurt', meal: 'Breakfast', calories: 150, protein: 17, carbs: 10, fats: 3, date: '2026-11-11' },
  { id: 3, name: 'Grilled Chicken Salad', meal: 'Lunch', calories: 480, protein: 42, carbs: 22, fats: 24, date: '2026-11-11' },
  { id: 4, name: 'Protein Shake', meal: 'Snacks', calories: 220, protein: 30, carbs: 15, fats: 4, date: '2026-11-11' },
  { id: 5, name: 'Salmon with Veggies', meal: 'Dinner', calories: 520, protein: 44, carbs: 18, fats: 28, date: '2026-11-11' },
  { id: 6, name: 'Apple', meal: 'Snacks', calories: 80, protein: 0, carbs: 21, fats: 0, date: '2026-11-11' },
];

export const progressEntries = [
  { id: 1, date: '2026-11-11', weight: 75.0, chest: 98, waist: 82, hips: 95, arms: 36, notes: 'Feeling good' },
  { id: 2, date: '2026-11-04', weight: 75.5, chest: 98, waist: 83, hips: 95, arms: 36, notes: '' },
  { id: 3, date: '2026-10-28', weight: 76.2, chest: 99, waist: 84, hips: 96, arms: 35.5, notes: '' },
  { id: 4, date: '2026-10-21', weight: 77.0, chest: 100, waist: 85, hips: 96, arms: 35, notes: 'Started new program' },
  { id: 5, date: '2026-10-14', weight: 77.8, chest: 100, waist: 86, hips: 97, arms: 35, notes: '' },
  { id: 6, date: '2026-10-07', weight: 78.5, chest: 101, waist: 87, hips: 98, arms: 34.5, notes: '' },
];

export const goals = [
  { id: 1, title: 'Lose 5kg', category: 'Weight', target: 70, current: 75, unit: 'kg', deadline: '2027-01-31', direction: 'decrease' },
  { id: 2, title: 'Run 5km', category: 'Cardio', target: 5, current: 3.8, unit: 'km', deadline: '2026-12-31', direction: 'increase' },
  { id: 3, title: 'Bench Press 100kg', category: 'Strength', target: 100, current: 85, unit: 'kg', deadline: '2027-02-28', direction: 'increase' },
  { id: 4, title: 'Workout 5x/week', category: 'Consistency', target: 5, current: 4, unit: 'days', deadline: '2026-12-31', direction: 'increase' },
  { id: 5, title: 'Drink 3L Water Daily', category: 'Hydration', target: 3, current: 2.3, unit: 'L', deadline: '2026-12-01', direction: 'increase' },
];

export const reminders = [
  { id: 1, title: 'Morning Workout', datetime: '2026-11-12T07:00', type: 'Workout', enabled: true },
  { id: 2, title: 'Take Vitamins', datetime: '2026-11-12T08:30', type: 'Health', enabled: true },
  { id: 3, title: 'Log Lunch Nutrition', datetime: '2026-11-12T13:00', type: 'Nutrition', enabled: true },
  { id: 4, title: 'Evening Run', datetime: '2026-11-12T18:00', type: 'Workout', enabled: false },
  { id: 5, title: 'Drink Water', datetime: '2026-11-12T10:00', type: 'Hydration', enabled: true },
  { id: 6, title: 'Weekly Progress Check', datetime: '2026-11-14T09:00', type: 'Progress', enabled: true },
];

export const weeklyWorkoutData = [
  { day: 'Mon', workouts: 1, calories: 420, duration: 45 },
  { day: 'Tue', workouts: 1, calories: 380, duration: 60 },
  { day: 'Wed', workouts: 0, calories: 0, duration: 0 },
  { day: 'Thu', workouts: 1, calories: 480, duration: 55 },
  { day: 'Fri', workouts: 1, calories: 450, duration: 70 },
  { day: 'Sat', workouts: 1, calories: 350, duration: 40 },
  { day: 'Sun', workouts: 1, calories: 300, duration: 25 },
];

export const monthlyCalorieData = [
  { week: 'W1', consumed: 1950, burned: 2200 },
  { week: 'W2', consumed: 2100, burned: 2350 },
  { week: 'W3', consumed: 1850, burned: 2100 },
  { week: 'W4', consumed: 2000, burned: 2280 },
];

export const weightProgressData = [
  { date: 'Oct 7', weight: 78.5 },
  { date: 'Oct 14', weight: 77.8 },
  { date: 'Oct 21', weight: 77.0 },
  { date: 'Oct 28', weight: 76.2 },
  { date: 'Nov 4', weight: 75.5 },
  { date: 'Nov 11', weight: 75.0 },
];

export const recentActivities = [
  { id: 1, type: 'workout', message: 'Completed Morning Run (45 min)', time: '2 hours ago', icon: 'activity' },
  { id: 2, type: 'nutrition', message: 'Logged Grilled Chicken Salad (480 cal)', time: '4 hours ago', icon: 'utensils' },
  { id: 3, type: 'goal', message: 'Goal progress updated: Run 5km', time: '1 day ago', icon: 'target' },
  { id: 4, type: 'progress', message: 'Weekly weight logged: 75.0 kg', time: '1 day ago', icon: 'trending-down' },
  { id: 5, type: 'workout', message: 'Completed Upper Body Strength (60 min)', time: '2 days ago', icon: 'dumbbell' },
];
