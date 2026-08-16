import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/authService';
import Toast from '../components/common/Toast';
import {
  User, Mail, MapPin, Shield, Lock, Save, KeyRound,
  Sun, Moon, CheckCircle2, Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';

const ProfilePage = () => {
  const { user, updateProfile, role } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    address: user?.address || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validatePassword = (pw) => {
    if (pw.length < 8 || pw.length > 16) return 'Password must be 8–16 characters long.';
    if (!/[A-Z]/.test(pw)) return 'Password must contain at least one uppercase letter.';
    if (!/[a-z]/.test(pw)) return 'Password must contain at least one lowercase letter.';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pw)) return 'Password must contain at least one special character.';
    return null;
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileError('');

    if (profileForm.name.trim().length < 2 || profileForm.name.trim().length > 60) {
      setProfileError('Full Name must be between 2 and 60 characters.');
      return;
    }

    setProfileLoading(true);
    try {
      await updateProfile({
        name: profileForm.name.trim(),
        address: profileForm.address.trim() || null,
      });
      setToast({ message: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    const pwError = validatePassword(passwordForm.newPassword);
    if (pwError) {
      setPasswordError(pwError);
      return;
    }

    setPasswordLoading(true);
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setToast({ message: 'Password changed successfully!', type: 'success' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div>
        <div className="section-tag" style={{ marginBottom: '0.3rem' }}>
          <User size={13} /> Account Settings
        </div>
        <h1 className="heading-xl">Profile & Preferences</h1>
        <p className="subheading" style={{ marginTop: '0.2rem' }}>
          Manage your personal account profile, security credentials, and interface theme.
        </p>
      </div>

      {/* Account Identity Card */}
      <div className="card-modern">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              fontWeight: 800,
              boxShadow: '0 4px 14px var(--color-primary-glow)',
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h3 className="heading-md" style={{ fontSize: '1.25rem' }}>{user?.name}</h3>
              <span className={`badge badge-${role}`}>{role}</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              {user?.email}
            </div>
          </div>
        </div>
      </div>

      {/* Appearance & Theme Card */}
      <div className="card-modern">
        <h3 className="heading-md" style={{ marginBottom: '1rem' }}>Interface Appearance</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--bg-surface-muted)', borderRadius: 'var(--radius-md)' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
              Color Theme
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              Currently using {isDark ? 'Dark Theme (Midnight Slate)' : 'Light Theme (Clean White)'}
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="btn-secondary"
            style={{ gap: '0.5rem' }}
          >
            {isDark ? <><Sun size={16} style={{ color: '#F59E0B' }} /> Switch to Light</> : <><Moon size={16} /> Switch to Dark</>}
          </button>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="card-modern">
        <h3 className="heading-md" style={{ marginBottom: '1.25rem' }}>Personal Information</h3>

        {profileError && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-danger-border)',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
            }}
          >
            {profileError}
          </div>
        )}

        <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="form-label">Full Name</label>
              <span className="form-helper">2–60 chars</span>
            </div>
            <div style={{ position: 'relative' }}>
              <User
                size={18}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                }}
              />
              <input
                type="text"
                required
                className="input-modern"
                style={{ paddingLeft: '2.6rem' }}
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email Address (Read-only)</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                }}
              />
              <input
                type="email"
                disabled
                className="input-modern"
                style={{ paddingLeft: '2.6rem', opacity: 0.6, cursor: 'not-allowed' }}
                value={user?.email || ''}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Physical Address</label>
            <div style={{ position: 'relative' }}>
              <MapPin
                size={18}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                }}
              />
              <input
                type="text"
                className="input-modern"
                style={{ paddingLeft: '2.6rem' }}
                placeholder="Address"
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="submit" className="btn-primary" disabled={profileLoading}>
              {profileLoading ? <div className="spinner" /> : <><Save size={16} /> Save Profile Changes</>}
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password Change */}
      <div className="card-modern">
        <h3 className="heading-md" style={{ marginBottom: '1.25rem' }}>Security & Password</h3>

        {passwordError && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-danger-border)',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
            }}
          >
            {passwordError}
          </div>
        )}

        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Current Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                }}
              />
              <input
                type="password"
                required
                className="input-modern"
                style={{ paddingLeft: '2.6rem' }}
                placeholder="••••••••"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="form-label">New Password</label>
              <span className="form-helper">8–16 chars, 1 uppercase, 1 special</span>
            </div>
            <div style={{ position: 'relative' }}>
              <KeyRound
                size={18}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                }}
              />
              <input
                type="password"
                required
                className="input-modern"
                style={{ paddingLeft: '2.6rem' }}
                placeholder="••••••••"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <KeyRound
                size={18}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                }}
              />
              <input
                type="password"
                required
                className="input-modern"
                style={{ paddingLeft: '2.6rem' }}
                placeholder="••••••••"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="submit" className="btn-primary" disabled={passwordLoading}>
              {passwordLoading ? <div className="spinner" /> : <><Lock size={16} /> Update Password</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
