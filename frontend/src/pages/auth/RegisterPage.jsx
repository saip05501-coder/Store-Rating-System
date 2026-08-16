import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  User, Mail, MapPin, Lock, ArrowRight, CheckCircle2,
  Store, Shield, ChevronLeft, Key, Star, Eye, EyeOff, Sparkles,
  ShoppingBag, ShoppingCart, Package, Tag,
} from 'lucide-react';
import { motion } from 'framer-motion';

const STORE_BADGES = [
  { icon: <ShoppingBag size={22} />, label: 'Fashion',  color: '#8B5CF6', top: '12%', left: '5%',   delay: 0.0  },
  { icon: <ShoppingCart size={22}/>, label: 'Grocery', color: '#6366F1', top: '20%', right: '5%',  delay: 0.15 },
  { icon: <Package size={22} />,     label: 'Grocery', color: '#EC4899', top: '70%', left: '5%',   delay: 0.3  },
  { icon: <Store size={22} />,       label: 'Stores',  color: '#F59E0B', top: '78%', right: '5%',  delay: 0.45 },
  { icon: <Tag size={22} />,         label: 'Deals',   color: '#10B981', top: '44%', left: '3.5%', delay: 0.6  },
  { icon: <Sparkles size={22} />,    label: 'Beauty',  color: '#F97316', top: '44%', right: '3.5%',delay: 0.75 },
];

const validatePassword = (pw) => {
  if (pw.length < 8 || pw.length > 16) return 'Password must be between 8 and 16 characters.';
  if (!/[A-Z]/.test(pw)) return 'Password must contain at least one uppercase letter.';
  if (!/[a-z]/.test(pw)) return 'Password must contain at least one lowercase letter.';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(pw)) return 'Password must contain at least one special character.';
  return null;
};

