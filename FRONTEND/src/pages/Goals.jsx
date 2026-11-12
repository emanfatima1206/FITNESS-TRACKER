import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Target, Calendar, Trophy, CheckCircle, RefreshCw } from 'lucide-react';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import EmptyState from '../components/ui/EmptyState';
import LoadingState from '../components/ui/LoadingState';
import ErrorMessage from '../components/ui/ErrorMessage';
import Badge from '../components/ui/Badge';
import { goalApi } from '../services/api';

const CATEGORIES = ['Weight', 'Cardio', 'Strength', 'Consistency', 'Hydration', 'Flexibility', 'Other'];
const catBadge = {
  Weight: 'blue',
  Cardio: 'green',
  Strength: 'purple',
  Consistency: 'orange',
  Hydration: 'blue',
  Flexibility: 'yellow',
  Other: 'gray',
};

const emptyForm = {
  title: '',
  description: '',
  category: 'Weight',
  targetValue: '',
  currentValue: '',
  unit: 'kg',
  direction: 'increase',
  deadline: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
};

function getProgress(goal) {
  const current = Number(goal.currentValue || 0);
  const target = Number(goal.targetValue || 1);

  if (goal.direction === 'decrease') {
    if (current <= target) return 100;
    return Math.max(0, Math.min(100, Math.round((target / current) * 100)));
  }

  if (target <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((current / target) * 100)));
}

function getProgressColor(pct) {
  if (pct >= 80) return 'var(--color-primary)';
  if (pct >= 50) return 'var(--color-warning)';
  return 'var(--color-danger)';
}

