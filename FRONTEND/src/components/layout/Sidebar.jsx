import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Dumbbell, Utensils, TrendingUp, Target,
  Bell, BarChart2, User, Settings, LogOut, Activity, X, Sun, Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Sidebar.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/workouts', label: 'Workouts', icon: Dumbbell },
  { path: '/nutrition', label: 'Nutrition', icon: Utensils },
  { path: '/progress', label: 'Progress', icon: TrendingUp },
  { path: '/goals', label: 'Goals', icon: Target },
  { path: '/reminders', label: 'Reminders', icon: Bell },
  { path: '/reports', label: 'Reports', icon: BarChart2 },
];

const bottomItems = [
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (onClose) onClose();
    navigate('/', { replace: true });
    try {
      await logout();
    } catch (e) {
      console.warn("Logout error:", e);
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Activity size={20} color="white" />
          </div>
          <span className="sidebar-logo-text">Fitness Tracker</span>
        </div>
        <button className="sidebar-close" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="sidebar-user">
        <div className="avatar avatar-md avatar-green" style={{ overflow: "hidden" }}>
          {user?.profilePic ? (
            <img
              src={user.profilePic}
              alt={user?.name || "avatar"}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            user?.name?.charAt(0) || "U"
          )}
        </div>
        <div className="sidebar-user-info">
          <span className="sidebar-user-name">{user?.name}</span>
          <span className="sidebar-user-email">{user?.email}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-nav-label">Main Menu</div>
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}

        <div className="sidebar-nav-label" style={{ marginTop: 16 }}>Account</div>
        {bottomItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          className="sidebar-logout"
          onClick={toggleTheme}
          style={{ marginBottom: 8 }}
          title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
        >
          {isDark ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} />}
          <span>{isDark ? "Light Mode" : "Dark Gym Mode"}</span>
        </button>

        <button className="sidebar-logout" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