const RegisterPage = () => {
  const { register, registerOwner, registerAdmin } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('user'); // 'user' | 'owner' | 'admin'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    // Store Owner specific
    storeName: '',
    storeEmail: '',
    storeAddress: '',
    ownerInviteCode: 'SABLE-OWNER-2026',
    // Admin specific
    adminSecretCode: 'SABLE-ADMIN-2026',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Name length check (2 - 60 chars)
    if (formData.name.trim().length < 2 || formData.name.trim().length > 60) {
      setErrorMsg('Full Name must be between 2 and 60 characters.');
      return;
    }

    // Password validation
    const pwError = validatePassword(formData.password);
    if (pwError) {
      setErrorMsg(pwError);
      return;
    }

    setLoading(true);

    try {
      if (role === 'owner') {
        if (!formData.storeName || !formData.storeEmail || !formData.storeAddress) {
          setErrorMsg('Please provide all required store details.');
          setLoading(false);
          return;
        }
        await registerOwner(formData);
      } else if (role === 'admin') {
        if (!formData.adminSecretCode) {
          setErrorMsg('Administrator secret code is required.');
          setLoading(false);
          return;
        }
        await registerAdmin(formData);
      } else {
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          address: formData.address,
        });
      }

      setSuccessMsg('Account registered successfully! Redirecting to sign in...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please check the information provided.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* AI-Generated Store Collage Background */}
      <motion.div
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url('/store.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
        }}
      />
      {/* Dark Atmospheric Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(10,14,30,0.90) 0%, rgba(20,30,55,0.82) 40%, rgba(60,40,120,0.55) 100%)',
          zIndex: 1,
        }}
      />



      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="card-modern"
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '2.5rem 2rem',
          boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.45)',
          position: 'relative',
          zIndex: 3,
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px var(--color-primary-glow)',
              }}
            >
              <Star size={22} fill="#FFFFFF" />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
              Sahi<span style={{ color: 'var(--color-primary)' }}>Hai</span>
            </span>
          </Link>

          <h2 className="heading-xl" style={{ fontSize: '1.45rem' }}>Create Your Account</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
            Select your role to start rating stores or tracking your store's analytics.
          </p>
        </div>

        {/* Role Picker Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem',
            padding: '0.35rem',
            backgroundColor: 'var(--bg-surface-muted)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.75rem',
          }}
        >
          <button
            type="button"
            onClick={() => setRole('user')}
            style={{
              padding: '0.6rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.825rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              backgroundColor: role === 'user' ? 'var(--bg-surface)' : 'transparent',
              color: role === 'user' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              boxShadow: role === 'user' ? 'var(--shadow-xs)' : 'none',
              transition: 'all var(--transition-fast)',
            }}
          >
            <User size={15} /> Normal User
          </button>

          <button
            type="button"
            onClick={() => setRole('owner')}
            style={{
              padding: '0.6rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.825rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              backgroundColor: role === 'owner' ? 'var(--bg-surface)' : 'transparent',
              color: role === 'owner' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              boxShadow: role === 'owner' ? 'var(--shadow-xs)' : 'none',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Store size={15} /> Store Owner
          </button>

          <button
            type="button"
            onClick={() => setRole('admin')}
            style={{
              padding: '0.6rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.825rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              backgroundColor: role === 'admin' ? 'var(--bg-surface)' : 'transparent',
              color: role === 'admin' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              boxShadow: role === 'admin' ? 'var(--shadow-xs)' : 'none',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Shield size={15} /> Admin
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div
            style={{
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              border: '1px solid var(--color-danger-border)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
            }}
          >
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div
            style={{
              backgroundColor: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              border: '1px solid var(--color-success-border)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {/* Full Name */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="form-label">Full Name</label>
              <span className="form-helper">2 - 60 chars</span>
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
                name="name"
                required
                className="input-modern"
                style={{ paddingLeft: '2.6rem' }}
                placeholder="e.g. John Doe / Mahesh Mane"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email Address</label>
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
                name="email"
                required
                className="input-modern"
                style={{ paddingLeft: '2.6rem' }}
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="form-label">Password</label>
              <span className="form-helper">8-16 chars, 1 Uppercase, 1 Special</span>
            </div>
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
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                className="input-modern"
                style={{ paddingLeft: '2.6rem', paddingRight: '2.6rem' }}
                placeholder="e.g. SecurePass@123"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* User Address */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Personal Address</label>
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
                name="address"
                className="input-modern"
                style={{ paddingLeft: '2.6rem' }}
                placeholder="e.g. 742 Evergreen Terrace, Springfield"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Store Owner Details */}
          {role === 'owner' && (
            <div
              style={{
                padding: '1.25rem',
                backgroundColor: 'var(--color-primary-light)',
                border: '1px solid var(--color-primary-border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
              }}
            >
              <div className="micro-label" style={{ color: 'var(--color-primary)', fontWeight: 800 }}>
                Store Business Information
              </div>

              <div>
                <label className="form-label">Store Name</label>
                <input
                  type="text"
                  name="storeName"
                  required
                  className="input-modern"
                  placeholder="e.g. Blue Lagoon Boutique"
                  value={formData.storeName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="form-label">Store Official Email</label>
                <input
                  type="email"
                  name="storeEmail"
                  required
                  className="input-modern"
                  placeholder="contact@bluelagoon.com"
                  value={formData.storeEmail}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="form-label">Store Physical Address</label>
                <input
                  type="text"
                  name="storeAddress"
                  required
                  className="input-modern"
                  placeholder="e.g. 104 Ocean Drive, Suite 200, Miami"
                  value={formData.storeAddress}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="form-label">Owner Invite Code</label>
                <input
                  type="text"
                  name="ownerInviteCode"
                  required
                  className="input-modern"
                  value={formData.ownerInviteCode}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {/* Admin Secret Code */}
          {role === 'admin' && (
            <div
              style={{
                padding: '1.25rem',
                backgroundColor: 'var(--bg-surface-muted)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <label className="form-label">Administrator Secret Code</label>
              <div style={{ position: 'relative', marginTop: '0.4rem' }}>
                <Key
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
                  name="adminSecretCode"
                  required
                  className="input-modern"
                  style={{ paddingLeft: '2.6rem' }}
                  value={formData.adminSecretCode}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', marginTop: '0.5rem' }}
          >
            {loading ? <div className="spinner" /> : <>Create {role === 'owner' ? 'Store Owner' : role === 'admin' ? 'Admin' : ''} Account <ArrowRight size={18} /></>}
          </button>
        </form>

        {/* Bottom Link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
