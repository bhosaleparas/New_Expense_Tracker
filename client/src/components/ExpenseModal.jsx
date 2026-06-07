import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { CATEGORIES } from '../utils/constants';
import api from '../api/client';
import toast from 'react-hot-toast';

const today = () => new Date().toISOString().split('T')[0];

export default function ExpenseModal({ expense, onClose, onSaved }) {
  const isEdit = !!expense;
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'Food & Dining',
    date: today(),
    description: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expense) {
      setForm({
        title: expense.title,
        amount: String(expense.amount),
        category: expense.category,
        date: expense.date.split('T')[0],
        description: expense.description || '',
      });
    }
  }, [expense]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount || !form.category) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/expenses/${expense.id}`, form);
        toast.success('Expense updated!');
      } else {
        await api.post('/expenses', form);
        toast.success('Expense added!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Expense' : 'Add Expense'}</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Lunch at restaurant" className="form-input" required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Amount (₹) *</label>
              <input name="amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={handleChange} placeholder="0.00" className="form-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input name="date" type="date" value={form.date} onChange={handleChange} className="form-input" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Category *</label>
            <select name="category" value={form.category} onChange={handleChange} className="form-input">
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.icon} {c.value}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Note (optional)</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Add a note..." className="form-input" rows={3} style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ minWidth: 120 }}>
              {loading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : isEdit ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