function getDaysLeft(deadline) {
  if (!deadline) return { text: 'No deadline', color: 'var(--color-text-muted)' };
  const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { text: 'Overdue', color: 'var(--color-danger)' };
  if (diff === 0) return { text: 'Today', color: 'var(--color-warning)' };
  if (diff <= 7) return { text: `${diff}d left`, color: 'var(--color-warning)' };
  return { text: `${diff}d left`, color: 'var(--color-text-muted)' };
}

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await goalApi.getAll();
      const list = Array.isArray(res) ? res : (res?.goals || []);
      setGoals(list);
    } catch (err) {
      setError(err.message || 'Failed to fetch goals from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const openAdd = () => {
    setForm({
      ...emptyForm,
      deadline: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    });
    setEditItem(null);
    setModalOpen(true);
  };

  const openEdit = (g) => {
    setForm({
      title: g.title || '',
      description: g.description || '',
      category: g.category || 'Weight',
      targetValue: String(g.targetValue !== undefined ? g.targetValue : g.target || ''),
      currentValue: String(g.currentValue !== undefined ? g.currentValue : g.current || ''),
      unit: g.unit || 'kg',
      direction: g.direction || 'increase',
      deadline: g.deadline ? new Date(g.deadline).toISOString().split('T')[0] : '',
    });
    setEditItem(g._id || g.id);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || form.targetValue === '' || form.currentValue === '') {
      return alert('Title, target value, and current value are required');
    }

    try {
      setSubmitting(true);
      const payload = {
        title: form.title.trim(),
        description: form.description,
        category: form.category,
        targetValue: Number(form.targetValue),
        currentValue: Number(form.currentValue),
        unit: form.unit,
        direction: form.direction,
        deadline: form.deadline,
      };

      if (editItem) {
        await goalApi.update(editItem, payload);
      } else {
        await goalApi.create(payload);
      }

      setModalOpen(false);
      await fetchGoals();
    } catch (err) {
      alert(err.message || 'Failed to save goal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await goalApi.delete(deleteId);
      setGoals((gs) => gs.filter((g) => (g._id || g.id) !== deleteId));
      setDeleteId(null);
    } catch (err) {
      alert(err.message || 'Failed to delete goal');
    }
  };

  const markCompleted = async (goal) => {
    try {
      const id = goal._id || goal.id;
      await goalApi.update(id, {
        status: 'completed',
        currentValue: goal.targetValue,
      });
      await fetchGoals();
    } catch (err) {
      alert(err.message || 'Failed to mark goal as completed');
    }
  };

  const f = (k) => ({
    value: form[k],
    onChange: (e) => setForm((p) => ({ ...p, [k]: e.target.value })),
  });

  const completed = goals.filter((g) => g.status === 'completed' || getProgress(g) >= 100).length;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Goals</h1>
          <p>Set targets, track milestones, and conquer your fitness achievements</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={fetchGoals} title="Refresh">
            <RefreshCw size={15} />
          </button>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Goal
          </button>
        </div>
      </div>

      {error && <ErrorMessage title="Goals Notice" message={error} onRetry={fetchGoals} />}

      {/* Stats Row */}
      <div className="grid-cols-3 mb-6">
        {[
          { label: 'Total Goals', value: goals.length, color: 'var(--color-primary)' },
          { label: 'Completed', value: completed, color: 'var(--color-info)' },
          { label: 'In Progress', value: goals.length - completed, color: 'var(--color-warning)' },
        ].map((s) => (
          <div key={s.label} className="card">
            <div className="card-body" style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
                {s.label}
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Goals Grid */}
      {loading ? (
        <LoadingState message="Fetching your goals..." />
      ) : goals.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Target}
            title="No goals set yet"
            description="Set your first fitness milestone to stay motivated."
            action={
              <button className="btn btn-primary" onClick={openAdd}>
                <Plus size={15} /> Add Goal
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid-cols-2">
          {goals.map((goal) => {
            const id = goal._id || goal.id;
            const pct = getProgress(goal);
            const dl = getDaysLeft(goal.deadline);
            const isDone = goal.status === 'completed' || pct >= 100;

            return (
              <div key={id} className="card" style={{ padding: 0 }}>
                <div className="card-body" style={{ padding: '20px 24px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: 12,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            background: isDone ? 'var(--color-primary-light)' : 'var(--color-bg-secondary)',
                            borderRadius: 'var(--radius)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Trophy size={18} color={isDone ? 'var(--color-primary)' : 'var(--color-text-secondary)'} />
                        </div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)' }}>
                          {goal.title}
                        </h4>
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <Badge variant={catBadge[goal.category] || 'gray'}>{goal.category}</Badge>
                        {isDone && <span className="badge badge-green">Completed</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      {!isDone && (
                        <button
                          className="btn-icon"
                          onClick={() => markCompleted(goal)}
                          title="Mark complete"
                          style={{ color: 'var(--color-primary)' }}
                        >
                          <CheckCircle size={15} />
                        </button>
                      )}
                      <button className="btn-icon" onClick={() => openEdit(goal)} title="Edit">
                        <Edit2 size={15} />
                      </button>
                      <button className="btn-icon danger" onClick={() => setDeleteId(id)} title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      Current:{' '}
                      <strong style={{ color: 'var(--color-text)' }}>
                        {goal.currentValue !== undefined ? goal.currentValue : goal.current} {goal.unit}
                      </strong>
                    </span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      Target:{' '}
                      <strong style={{ color: 'var(--color-text)' }}>
                        {goal.targetValue !== undefined ? goal.targetValue : goal.target} {goal.unit}
                      </strong>
                    </span>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.8125rem',
                        color: 'var(--color-text-secondary)',
                        marginBottom: 6,
                      }}
                    >
                      <span>Progress</span>
                      <span style={{ fontWeight: 600, color: getProgressColor(pct) }}>{pct}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${pct}%`, background: getProgressColor(pct) }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem' }}>
                    <Calendar size={13} color="var(--color-text-muted)" />
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      Deadline:{' '}
                      {goal.deadline
                        ? new Date(goal.deadline).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'None'}
                    </span>
                    <span style={{ color: dl.color, fontWeight: 500, marginLeft: 'auto' }}>{dl.text}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Goal' : 'Add New Goal'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={submitting}>
              {submitting ? 'Saving...' : editItem ? 'Save Changes' : 'Add Goal'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Goal Title *</label>
              <input type="text" className="form-control" placeholder="e.g. Lose 5kg" {...f('title')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-control" {...f('category')}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Target Value *</label>
              <input
                type="number"
                className="form-control"
                placeholder="70"
                step="any"
                {...f('targetValue')}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Current Value *</label>
              <input
                type="number"
                className="form-control"
                placeholder="75"
                step="any"
                {...f('currentValue')}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Unit</label>
              <input type="text" className="form-control" placeholder="kg, km, days, min..." {...f('unit')} />
            </div>
            <div className="form-group">
              <label className="form-label">Direction</label>
              <select className="form-control" {...f('direction')}>
                <option value="increase">Increase (higher is better)</option>
                <option value="decrease">Decrease (lower is better)</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Deadline</label>
            <input type="date" className="form-control" {...f('deadline')} />
          </div>
          <div className="form-group">
            <label className="form-label">Description / Motivation</label>
            <textarea
              className="form-control"
              placeholder="Why this goal matters..."
              {...f('description')}
              style={{ minHeight: 60 }}
            />
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Goal"
        message="Are you sure you want to delete this fitness goal?"
      />
    </div>
  );
}
