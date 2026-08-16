import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Lock, Mail, ArrowRight, Eye, EyeOff, Star,
  Store, CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

/* ─── Bottom trust strip ─── */
const TRUST_ITEMS = [
  { icon: <CheckCircle2 size={18} />, title: 'Verified Reviews', desc: 'Real feedback from real shoppers' },
  { icon: <Store size={18} />, title: 'All in One Place', desc: 'Grocery, Fashion, Cosmetics & more' },
  { icon: <Star size={18} fill="currentColor" />, title: 'Better Choices', desc: 'Choose the best, rated with confidence' },
];

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [errorMsg, setErrorMsg]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setErrorMsg('Please provide both email and password.'); return; }
    setLoading(true); setErrorMsg('');
    try {
      const loggedUser = await login({ email, password });
      const r = (loggedUser.role || '').toLowerCase();
      if (r === 'admin') navigate('/admin/dashboard');
      else if (r === 'owner' || r === 'store_owner') navigate('/store-owner/dashboard');
      else navigate('/user/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (e, demoEmail, demoPassword) => {
    e.preventDefault();
    setEmail(demoEmail); setPassword(demoPassword); setErrorMsg('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      {/* ── Store Background ── */}
      <motion.div
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url('/clothing.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
        }}
      />

      {/* ── Dark atmospheric overlay ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(10,14,30,0.88) 0%, rgba(20,30,55,0.78) 40%, rgba(60,40,120,0.50) 100%)',
        zIndex: 1,
      }} />

      {/* ── Main content wrapper ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '2.5rem 1rem',
        position: 'relative', zIndex: 4,
      }}>

        {/* ── Login Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
          className="card-modern"
          style={{
            width: '100%', maxWidth: '440px',
            padding: '2.25rem 2rem',
            boxShadow: '0 32px 72px -12px rgba(0,0,0,0.6)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          {/* Brand */}
          <div style={{ textAlign: 'center', marginBottom: '1.6rem' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
              <div style={{
                width: '42px', height: '42px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-primary)',
                color: '#FFF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px var(--color-primary-glow)',
              }}>
                <Star size={22} fill="#FFF" />
              </div>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
                Sahi<span style={{ color: 'var(--color-primary)' }}>Hai</span>
              </span>
            </Link>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-primary)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              DISCOVER · RATE · TRUST
            </div>
            <h2 className="heading-xl" style={{ fontSize: '1.4rem' }}>Welcome Back</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
              Sign in to discover stores, submit ratings, and manage analytics.
            </p>
          </div>

          {/* Error */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{
                backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)',
                border: '1px solid var(--color-danger-border)',
                padding: '0.7rem 1rem', borderRadius: 'var(--radius-sm)',
                fontSize: '0.83rem', marginBottom: '1.1rem',
              }}
            >
              {errorMsg}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={17} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input type="email" required className="input-modern" style={{ paddingLeft: '2.6rem' }}
                  placeholder="name@company.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={17} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input type={showPassword ? 'text' : 'password'} required className="input-modern"
                  style={{ paddingLeft: '2.6rem', paddingRight: '2.8rem' }}
                  placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit" disabled={loading} className="btn-primary"
              whileHover={{ scale: 1.025 }} whileTap={{ scale: 0.97 }}
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', marginTop: '0.25rem' }}
            >
              {loading ? <div className="spinner" /> : <>Sign In <ArrowRight size={18} /></>}
            </motion.button>
          </form>

          {/* Demo autofill */}
          <div style={{ marginTop: '1.4rem', paddingTop: '1.1rem', borderTop: '1px solid var(--color-border-subtle)' }}>
            <span className="micro-label" style={{ display: 'block', textAlign: 'center', marginBottom: '0.6rem' }}>
              Quick Demo Autofill
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.45rem' }}>
              {[
                { label: '👑 Admin', email: 'admin@storerating.com', pw: 'Admin@1234' },
                { label: '🏪 Owner', email: 'owner1@store.com',       pw: 'Owner@1234' },
                { label: '👤 User',  email: 'alice.johnson.shopper@gmail.com', pw: 'Alice@1234' },
              ].map(d => (
                <motion.button key={d.label} type="button" className="btn-secondary"
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  style={{ fontSize: '0.73rem', padding: '0.4rem 0.2rem' }}
                  onClick={e => handleDemoFill(e, d.email, d.pw)}>
                  {d.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Register link */}
          <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.83rem', color: 'var(--color-text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>Create Account</Link>
          </div>
        </motion.div>

        {/* ── Bottom trust strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          style={{
            display: 'flex', gap: '2rem', flexWrap: 'wrap',
            justifyContent: 'center', marginTop: '2rem',
          }}
        >
          {TRUST_ITEMS.map((t, i) => (
            <motion.div key={i}
              whileHover={{ scale: 1.06, y: -3 }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem',
                backgroundColor: 'rgba(255,255,255,0.10)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.5rem',
                color: '#FFFFFF', cursor: 'default', minWidth: '140px',
              }}
            >
              <div style={{ color: 'var(--color-primary)' }}>{t.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.83rem' }}>{t.title}</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.75, textAlign: 'center' }}>{t.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
