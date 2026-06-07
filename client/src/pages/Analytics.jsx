import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { CATEGORIES, getCategoryInfo, formatCurrency, MONTH_NAMES } from '../utils/constants';
import api from '../api/client';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px' }}>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)' }}>{formatCurrency(payload[0].value)}</p>
    </div>
  );
};

export default function Analytics() {
  const [monthly, setMonthly] = useState([]);
  const [catData, setCatData] = useState({ categories: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchMonthly = async () => {
    const { data } = await api.get('/analytics/monthly?months=12');
    const formatted = data.map((d) => {
      const [y, m] = d.month.split('-');
      return { ...d, label: `${MONTH_NAMES[parseInt(m) - 1]} ${y.slice(2)}` };
    });
    setMonthly(formatted);
  };

  const fetchCategories = async () => {
    const { data } = await api.get(`/analytics/categories?month=${selectedMonth}&year=${selectedYear}`);
    setCatData(data);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchMonthly(), fetchCategories()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [selectedMonth, selectedYear]);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const pieData = catData.categories.map((c) => ({
    ...c,
    color: getCategoryInfo(c.category).color,
    icon: getCategoryInfo(c.category).icon,
  }));

  const RADIAN = Math.PI / 180;
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.06) return null;
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>{`${(percent * 100).toFixed(0)}%`}</text>;
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
      </div>

      {/* Monthly bar chart */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, marginBottom: 4 }}>Monthly Spending</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>Your expenses over the last 12 months</p>
        {monthly.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 0' }}>
            <div className="empty-icon">📊</div>
            <div className="empty-title">No data yet</div>
            <div className="empty-desc">Add some expenses to see your trends</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthly} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="total" fill="var(--accent)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Category breakdown */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 18, marginBottom: 4 }}>Category Breakdown</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              Total: <strong style={{ color: 'var(--text)' }}>{formatCurrency(catData.total)}</strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="form-input" style={{ maxWidth: 130 }}>
              {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="form-input" style={{ maxWidth: 100 }}>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {catData.categories.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 0' }}>
            <div className="empty-icon">🗂️</div>
            <div className="empty-title">No expenses this month</div>
            <div className="empty-desc">Select a different month or add some expenses</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>
            {/* Pie chart */}
            <div style={{ minWidth: 0 }}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={110} innerRadius={55} labelLine={false} label={renderCustomLabel}>
                    {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
              {catData.categories.map((cat) => {
                const info = getCategoryInfo(cat.category);
                return (
                  <div key={cat.category}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                      <span style={{ fontSize: 16 }}>{info.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-soft)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.category}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', flexShrink: 0 }}>{formatCurrency(cat.amount)}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 36, textAlign: 'right', flexShrink: 0 }}>{cat.percentage}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${cat.percentage}%`, background: info.color }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <style>{`@media(max-width:700px){.recharts-responsive-container+div{grid-column:1/-1;}}`}</style>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 700px) {
          .card > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
