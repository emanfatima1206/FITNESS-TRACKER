import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Coffee, Sun, Moon, Apple, RefreshCw } from 'lucide-react';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import LoadingState from '../components/ui/LoadingState';
import ErrorMessage from '../components/ui/ErrorMessage';
import { nutritionApi } from '../services/api';

const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
const mealIcons = { Breakfast: Coffee, Lunch: Sun, Dinner: Moon, Snacks: Apple };

const GOALS = { calories: 2000, protein: 150, carbs: 250, fats: 65 };

const emptyForm = {
  foodName: '',
  mealType: 'Breakfast',
  calories: '',
  protein: '',
  carbs: '',
  fats: '',
  date: new Date().toISOString().split('T')[0],
  notes: '',
};

export default function Nutrition() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchNutrition = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await nutritionApi.getAll(filterDate);
      const list = Array.isArray(res) ? res : (res?.nutrition || []);
      setEntries(list);
    } catch (err) {
      setError(err.message || 'Failed to fetch nutrition logs from server.');
    } finally {
      setLoading(false);
    }
  }, [filterDate]);

  useEffect(() => {
    fetchNutrition();
  }, [fetchNutrition]);

  // Compute totals for current filtered date
  const totals = entries.reduce(
    (s, e) => ({
      calories: s.calories + (Number(e.calories) || 0),
      protein: s.protein + (Number(e.protein) || 0),
      carbs: s.carbs + (Number(e.carbs) || 0),
      fats: s.fats + (Number(e.fats) || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const openAdd = (presetMeal = 'Breakfast') => {
    setForm({ ...emptyForm, mealType: presetMeal, date: filterDate });
    setEditItem(null);
    setModalOpen(true);
  };

  const openEdit = (e) => {
    setForm({
      foodName: e.foodName || e.name || '',
      mealType: e.mealType || e.meal || 'Breakfast',
      calories: String(e.calories || ''),
      protein: String(e.protein || '0'),
      carbs: String(e.carbs || '0'),
      fats: String(e.fats || '0'),
      date: e.date ? new Date(e.date).toISOString().split('T')[0] : filterDate,
      notes: e.notes || '',
    });
    setEditItem(e._id || e.id);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.foodName || form.calories === '') {
      return alert('Food name and calories are required');
    }

    try {
      setSubmitting(true);
      const payload = {
        foodName: form.foodName.trim(),
        mealType: form.mealType,
        calories: Number(form.calories),
        protein: Number(form.protein) || 0,
        carbs: Number(form.carbs) || 0,
        fats: Number(form.fats) || 0,
        date: form.date,
        notes: form.notes,
      };

      if (editItem) {
        await nutritionApi.update(editItem, payload);
      } else {
        await nutritionApi.create(payload);
      }

      setModalOpen(false);
      await fetchNutrition();
    } catch (err) {
      alert(err.message || 'Failed to save food log');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await nutritionApi.delete(deleteId);
      setEntries((es) => es.filter((e) => (e._id || e.id) !== deleteId));
      setDeleteId(null);
    } catch (err) {
      alert(err.message || 'Failed to delete nutrition entry');
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
          <h1>Nutrition</h1>
          <p>Track your daily food intake, calories, and macronutrients</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="date"
            className="form-control"
            style={{ width: 'auto' }}
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          <button className="btn btn-secondary" onClick={fetchNutrition} title="Refresh">
            <RefreshCw size={15} />
          </button>
          <button className="btn btn-primary" onClick={() => openAdd('Breakfast')}>
            <Plus size={16} /> Add Food
          </button>
        </div>
      </div>

      {error && <ErrorMessage title="Nutrition Notice" message={error} onRetry={fetchNutrition} />}

      {/* Daily Summary */}
      <div className="card mb-6">
        <div className="card-header">
          <h3>Daily Summary</h3>
          <span className="text-sm text-muted">
            {new Date(filterDate).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
        <div className="card-body">
          <div className="grid-cols-4">
            {[
              {
                label: 'Calories',
                value: totals.calories,
                goal: GOALS.calories,
                unit: 'kcal',
                color: 'var(--color-warning)',
              },
              {
                label: 'Protein',
                value: totals.protein,
                goal: GOALS.protein,
                unit: 'g',
                color: 'var(--color-primary)',
              },
              {
                label: 'Carbs',
                value: totals.carbs,
                goal: GOALS.carbs,
                unit: 'g',
                color: 'var(--color-info)',
              },
              {
                label: 'Fats',
                value: totals.fats,
                goal: GOALS.fats,
                unit: 'g',
                color: 'var(--color-purple)',
              },
            ].map((m) => {
              const pct = Math.min(100, Math.round((m.value / m.goal) * 100));
              return (
                <div
                  key={m.label}
                  style={{
                    textAlign: 'center',
                    padding: '14px',
                    background: 'var(--color-bg)',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--neu-shadow-sm)',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
                    {m.label}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    of {m.goal} {m.unit}
                  </div>
                  <div className="progress-bar" style={{ marginTop: 8 }}>
                    <div className="progress-bar-fill" style={{ width: `${pct}%`, background: m.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Fetching meal records..." />
      ) : (
        /* Meal Sections */
        MEALS.map((meal) => {
          const Icon = mealIcons[meal];
          const mealItems = entries.filter((e) => (e.mealType || e.meal) === meal);
          const mealCals = mealItems.reduce((s, e) => s + (e.calories || 0), 0);

          return (
            <div key={meal} className="card mb-4">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      background: 'var(--color-primary-light)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={16} color="var(--color-primary)" />
                  </div>
                  <h3>{meal}</h3>
                  <span className="text-muted text-sm">— {mealCals} kcal</span>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => openAdd(meal)}>
                  <Plus size={14} /> Add
                </button>
              </div>

              {mealItems.length > 0 ? (
                <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Food Item</th>
                        <th>Calories</th>
                        <th>Protein</th>
                        <th>Carbs</th>
                        <th>Fats</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mealItems.map((e) => {
                        const id = e._id || e.id;
                        return (
                          <tr key={id}>
                            <td style={{ fontWeight: 500 }}>{e.foodName || e.name}</td>
                            <td>{e.calories} kcal</td>
                            <td>{e.protein}g</td>
                            <td>{e.carbs}g</td>
                            <td>{e.fats}g</td>
                            <td>
                              <div style={{ display: 'flex', gap: 4 }}>
                                <button className="btn-icon" onClick={() => openEdit(e)} title="Edit">
                                  <Edit2 size={14} />
                                </button>
                                <button className="btn-icon danger" onClick={() => setDeleteId(id)} title="Delete">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '20px 24px', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                  No items logged for {meal.toLowerCase()} on this date.
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Food Entry' : 'Log Food Entry'}
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
              <label className="form-label">Food Name *</label>
              <input type="text" className="form-control" placeholder="e.g. Chicken Avocado Salad" {...f('foodName')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Meal Type *</label>
              <select className="form-control" {...f('mealType')}>
                {MEALS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Calories (kcal) *</label>
            <input type="number" className="form-control" placeholder="350" min="0" {...f('calories')} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Protein (g)</label>
              <input type="number" className="form-control" placeholder="25" min="0" {...f('protein')} />
            </div>
            <div className="form-group">
              <label className="form-label">Carbs (g)</label>
              <input type="number" className="form-control" placeholder="15" min="0" {...f('carbs')} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Fats (g)</label>
              <input type="number" className="form-control" placeholder="8" min="0" {...f('fats')} />
            </div>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input type="date" className="form-control" {...f('date')} required />
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Food Entry"
        message="Are you sure you want to remove this nutrition log?"
      />
    </div>
  );
}
