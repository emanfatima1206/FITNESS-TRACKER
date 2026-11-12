import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ label, value, unit, change, changeType, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="stat-card">
      {Icon && (
        <div className="stat-card-icon" style={{ background: iconBg || 'var(--color-primary-light)' }}>
          <Icon size={22} color={iconColor || 'var(--color-primary)'} />
        </div>
      )}
      <div className="stat-card-info">
        <div className="stat-card-label">{label}</div>
        <div className="stat-card-value">
          {value}<span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>{unit}</span>
        </div>
        {change !== undefined && (
          <div className={`stat-card-change ${changeType}`}>
            {changeType === 'positive' ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {change}
          </div>
        )}
      </div>
    </div>
  );
}
