import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency, formatDate, getCategoryInfo, CATEGORIES, MONTH_NAMES } from '../utils/constants';
import ExpenseModal from '../components/ExpenseModal';
import api from '../api/client';
import toast from 'react-hot-toast';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [filters, setFilters] = useState({ category: '', month: '', year: '' });
  const [deleteId, setDeleteId] = useState(null);

  const fetchExpenses = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (filters.category) params.set('category', filters.category);
      if (filters.month) params.set('month', filters.month);
      if (filters.year) params.set('year', filters.year);
      const { data } = await api.get(`/expenses?${params}`);
      setExpenses(data.expenses);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchExpenses(1); }, [fetchExpenses]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      toast.success('Expense deleted');
      setDeleteId(null);
      fetchExpenses(pagination.page);
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleEdit = (expense) => { setEditExpense(expense); setShowModal(true); };
  const handleCloseModal = () => { setShowModal(false); setEditExpense(null); };
  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const clearFilters = () => setFilters({ category: '', month: '', year: '' });

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Expenses</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={18} /> Add Expense
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <select name="category" value={filters.category} onChange={handleFilterChange} className="form-input" style={{ maxWidth: 200 }}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.value}</option>)}
        </select>
        <select name="month" value={filters.month} onChange={handleFilterChange} className="form-input" style={{ maxWidth: 140 }}>
          <option value="">All Months</option>
          {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select name="year" value={filters.year} onChange={handleFilterChange} className="form-input" style={{ maxWidth: 120 }}>
          <option value="">All Years</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        {(filters.category || filters.month || filters.year) && (
          <button onClick={clearFilters} className="btn btn-ghost btn-sm">Clear filters</button>
        )}
        <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>
          {pagination.total} expense{pagination.total !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : expenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <div className="empty-title">No expenses found</div>
            <div className="empty-desc">Try adjusting your filters or add a new expense</div>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="mobile-expense-list" style={{ display: 'none' }}>
              {expenses.map((exp) => {
                const cat = getCategoryInfo(exp.category);
                return (
                  <div key={exp.id} style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${cat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                      {cat.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{exp.category} • {formatDate(exp.date)}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, color: 'var(--red)', fontSize: 15 }}>{formatCurrency(exp.amount)}</span>
                      <button onClick={() => handleEdit(exp)} className="btn btn-ghost btn-sm" style={{ padding: '5px 8px' }}><Pencil size={14} /></button>
                      <button onClick={() => setDeleteId(exp.id)} className="btn btn-danger btn-sm" style={{ padding: '5px 8px' }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="desktop-expense-table">
              <table className="expense-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp) => {
                    const cat = getCategoryInfo(exp.category);
                    return (
                      <tr key={exp.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text)' }}>{exp.title}</div>
                          {exp.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{exp.description}</div>}
                        </td>
                        <td>
                          <span className="category-pill" style={{ background: `${cat.color}15`, color: cat.color }}>
                            {cat.icon} {exp.category}
                          </span>
                        </td>
                        <td>{formatDate(exp.date)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--red)', fontSize: 15 }}>
                          -{formatCurrency(exp.amount)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button onClick={() => handleEdit(exp)} className="btn btn-ghost btn-sm"><Pencil size={14} /></button>
                            <button onClick={() => setDeleteId(exp.id)} className="btn btn-danger btn-sm"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '16px', borderTop: '1px solid var(--border)' }}>
                <button onClick={() => fetchExpenses(pagination.page - 1)} disabled={pagination.page === 1} className="btn btn-ghost btn-sm">
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Page {pagination.page} of {pagination.totalPages}</span>
                <button onClick={() => fetchExpenses(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className="btn btn-ghost btn-sm">
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete confirm */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 380 }}>
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
              <h2 style={{ fontSize: 20, marginBottom: 8 }}>Delete Expense?</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>This action cannot be undone.</p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button onClick={() => setDeleteId(null)} className="btn btn-ghost">Cancel</button>
                <button onClick={() => handleDelete(deleteId)} className="btn btn-danger">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && <ExpenseModal expense={editExpense} onClose={handleCloseModal} onSaved={() => fetchExpenses(pagination.page)} />}

      <style>{`
        @media (max-width: 700px) {
          .desktop-expense-table { display: none; }
          .mobile-expense-list { display: block !important; }
        }
      `}</style>
    </div>
  );
}
