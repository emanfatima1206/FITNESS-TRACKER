import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  Dumbbell,
  Utensils,
  TrendingUp,
  Target,
  Bell,
  CheckCircle2,
  ArrowRight,
  Flame,
  Sun,
  Moon,
  Zap,
  Timer,
  Award,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import "./Home.css";

export default function Home() {
  const { isAuthenticated, logout, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.warn("Logout error:", e);
    }
  };

  return (
    <div className="home-container">
      {/* 1. Navbar */}
      <nav className="home-navbar">
        <div className="home-nav-content">
          <Link to="/" className="home-brand">
            <div className="home-brand-icon">
              <Activity size={24} />
            </div>
            <span>Fitness Tracker</span>
          </Link>

          {/* Clean Public Navigation Links */}
          <div className="home-nav-links">
            <a href="#hero">Home</a>
            <a href="#training">Training</a>
            <a href="#features">Features</a>
            <a href="#about">About</a>
          </div>

          <div className="home-nav-actions" style={{ gap: 10 }}>
            {/* Theme Toggle Button */}
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Gym Mode"}
            >
              {isDark ? <Sun size={16} color="#fbbf24" /> : <Moon size={16} />}
              <span>{isDark ? "Light" : "Dark"}</span>
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="btn btn-primary"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px" }}
                >
                  <LayoutDashboard size={15} />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px" }}
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary" style={{ padding: "8px 18px" }}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary" style={{ padding: "8px 20px" }}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section id="hero" className="home-hero">
        <div className="hero-text">
          <span className="hero-tag">
            <Zap size={15} /> Professional Gym & Fitness Platform
          </span>
          <h1>
            Transform Your Body. <br />
            <span className="highlight-text">Elevate Your Fitness.</span>
          </h1>
          <p>
            The all-in-one modern fitness tracker engineered for athletes and everyday gym goers.
            Record heavy lifts, monitor calories and macros, log body transformations, and stay disciplined with smart reminders.
          </p>

          <div className="hero-cta">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn btn-primary btn-lg" style={{ gap: 10 }}>
                  Open Dashboard <ArrowRight size={18} />
                </Link>
                <button onClick={handleLogout} className="btn btn-secondary btn-lg" style={{ gap: 8 }}>
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg" style={{ gap: 10 }}>
                  Start Training Now <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Member Login
                </Link>
              </>
            )}
          </div>

          <div className="hero-badges">
            <div className="hero-badge-item">
              <span className="hero-badge-number">100%</span>
              <span className="hero-badge-label">Private & Isolated Data</span>
            </div>
            <div className="hero-badge-item">
              <span className="hero-badge-number">6+</span>
              <span className="hero-badge-label">Active Trackers</span>
            </div>
            <div className="hero-badge-item">
              <span className="hero-badge-number">Real-Time</span>
              <span className="hero-badge-label">Visual Analytics</span>
            </div>
          </div>
        </div>

        {/* Hero Visual with Gym Athlete Image */}
        <div className="hero-visual-frame">
          <div className="hero-main-img-wrap">
            <img
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop"
              alt="Gym Training Athlete"
              className="hero-main-img"
            />
            <div className="hero-img-overlay" />
            <div className="hero-img-badge">
              <h4>High-Intensity Gym Performance</h4>
              <p>Track every rep, set, and calorie with precision</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Training Pillars Section */}
      <section id="training" className="home-showcase">
        <div className="section-head">
          <span className="hero-tag">Core Disciplines</span>
          <h2>Built for Every Gym Discipline</h2>
          <p>Whether lifting heavy iron, crushing cardio sessions, or dialing in meal prep, Fitness Tracker supports your exact goals.</p>
        </div>

        <div className="showcase-grid">
          <div className="showcase-card">
            <img
              src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop"
              alt="Strength Training"
              className="showcase-bg"
            />
            <div className="showcase-gradient" />
            <div className="showcase-content">
              <div className="showcase-icon">
                <Dumbbell size={20} />
              </div>
              <h3>Strength & Hypertrophy</h3>
              <p>Log bench, squat, deadlift sessions, duration, and calories burned.</p>
            </div>
          </div>

          <div className="showcase-card">
            <img
              src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop"
              alt="Cardio Conditioning"
              className="showcase-bg"
            />
            <div className="showcase-gradient" />
            <div className="showcase-content">
              <div className="showcase-icon">
                <Timer size={20} />
              </div>
              <h3>Cardio & HIIT</h3>
              <p>Monitor sprint sessions, cycling, and stamina conditioning metrics.</p>
            </div>
          </div>

          <div className="showcase-card">
            <img
              src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=600&auto=format&fit=crop"
              alt="Clean Nutrition"
              className="showcase-bg"
            />
            <div className="showcase-gradient" />
            <div className="showcase-content">
              <div className="showcase-icon">
                <Utensils size={20} />
              </div>
              <h3>Clean Fuel & Macros</h3>
              <p>Balance protein, carbs, and healthy fats across daily meals.</p>
            </div>
          </div>

          <div className="showcase-card">
            <img
              src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop"
              alt="Body Tracking"
              className="showcase-bg"
            />
            <div className="showcase-gradient" />
            <div className="showcase-content">
              <div className="showcase-icon">
                <TrendingUp size={20} />
              </div>
              <h3>Body Composition</h3>
              <p>Track weight trends, chest, waist, and arms measurements over time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Complete Application Features Grid */}
      <section id="features" className="home-features">
        <div className="section-head">
          <span className="hero-tag">Feature Suite</span>
          <h2>A Complete Fitness Tracking Architecture</h2>
          <p>Everything you need to stay accountable, monitor progress, and achieve your health targets.</p>
        </div>

        <div className="features-box-grid">
          <div className="feature-box">
            <div className="feature-box-icon" style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}>
              <Dumbbell size={28} />
            </div>
            <h3>Workout Management</h3>
            <p>
              Log exercises across Cardio, Strength, HIIT, and Sports. Filter by category, search workout logs, and record calories burned.
            </p>
          </div>

          <div className="feature-box">
            <div className="feature-box-icon" style={{ background: "var(--color-warning-light)", color: "var(--color-warning)" }}>
              <Utensils size={28} />
            </div>
            <h3>Nutrition & Meal Logging</h3>
            <p>
              Track Breakfast, Lunch, Dinner, and Snacks. Monitor daily protein, carbs, fats, and total calorie intake with date filters.
            </p>
          </div>

          <div className="feature-box">
            <div className="feature-box-icon" style={{ background: "var(--color-info-light)", color: "var(--color-info)" }}>
              <TrendingUp size={28} />
            </div>
            <h3>Body Progress Records</h3>
            <p>
              Log your body weight and circumference measurements (Chest, Waist, Hips, Arms). See weight drop trends on interactive charts.
            </p>
          </div>

          <div className="feature-box">
            <div className="feature-box-icon" style={{ background: "var(--color-purple-light)", color: "var(--color-purple)" }}>
              <Target size={28} />
            </div>
            <h3>Goal Milestones</h3>
            <p>
              Set target goals for weight loss or strength gains. Monitor progress percentages with live progress bars and deadline countdowns.
            </p>
          </div>

          <div className="feature-box">
            <div className="feature-box-icon" style={{ background: "var(--color-orange-light)", color: "var(--color-orange)" }}>
              <Bell size={28} />
            </div>
            <h3>Timely Reminders</h3>
            <p>
              Never miss gym time or a meal prep window. Create scheduled reminders with quick single-click enable and disable toggles.
            </p>
          </div>

          <div className="feature-box">
            <div className="feature-box-icon" style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}>
              <Award size={28} />
            </div>
            <h3>Interactive Reports</h3>
            <p>
              Analyze your monthly exercise frequency, energy expenditures, and macronutrient balance with clean Recharts visual charts.
            </p>
          </div>
        </div>
      </section>

      {/* 5. About Section */}
      <section id="about" className="home-about">
        <div className="about-card-modern">
          <div className="about-card-body">
            <span className="hero-tag">Built For Progression</span>
            <h2>Designed for Serious Fitness Progress</h2>
            <p>
              Fitness Tracker was created to provide a distraction-free, professional gym application experience.
              Whether you are training for muscle growth, endurance, or fat loss, this application keeps all your vital records in one organized workspace.
            </p>

            <ul className="about-checklist">
              <li>
                <CheckCircle2 size={18} /> Safe & private user accounts protected with JWT authentication
              </li>
              <li>
                <CheckCircle2 size={18} /> Full CRUD operations for all workouts, meals, and body measurements
              </li>
              <li>
                <CheckCircle2 size={18} /> Complete Dark Gym Mode & Clean Light Theme support
              </li>
              <li>
                <CheckCircle2 size={18} /> Mobile and desktop responsive design for the gym floor
              </li>
            </ul>

            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary" style={{ padding: "12px 24px" }}>
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/register" className="btn btn-primary" style={{ padding: "12px 24px" }}>
                Join Fitness Tracker Today
              </Link>
            )}
          </div>

          <div className="about-card-img-wrap">
            <img
              src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=900&auto=format&fit=crop"
              alt="Gym Equipment Atmosphere"
              className="about-card-img"
            />
          </div>
        </div>
      </section>

      {/* 6. Call to Action Banner */}
      <section className="home-cta-banner">
        <div className="cta-banner-inner">
          <h2>Ready to Crush Your Health Goals?</h2>
          <p>
            Join now, log your first workout in seconds, and track your transformation with clarity.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn btn-primary btn-lg">
                  Open Dashboard <ArrowRight size={18} />
                </Link>
                <button onClick={handleLogout} className="btn btn-secondary btn-lg" style={{ gap: 8 }}>
                  <LogOut size={18} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Create Free Account <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="home-brand-icon" style={{ width: 36, height: 36 }}>
              <Activity size={20} />
            </div>
            <span style={{ fontWeight: 800, fontSize: "1.2rem", letterSpacing: "-0.5px" }}>Fitness Tracker</span>
          </div>

          <div className="footer-links">
            <a href="#hero">Home</a>
            <a href="#training">Training</a>
            <a href="#features">Features</a>
            <a href="#about">About</a>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/profile">Profile</Link>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Fitness Tracker. All rights reserved. University eProject.</p>
        </div>
      </footer>
    </div>
  );
}
