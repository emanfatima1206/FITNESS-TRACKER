import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Bell, Clock, Calendar, RefreshCw } from 'lucide-react';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import EmptyState from '../components/ui/EmptyState';
import LoadingState from '../components/ui/LoadingState';
import ErrorMessage from '../components/ui/ErrorMessage';
import Badge from '../components/ui/Badge';
import Toggle from '../components/ui/Toggle';
import { reminderApi } from '../services/api';

const TYPES = ['Workout', 'Nutrition', 'Health', 'Hydration', 'Progress', 'Other'];
const typeBadge = {
  Workout: 'green',
  Nutrition: 'orange',
  Health: 'red',
  Hydration: 'blue',
  Progress: 'purple',
  Other: 'gray',
};

const emptyForm = {
  title: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  time: '08:00',
  type: 'Workout',
  enabled: true,
};

function formatDateTime(r) {
  if (r.datetime) {
    const d = new Date(r.datetime);
    return d.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
  return `${r.date || ''} at ${r.time || ''}`;
}

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await reminderApi.getAll();
      const list = Array.isArray(res) ? res : (res?.reminders || []);
      setReminders(list);
    } catch (err) {
      setError(err.message || 'Failed to fetch reminders from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const upcoming = reminders.filter((r) => r.enabled);
  const enabledCount = reminders.filter((r) => r.enabled).length;

  const openAdd = () => {
    setForm({
      ...emptyForm,
      date: new Date().toISOString().split('T')[0],
      time: '08:00',
    });
    setEditItem(null);
    setModalOpen(true);
  };

  const openEdit = (r) => {
    setForm({
      title: r.title || '',
      description: r.description || '',
      date: r.date || (r.datetime ? new Date(r.datetime).toISOString().split('T')[0] : ''),
      time: r.time || (r.datetime ? new Date(r.datetime).toTimeString().slice(0, 5) : '08:00'),
      type: r.type || 'Workout',
      enabled: r.enabled !== undefined ? r.enabled : true,
    });
    setEditItem(r._id || r.id);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.time) {
      return alert('Title, date, and time are required');
    }

    try {
      setSubmitting(true);
      const combinedDateTime = new Date(`${form.date}T${form.time}:00`);
      const payload = {
        title: form.title.trim(),
        description: form.description,
        date: form.date,
        time: form.time,
        datetime: isNaN(combinedDateTime.getTime()) ? new Date() : combinedDateTime,
        type: form.type,
        enabled: form.enabled,
      };

      if (editItem) {
        await reminderApi.update(editItem, payload);
      } else {
        await reminderApi.create(payload);
      }

      setModalOpen(false);
      await fetchReminders();
    } catch (err) {
      alert(err.message || 'Failed to save reminder');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await reminderApi.delete(deleteId);
      setReminders((rs) => rs.filter((r) => (r._id || r.id) !== deleteId));
      setDeleteId(null);
    } catch (err) {
      alert(err.message || 'Failed to delete reminder');
    }
  };

  const toggleEnabled = async (id, val) => {
    try {
      await reminderApi.toggle(id, val);
      setReminders((rs) => rs.map((r) => ((r._id || r.id) === id ? { ...r, enabled: val } : r)));
    } catch (err) {
      alert(err.message || 'Failed to toggle reminder status');
    }
  };

  const f = (k) => ({
    value: form[k],
    onChange: (e) => setForm((p) => ({ ...p, [k]: e.target.value })),
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Reminders</h1>
          <p>Schedule alerts for your training, meals, hydration, and check-ins</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={fetchReminders} title="Refresh">
            <RefreshCw size={15} />
          </button>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Reminder
          </button>
        </div>
      </div>

      {error && <ErrorMessage title="Reminders Notice" message={error} onRetry={fetchReminders} />}

      {/* Stats */}
      <div className="grid-cols-3 mb-6">
        {[
          { label: 'Total Reminders', value: reminders.length, color: 'var(--color-primary)' },
          { label: 'Enabled / Active', value: enabledCount, color: 'var(--color-info)' },
          { label: 'Upcoming Today', value: upcoming.length, color: 'var(--color-warning)' },
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

      {/* Upcoming Reminders Card */}
      {upcoming.length > 0 && (
        <div className="card mb-6">
          <div className="card-header">
            <h3>Scheduled Reminders</h3>
            <span className="badge badge-green">{upcoming.length} active</span>
          </div>
          <div className="card-body" style={{ padding: '8px 24px' }}>
            {upcoming.map((r) => {
              const id = r._id || r.id;
              return (
                <div
                  key={id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 0',
                    borderBottom: '1px solid var(--color-border-light)',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      background: 'var(--color-primary-light)',
                      borderRadius: 'var(--radius)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Bell size={18} color="var(--color-primary)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{r.title}</div>
                    <div
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--color-text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        marginTop: 2,
                      }}
                    >
                      <Clock size={12} />
                      {formatDateTime(r)}
                    </div>
                  </div>
                  <Badge variant={typeBadge[r.type] || 'gray'}>{r.type}</Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Reminders Table */}
      <div className="card">
        <div className="card-header">
          <h3>All Reminders</h3>
          <span className="text-sm text-muted">{reminders.length} reminders</span>
        </div>
        {loading ? (
          <LoadingState message="Fetching reminders list..." />
        ) : reminders.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No reminders scheduled"
            description="Add reminders to stay consistent with your workout and nutrition routine."
            action={
              <button className="btn btn-primary" onClick={openAdd}>
                <Plus size={15} /> Add Reminder
              </button>
            }
          />
        ) : (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Reminder</th>
                  <th>Type</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Enabled</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reminders.map((r) => {
                  const id = r._id || r.id;
                  return (
                    <tr key={id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{r.title}</div>
                        {r.description && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            {r.description}
                          </div>
                        )}
                      </td>
                      <td>
                        <Badge variant={typeBadge[r.type] || 'gray'}>{r.type}</Badge>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem' }}>
                          <Calendar size={13} color="var(--color-text-muted)" />
                          {formatDateTime(r)}
                        </div>
                      </td>
                      <td>
                        {r.enabled ? (
                          <span className="badge badge-green">Active</span>
                        ) : (
                          <span className="badge badge-gray">Disabled</span>
                        )}
                      </td>
                      <td>
                        <Toggle checked={Boolean(r.enabled)} onChange={(val) => toggleEnabled(id, val)} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn-icon" onClick={() => openEdit(r)} title="Edit">
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
        title={editItem ? 'Edit Reminder' : 'Set New Reminder'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={submitting}>
              {submitting ? 'Saving...' : editItem ? 'Save Changes' : 'Add Reminder'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Reminder Title *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Evening Cardio Workout"
              {...f('title')}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input type="date" className="form-control" {...f('date')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Time *</label>
              <input type="time" className="form-control" {...f('time')} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="form-control" {...f('type')}>
              {TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Description / Instructions</label>
            <textarea
              className="form-control"
              placeholder="e.g. Drink 500ml water and warm up for 5 mins..."
              {...f('description')}
              style={{ minHeight: 60 }}
            />
          </div>
          <div className="form-group">
            <Toggle
              checked={form.enabled}
              onChange={(val) => setForm((p) => ({ ...p, enabled: val }))}
              label="Enable active alert"
            />
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Reminder"
        message="Are you sure you want to delete this reminder?"
      />
    </div>
  );
}
