import { useState, useEffect, useCallback } from 'react';
import { BarChart2, Calendar, Flame, Dumbbell, TrendingDown, RefreshCw, Download, Printer } from 'lucide-react';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import LoadingState from '../components/ui/LoadingState';
import ErrorMessage from '../components/ui/ErrorMessage';
import { reportsApi } from '../services/api';

const COLORS = ['#16a34a', '#3b82f6', '#f59e0b', '#8b5cf6', '#f97316', '#ef4444'];

export default function Reports() {
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 2);
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await reportsApi.getAnalytics(dateFrom, dateTo);
      if (res?.success) {
        setData(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch analytics from server.');
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const stats = data?.stats || {
    totalWorkouts: 0,
    totalDuration: 0,
    totalBurned: 0,
    avgWorkoutDur: 0,
    totalConsumed: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
    goalsCount: 0,
    goalsCompleted: 0,
  };

  const weightProgressData = data?.weightProgressData || [];
  const workoutTypeData = data?.workoutTypeData || [];
  const monthlyActivity = data?.monthlyActivity || [];

  const handleExportCSV = () => {
    const csvRows = [
      ["Fitness Tracker Progress & Analytics Report"],
      [`Generated Date Range: ${dateFrom} to ${dateTo}`],
      [],
      ["Metric", "Value", "Unit"],
      ["Total Recorded Workouts", stats.totalWorkouts, "sessions"],
      ["Total Workout Duration", stats.totalDuration, "minutes"],
      ["Average Workout Duration", stats.avgWorkoutDur, "minutes"],
      ["Calories Expended", stats.totalBurned, "kcal"],
      ["Calories Consumed", stats.totalConsumed, "kcal"],
      ["Total Protein", stats.totalProtein, "grams"],
      ["Total Carbohydrates", stats.totalCarbs, "grams"],
      ["Total Fats", stats.totalFats, "grams"],
      ["Goals Met", `${stats.goalsCompleted}/${stats.goalsCount}`, "goals"],
      [],
      ["Date", "Body Weight (kg)"],
      ...weightProgressData.map((d) => [d.date, d.weight]),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Fitness_Report_${dateFrom}_to_${dateTo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Reports & Analytics</h1>
          <p>Historical trends and statistical breakdown of your fitness data</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="date"
            className="form-control"
            style={{ width: 'auto' }}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>to</span>
          <input
            type="date"
            className="form-control"
            style={{ width: 'auto' }}
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          <button className="btn btn-secondary" onClick={fetchAnalytics} title="Update Analytics">
            <RefreshCw size={15} />
          </button>
          <button className="btn btn-secondary" onClick={handleExportCSV} title="Export Report as CSV">
            <Download size={15} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={handlePrintPDF} title="Print or Save as PDF">
            <Printer size={15} /> Print / PDF
          </button>
        </div>
      </div>

      {error && <ErrorMessage title="Analytics Notice" message={error} onRetry={fetchAnalytics} />}

      {loading && !data ? (
        <LoadingState message="Aggregating database reports and metrics..." />
      ) : (
        <>
          {/* Key Stat Cards */}
          <div className="grid-cols-4 mb-6">
            {[
              {
                label: 'Total Workouts',
                value: stats.totalWorkouts,
                unit: 'sessions',
                icon: Dumbbell,
                iconBg: 'var(--color-primary-light)',
                iconColor: 'var(--color-primary)',
              },
              {
                label: 'Calories Burned',
                value: stats.totalBurned.toLocaleString(),
                unit: 'kcal',
                icon: Flame,
                iconBg: 'var(--color-warning-light)',
                iconColor: 'var(--color-warning)',
              },
              {
                label: 'Calories Consumed',
                value: stats.totalConsumed.toLocaleString(),
                unit: 'kcal',
                icon: BarChart2,
                iconBg: 'var(--color-info-light)',
                iconColor: 'var(--color-info)',
              },
              {
                label: 'Goals Met',
                value: `${stats.goalsCompleted}/${stats.goalsCount}`,
                unit: 'completed',
                icon: TrendingDown,
                iconBg: 'var(--color-purple-light)',
                iconColor: 'var(--color-purple)',
              },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <div className="stat-card-icon" style={{ background: s.iconBg }}>
                  <s.icon size={22} color={s.iconColor} />
                </div>
                <div className="stat-card-info">
                  <div className="stat-card-label">{s.label}</div>
                  <div className="stat-card-value">
                    {s.value}
                    <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--color-text-secondary)' }}>
                      {' '}
                      {s.unit}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row 1: Weight Progression & Workout Types */}
          <div className="grid-cols-3 mb-6">
            <div className="card" style={{ gridColumn: 'span 2' }}>
              <div className="card-header">
                <h3>Weight Progression Timeline</h3>
                <span className="badge badge-green">Live Log</span>
              </div>
              <div className="card-body">
                {weightProgressData.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>
                    No weight records logged in this interval.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={weightProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
                      <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} domain={['auto', 'auto']} />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text)',
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        itemStyle={{ color: 'var(--color-text)' }}
                        formatter={(v) => [`${v} kg`, 'Weight']}
                      />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="var(--color-primary)"
                        strokeWidth={2.5}
                        dot={{ fill: 'var(--color-primary)', r: 4, stroke: 'var(--color-surface)' }}
                        name="Weight"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Workout Distribution</h3>
              </div>
              <div className="card-body">
                {workoutTypeData.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>
                    No workout types recorded.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={workoutTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {workoutTypeData.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text)',
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        itemStyle={{ color: 'var(--color-text)' }}
                      />
                      <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Charts Row 2: Monthly Activity */}
          <div className="card mb-6">
            <div className="card-header">
              <h3>Monthly Activity & Volume</h3>
              <span className="badge badge-blue">Monthly Aggregation</span>
            </div>
            <div className="card-body">
              {monthlyActivity.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>
                  No monthly activity data yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthlyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text)',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      itemStyle={{ color: 'var(--color-text)' }}
                    />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                    <Bar
                      yAxisId="left"
                      dataKey="workouts"
                      fill="var(--color-primary)"
                      radius={[4, 4, 0, 0]}
                      name="Workouts"
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="calories"
                      fill="var(--color-warning)"
                      radius={[4, 4, 0, 0]}
                      name="Calories Burned"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Statistical Breakdown Tables */}
          <div className="grid-cols-2 mb-6">
            <div className="card">
              <div className="card-header">
                <h3>Macronutrient Summary</h3>
              </div>
              <div className="card-body">
                {[
                  {
                    label: 'Total Calories Consumed',
                    value: stats.totalConsumed,
                    unit: 'kcal',
                    color: 'var(--color-warning)',
                  },
                  { label: 'Total Protein', value: stats.totalProtein, unit: 'g', color: 'var(--color-primary)' },
                  {
                    label: 'Total Carbohydrates',
                    value: stats.totalCarbs,
                    unit: 'g',
                    color: 'var(--color-info)',
                  },
                  { label: 'Total Fats', value: stats.totalFats, unit: 'g', color: 'var(--color-purple)' },
                ].map((m) => (
                  <div key={m.label} style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.875rem',
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ color: 'var(--color-text-secondary)' }}>{m.label}</span>
                      <span style={{ fontWeight: 600, color: m.color }}>
                        {m.value.toLocaleString()} {m.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Workout Breakdown</h3>
              </div>
              <div className="card-body">
                {[
                  { label: 'Total Recorded Sessions', value: `${stats.totalWorkouts} sessions` },
                  {
                    label: 'Total Training Time',
                    value: `${stats.totalDuration} min (${Math.floor(stats.totalDuration / 60)}h ${
                      stats.totalDuration % 60
                    }m)`,
                  },
                  { label: 'Average Session Duration', value: `${stats.avgWorkoutDur} min` },
                  { label: 'Total Calories Expended', value: `${stats.totalBurned.toLocaleString()} kcal` },
                  {
                    label: 'Average Energy / Session',
                    value: `${
                      stats.totalWorkouts > 0 ? Math.round(stats.totalBurned / stats.totalWorkouts) : 0
                    } kcal`,
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '10px 0',
                      borderBottom: '1px solid var(--color-border-light)',
                      fontSize: '0.875rem',
                    }}
                  >
                    <span style={{ color: 'var(--color-text-secondary)' }}>{s.label}</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
