import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  User, LogOut, Moon, Sun, Bell, Search, Menu, X, Shield,
  Store, Star, ChevronDown, CheckCircle2, Sparkles,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, logout, role } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = () => {
    const r = (role || '').toLowerCase();
    if (r === 'admin') return <span className="badge badge-admin">Admin</span>;
    if (r === 'owner' || r === 'store_owner') return <span className="badge badge-owner">Store Owner</span>;
    return <span className="badge badge-user">Normal User</span>;
  };

  const notifications = [
    { id: 1, title: 'New Rating Submitted', text: 'A customer rated Apex Electronics 5 stars', time: '5m ago' },
    { id: 2, title: 'Store Verified', text: 'Grand Plaza Market verified successfully', time: '1h ago' },
    { id: 3, title: 'System Notice', text: 'Database synchronization active', time: '3h ago' },
  ];

  return (
    <header
      style={{
        height: '70px',
        backgroundColor: 'var(--bg-header)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        transition: 'background-color var(--transition-smooth), border-color var(--transition-smooth)',
      }}
    >
      {/* Left: Sidebar Toggle & Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleSidebar}
          className="btn-icon"
          title="Toggle Navigation Menu"
          aria-label="Toggle Sidebar"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px var(--color-primary-glow)',
            }}
          >
            <Star size={18} fill="#FFFFFF" />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
              Sahi<span style={{ color: 'var(--color-primary)' }}>Hai</span>
            </span>
          </div>
        </Link>
      </div>

      {/* Center/Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Theme Toggle (Light / Dark) */}
        <button
          onClick={toggleTheme}
          className="btn-icon"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{ position: 'relative' }}
        >
          {isDark ? (
            <Sun size={19} style={{ color: '#F59E0B' }} />
          ) : (
            <Moon size={19} style={{ color: 'var(--color-text-secondary)' }} />
          )}
        </button>

        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileDropdown(false);
            }}
            className="btn-icon"
            title="Notifications"
          >
            <Bell size={19} />
            <span
              style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
              }}
            />
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 10px)',
                width: '320px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-dropdown)',
                padding: '0.75rem',
                zIndex: 60,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.5rem 0.75rem',
                  borderBottom: '1px solid var(--color-border-subtle)',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications</span>
                <span className="badge badge-primary">3 New</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: '0.6rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-surface-muted)',
                      fontSize: '0.8rem',
                    }}
                  >
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{n.title}</div>
                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', marginTop: '2px' }}>{n.text}</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem', marginTop: '4px' }}>{n.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        {user && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setShowProfileDropdown(!showProfileDropdown);
                setShowNotifications(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--color-border)',
                transition: 'border-color var(--transition-fast)',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                }}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    maxWidth: '120px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.name}
                </span>
                <div style={{ marginTop: '1px' }}>{getRoleBadge()}</div>
              </div>
              <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} />
            </button>

            {showProfileDropdown && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 10px)',
                  width: '240px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-dropdown)',
                  padding: '0.5rem 0',
                  zIndex: 60,
                }}
              >
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{user.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.email}
                  </div>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setShowProfileDropdown(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.65rem 1rem',
                    fontSize: '0.85rem',
                    color: 'var(--color-text-primary)',
                    transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-muted)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <User size={16} style={{ color: 'var(--color-primary)' }} /> Profile & Settings
                </Link>

                <div style={{ borderTop: '1px solid var(--color-border-subtle)', margin: '0.25rem 0' }} />

                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.65rem 1rem',
                    fontSize: '0.85rem',
                    color: 'var(--color-danger)',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-danger-bg)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
