import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, TrendingUp, TrendingDown, Wallet, Receipt } from 'lucide-react';
import { formatCurrency, formatDate, getCategoryInfo } from '../utils/constants';
import ExpenseModal from '../components/ExpenseModal';
import api from '../api/client';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [sumRes, expRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/expenses?limit=5'),
      ]);
      setSummary(sumRes.data);
      setRecent(expRes.data.expenses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const now = new Date();
  const monthName = now.toLocaleString('en', { month: 'long' });

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <h1 className="page-title">Hey, {user?.name?.split(' ')[0]} 👋</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={18} /> Add Expense
        </button>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="stat-label">{monthName} Spending</span>
                <div style={{ width: 36, height: 36, background: 'var(--accent-soft)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wallet size={18} color="var(--accent)" />
                </div>
              </div>
              <div className="stat-value" style={{ color: 'var(--accent)' }}>{formatCurrency(summary?.thisMonth || 0)}</div>
              {summary?.change !== null && (
                <div className={`stat-change ${summary.change > 0 ? 'change-up' : 'change-down'}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {summary.change > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {Math.abs(summary.change)}% vs last month
                </div>
              )}
            </div>

            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="stat-label">Last Month</span>
                <div style={{ width: 36, height: 36, background: 'rgba(61,214,140,0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={18} color="var(--green)" />
                </div>
              </div>
              <div className="stat-value">{formatCurrency(summary?.lastMonth || 0)}</div>
            </div>

            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="stat-label">All Time</span>
                <div style={{ width: 36, height: 36, background: 'rgba(247,201,72,0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Receipt size={18} color="var(--yellow)" />
                </div>
              </div>
              <div className="stat-value">{formatCurrency(summary?.totalAllTime || 0)}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{summary?.totalExpenses || 0} total entries</div>
            </div>
          </div>

          {/* Recent */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18 }}>Recent Expenses</h2>
              <a href="/expenses" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>View all →</a>
            </div>

            {recent.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <div className="empty-icon">💸</div>
                <div className="empty-title">No expenses yet</div>
                <div className="empty-desc">Add your first expense to get started</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recent.map((exp) => {
                  const cat = getCategoryInfo(exp.category);
                  return (
                    <div key={exp.id} style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${cat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                        {cat.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{exp.category} • {formatDate(exp.date)}</div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--red)', flexShrink: 0 }}>-{formatCurrency(exp.amount)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {showModal && <ExpenseModal onClose={() => setShowModal(false)} onSaved={fetchData} />}
    </div>
  );
}
