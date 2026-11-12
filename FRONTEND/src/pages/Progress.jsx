import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, TrendingDown, TrendingUp, Ruler, RefreshCw } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import EmptyState from '../components/ui/EmptyState';
import LoadingState from '../components/ui/LoadingState';
import ErrorMessage from '../components/ui/ErrorMessage';
import { progressApi } from '../services/api';

const emptyForm = {
  date: new Date().toISOString().split('T')[0],
  weight: '',
  chest: '',
  waist: '',
  hips: '',
  arms: '',
  notes: '',
};

const measurements = [
  { key: 'chest', label: 'Chest', unit: 'cm', color: 'var(--color-primary)' },
  { key: 'waist', label: 'Waist', unit: 'cm', color: 'var(--color-warning)' },
  { key: 'hips', label: 'Hips', unit: 'cm', color: 'var(--color-purple)' },
  { key: 'arms', label: 'Arms', unit: 'cm', color: 'var(--color-info)' },
];

export default function Progress() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await progressApi.getAll();
      const list = Array.isArray(res) ? res : (res?.progress || []);
      setEntries(list);
    } catch (err) {
      setError(err.message || 'Failed to fetch progress records from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const latest = entries[0];
  const previous = entries[1];

  const weightDiff =
    latest && previous ? (latest.weight - previous.weight).toFixed(1) : null;

  const openAdd = () => {
    setForm({ ...emptyForm, date: new Date().toISOString().split('T')[0] });
    setEditItem(null);
    setModalOpen(true);
  };

  const openEdit = (e) => {
    setForm({
      date: e.date ? new Date(e.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      weight: String(e.weight || ''),
      chest: String(e.chest || ''),
      waist: String(e.waist || ''),
      hips: String(e.hips || ''),
      arms: String(e.arms || ''),
      notes: e.notes || '',
    });
    setEditItem(e._id || e.id);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.date || form.weight === '') return alert('Date and Weight are required');

    try {
      setSubmitting(true);
      const payload = {
        date: form.date,
        weight: parseFloat(form.weight),
        chest: parseFloat(form.chest) || 0,
        waist: parseFloat(form.waist) || 0,
        hips: parseFloat(form.hips) || 0,
        arms: parseFloat(form.arms) || 0,
        notes: form.notes,
      };

      if (editItem) {
        await progressApi.update(editItem, payload);
      } else {
        await progressApi.create(payload);
      }

      setModalOpen(false);
      await fetchProgress();
    } catch (err) {
      alert(err.message || 'Failed to save progress record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await progressApi.delete(deleteId);
      setEntries((es) => es.filter((e) => (e._id || e.id) !== deleteId));
      setDeleteId(null);
    } catch (err) {
      alert(err.message || 'Failed to delete record');
    }
  };

  const f = (k) => ({
    value: form[k],
    onChange: (e) => setForm((p) => ({ ...p, [k]: e.target.value })),
  });

  // Chart data sorted chronologically
  const chartData = [...entries]
    .reverse()
    .map((e) => ({
      date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: e.weight,
    }));

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Progress</h1>
          <p>Track your body measurements, weight progression, and physical changes</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={fetchProgress} title="Refresh">
            <RefreshCw size={15} />
          </button>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Progress
          </button>
        </div>
      </div>

      {error && <ErrorMessage title="Progress Notice" message={error} onRetry={fetchProgress} />}

      {/* Latest Measurements Cards */}
      {latest && (
        <div className="grid-cols-5 mb-6">
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'var(--color-primary-light)' }}>
              <TrendingDown size={22} color="var(--color-primary)" />
            </div>
            <div className="stat-card-info">
              <div className="stat-card-label">Current Weight</div>
              <div className="stat-card-value">
                {latest.weight}
                <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}> kg</span>
              </div>
              {weightDiff !== null && (
                <div className={`stat-card-change ${parseFloat(weightDiff) <= 0 ? 'positive' : 'negative'}`}>
                  {parseFloat(weightDiff) <= 0 ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
                  {weightDiff} kg from previous
                </div>
              )}
            </div>
          </div>

          {measurements.map((m) => (
            <div key={m.key} className="stat-card">
              <div className="stat-card-icon" style={{ background: 'var(--color-bg-secondary)' }}>
                <Ruler size={22} color={m.color} />
              </div>
              <div className="stat-card-info">
                <div className="stat-card-label">{m.label}</div>
                <div className="stat-card-value">
                  {latest[m.key]}
                  <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
                    {' '}
                    {m.unit}
                  </span>
                </div>
                {previous && previous[m.key] !== undefined && (
                  <div className="stat-card-change positive">
                    {(latest[m.key] - previous[m.key]).toFixed(1)} cm
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Weight Progress Chart */}
      <div className="card mb-6">
        <div className="card-header">
          <h3>Weight Progression Chart</h3>
          <span className="badge badge-green">{chartData.length} records</span>
        </div>
        <div className="card-body">
          {chartData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>
              No historical entries to graph yet. Add your first progress entry!
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(val) => [`${val} kg`, 'Weight']}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  dot={{ fill: 'var(--color-primary)', r: 4, strokeWidth: 2, stroke: 'var(--color-surface)' }}
                  activeDot={{ r: 6 }}
                  name="Weight"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Progress History Table */}
      <div className="card">
        <div className="card-header">
          <h3>Measurement History</h3>
          <span className="text-sm text-muted">{entries.length} entries</span>
        </div>
        {loading ? (
          <LoadingState message="Loading measurement records..." />
        ) : entries.length === 0 ? (
          <EmptyState
            icon={TrendingDown}
            title="No progress entries yet"
            description="Start tracking your body measurements and weight progression."
            action={
              <button className="btn btn-primary" onClick={openAdd}>
                <Plus size={15} /> Add Progress
              </button>
            }
          />
        ) : (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Weight</th>
                  <th>Chest</th>
                  <th>Waist</th>
                  <th>Hips</th>
                  <th>Arms</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => {
                  const id = e._id || e.id;
                  return (
                    <tr key={id}>
                      <td style={{ fontWeight: 500 }}>
                        {new Date(e.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td>
                        <strong>{e.weight}</strong> kg
                      </td>
                      <td>{e.chest} cm</td>
                      <td>{e.waist} cm</td>
                      <td>{e.hips} cm</td>
                      <td>{e.arms} cm</td>
                      <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>{e.notes || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn-icon" onClick={() => openEdit(e)} title="Edit">
                            <Edit2 size={15} />
                          </button>
                          <button className="btn-icon danger" onClick={() => setDeleteId(id)} title="Delete">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Progress Entry' : 'Log Body Progress'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={submitting}>
              {submitting ? 'Saving...' : editItem ? 'Save Changes' : 'Add Entry'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input type="date" className="form-control" {...f('date')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Weight (kg) *</label>
              <input
                type="number"
                className="form-control"
                placeholder="75.0"
                step="0.1"
                min="0"
                {...f('weight')}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Chest (cm)</label>
              <input type="number" className="form-control" placeholder="98" step="0.5" min="0" {...f('chest')} />
            </div>
            <div className="form-group">
              <label className="form-label">Waist (cm)</label>
              <input type="number" className="form-control" placeholder="82" step="0.5" min="0" {...f('waist')} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Hips (cm)</label>
              <input type="number" className="form-control" placeholder="95" step="0.5" min="0" {...f('hips')} />
            </div>
            <div className="form-group">
              <label className="form-label">Arms (cm)</label>
              <input type="number" className="form-control" placeholder="36" step="0.5" min="0" {...f('arms')} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              className="form-control"
              placeholder="Any workout or nutrition observations..."
              {...f('notes')}
              style={{ minHeight: 70 }}
            />
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Progress Entry"
        message="Are you sure you want to delete this measurement record?"
      />
    </div>
  );
}
