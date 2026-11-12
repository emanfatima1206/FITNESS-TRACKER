// Frontend Universal API Client with credentials: "include" for httpOnly cookies
const API_URL = "/api";

async function request(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const headers = { ...options.headers };

  // Set Content-Type only if not sending FormData
  if (!(options.body instanceof FormData)) {
    if (!headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
  }

  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// 1. Auth API
export const authApi = {
  register: async (userData) => {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },
  login: async (credentials) => {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },
  getProfile: async () => {
    return request("/auth/profile", {
      method: "GET",
    });
  },
  updateProfile: async (userData) => {
    return request("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },
  changePassword: async (passwords) => {
    return request("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(passwords),
    });
  },
  updatePreferences: async (preferences) => {
    return request("/auth/preferences", {
      method: "PUT",
      body: JSON.stringify(preferences),
    });
  },
  uploadAvatar: async (formData) => {
    return request("/auth/upload-avatar", {
      method: "POST",
      body: formData,
    });
  },
  logout: async () => {
    return request("/auth/logout", {
      method: "POST",
    });
  },
};

// User API alias
export const userApi = {
  getProfile: authApi.getProfile,
  updateProfile: authApi.updateProfile,
  changePassword: authApi.changePassword,
  updatePreferences: authApi.updatePreferences,
  uploadAvatar: authApi.uploadAvatar,
};

// 2. Workouts API
export const workoutApi = {
  getAll: async () => {
    return request("/workouts", { method: "GET" });
  },
  create: async (data) => {
    return request("/workouts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update: async (id, data) => {
    return request(`/workouts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  delete: async (id) => {
    return request(`/workouts/${id}`, {
      method: "DELETE",
    });
  },
};

// 3. Nutrition API
export const nutritionApi = {
  getAll: async (date) => {
    const url = date ? `/nutrition?date=${date}` : "/nutrition";
    return request(url, { method: "GET" });
  },
  create: async (data) => {
    return request("/nutrition", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update: async (id, data) => {
    return request(`/nutrition/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  delete: async (id) => {
    return request(`/nutrition/${id}`, {
      method: "DELETE",
    });
  },
};

// 4. Progress API
export const progressApi = {
  getAll: async () => {
    return request("/progress", { method: "GET" });
  },
  create: async (data) => {
    return request("/progress", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update: async (id, data) => {
    return request(`/progress/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  delete: async (id) => {
    return request(`/progress/${id}`, {
      method: "DELETE",
    });
  },
};

// 5. Goals API
export const goalApi = {
  getAll: async () => {
    return request("/goals", { method: "GET" });
  },
  create: async (data) => {
    return request("/goals", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update: async (id, data) => {
    return request(`/goals/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  delete: async (id) => {
    return request(`/goals/${id}`, {
      method: "DELETE",
    });
  },
};

// 6. Reminders API
export const reminderApi = {
  getAll: async () => {
    return request("/reminders", { method: "GET" });
  },
  create: async (data) => {
    return request("/reminders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update: async (id, data) => {
    return request(`/reminders/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  delete: async (id) => {
    return request(`/reminders/${id}`, {
      method: "DELETE",
    });
  },
  toggle: async (id, enabled) => {
    return request(`/reminders/${id}`, {
      method: "PUT",
      body: JSON.stringify({ enabled }),
    });
  },
};

// 7. Reports Analytics API (Computed from live database collections)
export const reportsApi = {
  getDashboardData: async () => {
    return request("/reports/dashboard", { method: "GET" });
  },
  getAnalytics: async (dateFrom, dateTo) => {
    const [wRes, nRes, pRes, gRes] = await Promise.all([
      workoutApi.getAll(),
      nutritionApi.getAll(),
      progressApi.getAll(),
      goalApi.getAll(),
    ]);

    const workouts = Array.isArray(wRes) ? wRes : (wRes?.workouts || []);
    const nutrition = Array.isArray(nRes) ? nRes : (nRes?.nutrition || []);
    const progress = Array.isArray(pRes) ? pRes : (pRes?.progress || []);
    const goals = Array.isArray(gRes) ? gRes : (gRes?.goals || []);

    const fromTime = dateFrom ? new Date(dateFrom).getTime() : 0;
    const toTime = dateTo ? new Date(dateTo + "T23:59:59").getTime() : Infinity;

    const filteredWorkouts = workouts.filter((w) => {
      const t = new Date(w.date).getTime();
      return t >= fromTime && t <= toTime;
    });

    const filteredNutrition = nutrition.filter((n) => {
      const t = new Date(n.date).getTime();
      return t >= fromTime && t <= toTime;
    });

    const totalWorkouts = filteredWorkouts.length;
    const totalDuration = filteredWorkouts.reduce((s, w) => s + (Number(w.duration) || 0), 0);
    const totalBurned = filteredWorkouts.reduce((s, w) => s + (Number(w.calories) || 0), 0);
    const avgWorkoutDur = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

    const totalConsumed = filteredNutrition.reduce((s, n) => s + (Number(n.calories) || 0), 0);
    const totalProtein = filteredNutrition.reduce((s, n) => s + (Number(n.protein) || 0), 0);
    const totalCarbs = filteredNutrition.reduce((s, n) => s + (Number(n.carbs) || 0), 0);
    const totalFats = filteredNutrition.reduce((s, n) => s + (Number(n.fats) || 0), 0);

    const goalsCount = goals.length;
    const goalsCompleted = goals.filter((g) => {
      if (g.status === "completed") return true;
      const target = Number(g.targetValue) || 0;
      const current = Number(g.currentValue) || 0;
      if (target > 0 && current >= target) return true;
      return false;
    }).length;

    const weightProgressData = progress
      .filter((p) => {
        const t = new Date(p.date).getTime();
        return t >= fromTime && t <= toTime;
      })
      .map((p) => ({
        date: new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        weight: Number(p.weight) || 0,
      }))
      .reverse();

    const typeCounts = {};
    filteredWorkouts.forEach((w) => {
      const type = w.type || "Other";
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    const workoutTypeData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

    const monthMap = {};
    filteredWorkouts.forEach((w) => {
      const m = new Date(w.date).toLocaleString("default", { month: "short" });
      if (!monthMap[m]) monthMap[m] = { month: m, workouts: 0, calories: 0 };
      monthMap[m].workouts += 1;
      monthMap[m].calories += Number(w.calories) || 0;
    });
    const monthlyActivity = Object.values(monthMap);

    return {
      success: true,
      stats: {
        totalWorkouts,
        totalDuration,
        totalBurned,
        avgWorkoutDur,
        totalConsumed,
        totalProtein,
        totalCarbs,
        totalFats,
        goalsCount,
        goalsCompleted,
      },
      weightProgressData,
      workoutTypeData,
      monthlyActivity,
    };
  },
};




