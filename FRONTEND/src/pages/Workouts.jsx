import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Dumbbell, Filter, RefreshCw, Flame, Timer } from 'lucide-react';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import EmptyState from '../components/ui/EmptyState';
import LoadingState from '../components/ui/LoadingState';
import ErrorMessage from '../components/ui/ErrorMessage';
import Badge from '../components/ui/Badge';
import { workoutApi } from '../services/api';

const TYPES = ['All', 'Cardio', 'Strength', 'HIIT', 'Flexibility', 'Sports', 'Other'];

const typeBadge = {
  Cardio: 'blue',
  Strength: 'purple',
  HIIT: 'red',
  Flexibility: 'green',
  Sports: 'orange',
  Other: 'gray',
};

const emptyForm = {
  name: '',
  type: 'Cardio',
  duration: '',
  calories: '',
  sets: '',
  reps: '',
  weight: '',
  date: new Date().toISOString().split('T')[0],
  notes: '',
};

export default function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchWorkouts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await workoutApi.getAll();
      const list = Array.isArray(res) ? res : (res?.workouts || []);
      setWorkouts(list);
    } catch (err) {
      setError(err.message || 'Failed to fetch workouts from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  const filtered = workouts.filter((w) => {
    const matchSearch = (w.name || w.exercise || '').toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'All' || (w.type || w.category) === filterType;
    return matchSearch && matchType;
  });

  const openAdd = () => {
    setForm({ ...emptyForm, date: new Date().toISOString().split('T')[0] });
    setEditItem(null);
    setModalOpen(true);
  };

  const openEdit = (w) => {
    setForm({
      name: w.name || w.exercise || '',
      type: w.type || w.category || 'Cardio',
      duration: String(w.duration || ''),
      calories: String(w.calories !== undefined ? w.calories : w.caloriesBurned || ''),
      sets: String(w.sets || ''),
      reps: String(w.reps || ''),
      weight: String(w.weight || ''),
      date: w.date ? new Date(w.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: w.notes || '',
    });
    setEditItem(w._id || w.id);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.duration || !form.calories || !form.date) {
      return alert('Please fill all required fields');
    }

    try {
      setSubmitting(true);
      const payload = {
        name: form.name.trim(),
        type: form.type,
        duration: Number(form.duration),
        calories: Number(form.calories),
        sets: Number(form.sets) || 0,
        reps: Number(form.reps) || 0,
        weight: Number(form.weight) || 0,
        date: form.date,
        notes: form.notes,
      };

      if (editItem) {
        await workoutApi.update(editItem, payload);
      } else {
        await workoutApi.create(payload);
      }

      setModalOpen(false);
      await fetchWorkouts();
    } catch (err) {
      alert(err.message || 'Failed to save workout.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await workoutApi.delete(deleteId);
      setWorkouts((ws) => ws.filter((w) => (w._id || w.id) !== deleteId));
      setDeleteId(null);
    } catch (err) {
      alert(err.message || 'Failed to delete workout.');
    }
  };

  const f = (k) => ({
    value: form[k],
    onChange: (e) => setForm((p) => ({ ...p, [k]: e.target.value })),
  });

  const totalCalories = workouts.reduce((s, w) => s + (w.calories || 0), 0);
  const totalDuration = workouts.reduce((s, w) => s + (w.duration || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Workouts</h1>
          <p>Track and manage your workout sessions with live database sync</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={fetchWorkouts} title="Refresh">
            <RefreshCw size={15} />
          </button>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Workout
          </button>
        </div>
      </div>

      {error && <ErrorMessage title="Workouts Notice" message={error} onRetry={fetchWorkouts} />}

      {/* Stats Row */}
      <div className="grid-cols-3 mb-6">
        {[
          { label: 'Total Workouts', value: workouts.length, unit: 'sessions', icon: Dumbbell, bg: 'var(--color-primary-light)', col: 'var(--color-primary)' },
          { label: 'Total Duration', value: totalDuration, unit: 'min', icon: Timer, bg: 'var(--color-info-light)', col: 'var(--color-info)' },
          { label: 'Calories Burned', value: totalCalories.toLocaleString(), unit: 'kcal', icon: Flame, bg: 'var(--color-warning-light)', col: 'var(--color-warning)' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-card-icon" style={{ background: s.bg }}>
              <s.icon size={22} color={s.col} />
            </div>
            <div className="stat-card-info">
              <div className="stat-card-label">{s.label}</div>
              <div className="stat-card-value">
                {s.value}
                <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
                  {' '}
                  {s.unit}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="card mb-6">
        <div className="card-body" style={{ padding: 16 }}>
          <div className="search-filter-bar">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="form-control"
                placeholder="Search workouts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Filter size={16} style={{ color: 'var(--color-text-muted)', alignSelf: 'center' }} />
              {TYPES.map((t) => (
                <button
                  key={t}
                  className={`btn btn-sm ${filterType === t ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilterType(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table / List */}
      {loading ? (
        <LoadingState message="Loading workouts from database..." />
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Dumbbell}
            title="No workouts found"
            description="Start logging your workout sessions to see them here."
            action={
              <button className="btn btn-primary" onClick={openAdd}>
                <Plus size={15} /> Add Workout
              </button>
            }
          />
        </div>
      ) : (
        <div className="card">
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Workout Name</th>
                  <th>Type</th>
                  <th>Duration</th>
                  <th>Calories</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((w) => {
                  const id = w._id || w.id;
                  const name = w.name || w.exercise;
                  const type = w.type || w.category;
                  return (
                    <tr key={id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{name}</div>
                        {(w.sets > 0 || w.reps > 0 || w.weight > 0) && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                            {w.sets ? `${w.sets} sets` : ''}{w.reps ? ` × ${w.reps} reps` : ''}{w.weight ? ` @ ${w.weight}kg` : ''}
                          </div>
                        )}
                        {w.notes && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            {w.notes}
                          </div>
                        )}
                      </td>
                      <td>
                        <Badge variant={typeBadge[type] || 'gray'}>{type}</Badge>
                      </td>
                      <td>{w.duration} min</td>
                      <td>{w.calories} kcal</td>
                      <td>
                        {new Date(w.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn-icon" onClick={() => openEdit(w)} title="Edit">
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
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Workout' : 'Add Workout'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={submitting}>
              {submitting ? 'Saving...' : editItem ? 'Save Changes' : 'Add Workout'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Workout Name *</label>
              <input type="text" className="form-control" placeholder="e.g. Morning 5km Run" {...f('name')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Type *</label>
              <select className="form-control" {...f('type')}>
                {TYPES.filter((t) => t !== 'All').map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Duration (min) *</label>
              <input type="number" className="form-control" placeholder="45" min="1" {...f('duration')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Calories Burned *</label>
              <input type="number" className="form-control" placeholder="400" min="0" {...f('calories')} required />
            </div>
          </div>
          <div className="form-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="form-group">
              <label className="form-label">Sets (opt.)</label>
              <input type="number" className="form-control" placeholder="3" min="0" {...f('sets')} />
            </div>
            <div className="form-group">
              <label className="form-label">Reps (opt.)</label>
              <input type="number" className="form-control" placeholder="12" min="0" {...f('reps')} />
            </div>
            <div className="form-group">
              <label className="form-label">Weight kg (opt.)</label>
              <input type="number" className="form-control" placeholder="60" min="0" {...f('weight')} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Date *</label>
            <input type="date" className="form-control" {...f('date')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              className="form-control"
              placeholder="Any notes about this workout..."
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
        title="Delete Workout"
        message="Are you sure you want to delete this workout? This action cannot be undone."
      />
    </div>
  );
}
