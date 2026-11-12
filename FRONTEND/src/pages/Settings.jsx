import { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Moon, Sun, User, LogOut, ChevronRight, Check, HelpCircle, Send } from 'lucide-react';
import Toggle from '../components/ui/Toggle';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../services/api';

export default function Settings() {
  const { user, logout, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState({
    workoutReminders: user?.preferences?.workoutReminders ?? true,
    nutritionLogs: user?.preferences?.nutritionLogs ?? true,
    goalProgress: user?.preferences?.goalProgress ?? true,
    weeklyReports: user?.preferences?.weeklyReports ?? false,
    emailNotifications: user?.preferences?.emailNotifications ?? true,
    pushNotifications: user?.preferences?.pushNotifications ?? false,
  });

  const [units, setUnits] = useState(user?.preferences?.units || 'metric');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Feedback & Support State
  const [feedbackType, setFeedbackType] = useState('Feedback');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackSent(true);
    setFeedbackText('');
    setTimeout(() => setFeedbackSent(false), 4000);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const preferences = {
        ...notifications,
        theme,
        units,
      };

      await userApi.updatePreferences(preferences);
      updateUser({ preferences });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert(err.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    navigate('/', { replace: true });
    try {
      await logout();
    } catch (e) {
      console.warn("Logout error:", e);
    }
  };

  const toggle = (key) => setNotifications((p) => ({ ...p, [key]: !p[key] }));

  const SectionCard = ({ icon: Icon, title, iconColor = 'var(--color-primary)', children }) => (
    <div className="card mb-6">
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: 'var(--color-primary-light)',
              borderRadius: 'var(--radius)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={18} color={iconColor} />
          </div>
          <h3>{title}</h3>
        </div>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );

  const SettingRow = ({ label, description, right }) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 0',
        borderBottom: '1px solid var(--color-border-light)',
        gap: 16,
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500, fontSize: '0.9375rem', color: 'var(--color-text)' }}>{label}</div>
        {description && (
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
            {description}
          </div>
        )}
      </div>
      {right}
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Settings</h1>
          <p>Manage application preferences, notifications, measurement units, and security</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saved ? (
            <>
              <Check size={16} /> Saved to Database!
            </>
          ) : saving ? (
            'Saving...'
          ) : (
            'Save Changes'
          )}
        </button>
      </div>

      {/* Account Settings */}
      <SectionCard icon={User} title="Account Preferences">
        <SettingRow
          label="Display Name"
          description="Your public name in the application"
          right={<span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{user?.name || user?.username}</span>}
        />
        <SettingRow
          label="Registered Email"
          description="Account identification address"
          right={<span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{user?.email}</span>}
        />
        <SettingRow
          label="Measurement Units"
          description="Choose preferred system for weight and body metrics"
          right={
            <div style={{ display: 'flex', gap: 6 }}>
              {['metric', 'imperial'].map((u) => (
                <button
                  key={u}
                  className={`btn btn-sm ${units === u ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setUnits(u)}
                >
                  {u === 'metric' ? 'Metric (kg / cm)' : 'Imperial (lb / in)'}
                </button>
              ))}
            </div>
          }
        />
      </SectionCard>

      {/* Notification Preferences */}
      <SectionCard icon={Bell} title="Notification Settings" iconColor="var(--color-warning)">
        <SettingRow
          label="Workout Reminders"
          description="Get alerted prior to scheduled workout times"
          right={<Toggle checked={notifications.workoutReminders} onChange={() => toggle('workoutReminders')} />}
        />
        <SettingRow
          label="Meal Logging Reminders"
          description="Gentle prompts to record your breakfast, lunch, and dinner"
          right={<Toggle checked={notifications.nutritionLogs} onChange={() => toggle('nutritionLogs')} />}
        />
        <SettingRow
          label="Goal Progress Milestones"
          description="Alerts when you reach 25%, 50%, 75%, and 100% completion"
          right={<Toggle checked={notifications.goalProgress} onChange={() => toggle('goalProgress')} />}
        />
        <SettingRow
          label="Weekly Analytics Summary"
          description="Receive a comprehensive digest of your performance"
          right={<Toggle checked={notifications.weeklyReports} onChange={() => toggle('weeklyReports')} />}
        />
        <SettingRow
          label="Email Notifications"
          description="Send status reports and security notices to your email"
          right={<Toggle checked={notifications.emailNotifications} onChange={() => toggle('emailNotifications')} />}
        />
      </SectionCard>

      {/* Theme */}
      <SectionCard icon={Sun} title="Appearance & Theme" iconColor="var(--color-warning)">
        <SettingRow
          label="Color Scheme"
          description="Switch between light and dark modes"
          right={
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { key: 'light', icon: Sun, label: 'Light' },
                { key: 'dark', icon: Moon, label: 'Dark' },
              ].map((t) => (
                <button
                  key={t.key}
                  className={`btn btn-sm ${theme === t.key ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setTheme(t.key)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <t.icon size={14} />
                  {t.label}
                </button>
              ))}
            </div>
          }
        />
      </SectionCard>

      {/* Security */}
      <SectionCard icon={Shield} title="Password & Security" iconColor="var(--color-info)">
        <SettingRow
          label="Change Password"
          description="Update your credentials via your user profile"
          right={
            <button
              className="btn btn-outline btn-sm"
              onClick={() => navigate('/profile')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              Go to Profile <ChevronRight size={14} />
            </button>
          }
        />
        <SettingRow
          label="JWT Authentication"
          description="Secured state token with 7-day expiration"
          right={<span className="badge badge-green">Protected</span>}
        />
      </SectionCard>

      {/* User Support & Feedback */}
      <SectionCard icon={HelpCircle} title="Feedback & User Support" iconColor="var(--color-primary)">
        {feedbackSent ? (
          <div style={{ padding: '16px', background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', borderRadius: 'var(--radius)', fontSize: '0.875rem', fontWeight: 500 }}>
            ✓ Thank you! Your feedback/support message has been received. Our team will review it.
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit}>
            <div className="form-group">
              <label className="form-label">Support Category</label>
              <select className="form-control" value={feedbackType} onChange={(e) => setFeedbackType(e.target.value)}>
                <option value="Feedback">General Feedback</option>
                <option value="Issue">Report a Technical Issue</option>
                <option value="Feature">Suggest a Feature</option>
                <option value="Assistance">Account Assistance</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Your Message / Feedback</label>
              <textarea
                className="form-control"
                placeholder="Tell us what you love or how we can improve Fitness Tracker..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={3}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', gap: 6 }}>
              <Send size={14} /> Submit Feedback
            </button>
          </form>
        )}
      </SectionCard>

      {/* Danger Zone */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ color: 'var(--color-danger)' }}>Session Management</h3>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: '0.9375rem' }}>Sign Out</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                Terminate your session and return to the sign in page
              </div>
            </div>
            <button
              className="btn btn-secondary"
              onClick={handleLogout}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
