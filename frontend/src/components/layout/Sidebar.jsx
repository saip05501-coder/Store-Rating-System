import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, Store, Star, User, Settings,
  Compass, BarChart3, Shield, ShieldAlert, Award, Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ isOpen, onCloseMobile }) => {
  const { role } = useAuth();
  const normalizedRole = (role || '').toLowerCase();

  const getNavSections = () => {
    if (normalizedRole === 'admin') {
      return [
        {
          title: 'DASHBOARD',
          items: [
            { label: 'Admin Analytics', path: '/admin/dashboard', icon: LayoutDashboard },
          ],
        },
        {
          title: 'MANAGEMENT',
          items: [
            { label: 'User Directory', path: '/admin/users', icon: Users },
            { label: 'Store Management', path: '/admin/stores', icon: Store },
            { label: 'Audit Trail', path: '/admin/audit-logs', icon: ShieldAlert },
          ],
        },
        {
          title: 'ACCOUNT',
          items: [
            { label: 'Profile & Settings', path: '/profile', icon: User },
          ],
        },
      ];
    }

    if (normalizedRole === 'owner' || normalizedRole === 'store_owner') {
      return [
        {
          title: 'DASHBOARD',
          items: [
            { label: 'Store Analytics', path: '/store-owner/dashboard', icon: LayoutDashboard },
          ],
        },
        {
          title: 'REVIEWS & RATINGS',
          items: [
            { label: 'Customer Feedback', path: '/store-owner/ratings', icon: Star },
          ],
        },
        {
          title: 'ACCOUNT',
          items: [
            { label: 'Store & Profile', path: '/profile', icon: User },
          ],
        },
      ];
    }

    // Default: Normal User
    return [
      {
        title: 'DISCOVERY',
        items: [
          { label: 'Explore Stores', path: '/user/dashboard', icon: Compass },
        ],
      },
      {
        title: 'MY RATINGS',
        items: [
          { label: 'My Submissions', path: '/user/ratings', icon: Star },
        ],
      },
      {
        title: 'ACCOUNT',
        items: [
          { label: 'Profile & Settings', path: '/profile', icon: User },
        ],
      },
    ];
  };

  const sections = getNavSections();

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className="sidebar-backdrop"
        onClick={onCloseMobile}
        style={{
          display: 'none',
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(2px)',
          zIndex: 35,
        }}
      />

      <aside
        style={{
          width: '260px',
          backgroundColor: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.5rem 1rem',
          minHeight: 'calc(100vh - 70px)',
          position: 'sticky',
          top: '70px',
          height: 'calc(100vh - 70px)',
          overflowY: 'auto',
          zIndex: 36,
          transition: 'all var(--transition-smooth)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {sections.map((section, idx) => (
            <div key={idx}>
              <div
                className="micro-label"
                style={{
                  padding: '0 0.75rem 0.5rem',
                  fontSize: '0.68rem',
                  letterSpacing: '0.08em',
                  color: 'var(--color-text-muted)',
                }}
              >
                {section.title}
              </div>

              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onCloseMobile}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                        backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                        boxShadow: isActive ? '0 2px 10px var(--color-primary-glow)' : 'none',
                        transition: 'all var(--transition-fast)',
                      })}
                    >
                      {({ isActive }) => (
                        <>
                          <Icon size={18} style={{ color: isActive ? '#FFFFFF' : 'inherit' }} />
                          <span style={{ flex: 1 }}>{item.label}</span>
                          {isActive && (
                            <motion.div
                              layoutId="activeIndicator"
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: '#FFFFFF',
                              }}
                            />
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
