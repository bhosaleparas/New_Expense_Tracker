import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Receipt, BarChart2, LogOut, Wallet, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/expenses', icon: Receipt, label: 'Expenses' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: '28px 24px 24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 36, height: 36, background: 'var(--accent)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={18} color="white" />
          </div>
          <span style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 800 }}>SpendWise</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '0 12px', marginBottom: 8 }}>Menu</div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
              borderRadius: 10, marginBottom: 4, fontSize: 14, fontWeight: 600,
              transition: 'all 0.15s',
              background: isActive ? 'var(--accent-soft)' : 'transparent',
              color: isActive ? 'var(--accent)' : 'var(--text-soft)',
              border: isActive ? '1px solid rgba(108,99,255,0.2)' : '1px solid transparent',
            })}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', marginBottom: 8, background: 'var(--bg-card2)', borderRadius: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px', fontSize: 14 }}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside style={{
        width: 260, background: 'var(--bg-card)', borderRight: '1px solid var(--border)',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
        display: 'flex', flexDirection: 'column',
      }} className="desktop-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile header */}
      <div style={{
        display: 'none', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60,
        background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
        padding: '14px 16px', alignItems: 'center', justifyContent: 'space-between',
      }} className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={15} color="white" />
          </div>
          <span style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 800 }}>SpendWise</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background: 'none', border: 'none', color: 'var(--text)', padding: 4 }}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 70 }} />
          <aside style={{
            position: 'fixed', top: 0, left: 0, bottom: 0, width: 260,
            background: 'var(--bg-card)', borderRight: '1px solid var(--border)', zIndex: 80,
            animation: 'slideIn 0.2s ease',
          }}>
            <SidebarContent />
          </aside>
        </>
      )}

      <style>{`
        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @media (max-width: 900px) {
          .desktop-sidebar { display: none !important; }
          .mobile-header { display: flex !important; }
          .main-content { margin-top: 58px !important; }
        }
      `}</style>
    </>
  );
}
