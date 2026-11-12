import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Search, Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Header.css';

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();


  const handleLogout = async () => {
    navigate('/', { replace: true });
    try {
      await logout();
    } catch (e) {
      console.warn("Logout error:", e);
    }
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <header className="header">
      <div className="header-left">
        <button className="header-menu-btn" onClick={onMenuClick}>
          <Menu size={22} />
        </button>
        <div className="header-search">
          <Search size={16} className="header-search-icon" />
          <input type="text" placeholder="Search workouts, meals, goals..." className="header-search-input" />
        </div>
      </div>
      <div className="header-right">
        <span className="header-date">{today}</span>
        
        {/* Light / Dark Mode Toggle */}
        <button
          className="btn-icon"
          onClick={toggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          style={{
            background: isDark ? "rgba(255,255,255,0.08)" : "var(--color-bg)",
            color: isDark ? "#fbbf24" : "var(--color-text)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius)",
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.8125rem",
            fontWeight: 500,
            cursor: "pointer"
          }}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
          <span>{isDark ? "Light" : "Dark"}</span>
        </button>

        <button className="btn-icon" title="Notifications">
          <Bell size={18} />
        </button>

        <div className="header-user" style={{ cursor: "pointer" }} onClick={() => navigate('/profile')}>
          <div className="avatar avatar-sm avatar-green" style={{ overflow: "hidden" }}>
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
          <span className="header-username">{user?.name}</span>
        </div>

        {/* Header Logout Button */}
        <button
          className="btn-icon"
          onClick={handleLogout}
          title="Sign Out / Logout to Home Page"
          style={{
            color: "var(--color-danger)",
            marginLeft: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
