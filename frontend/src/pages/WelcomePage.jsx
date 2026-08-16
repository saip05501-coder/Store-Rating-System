import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star, Shield, Sparkles, TrendingUp, Store, Users, ArrowRight,
  CheckCircle2, Compass, BarChart3, Award, ChevronRight, Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const WelcomePage = () => {
  const { isAuthenticated, role } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    const r = (role || '').toLowerCase();
    if (r === 'admin') return '/admin/dashboard';
    if (r === 'owner' || r === 'store_owner') return '/store-owner/dashboard';
    return '/user/dashboard';
  };

  const featureCards = [
    {
      icon: Compass,
      title: 'Seamless Discovery',
      description: 'Explore curated local retail stores, cafes, boutique outlets, and verified commercial shops.',
      color: 'var(--color-primary)',
      bg: 'var(--color-primary-light)',
    },
    {
      icon: Star,
      title: 'Authentic 1–5★ Ratings',
      description: 'Submit transparent customer ratings and reviews. View live score distributions instantly.',
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.12)',
    },
    {
      icon: BarChart3,
      title: 'Store Owner Analytics',
      description: 'Interactive spline trend charts, customer feedback breakdown, and reputation performance metrics.',
      color: '#22C55E',
      bg: 'rgba(34, 197, 94, 0.12)',
    },
    {
      icon: Shield,
      title: 'Admin Governance',
      description: 'Role-based access control, store catalog management, user moderations, and platform auditing.',
      color: '#0EA5E9',
      bg: 'rgba(14, 165, 233, 0.12)',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Browse Stores',
      desc: 'Search our real-time verified store catalog by name, location, or customer satisfaction score.',
    },
    {
      step: '02',
      title: 'Rate & Review',
      desc: 'Leave authentic 1 to 5 star ratings and help fellow community shoppers make informed decisions.',
    },
    {
      step: '03',
      title: 'Track Performance',
      desc: 'Store owners monitor customer sentiment trends and analytics in a MatDash-inspired SaaS dashboard.',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-app)', color: 'var(--color-text-primary)' }}>
      {/* Top Welcome Navbar */}
      <header
        style={{
          height: '74px',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--bg-header)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px var(--color-primary-glow)',
            }}
          >
            <Star size={20} fill="#FFFFFF" />
          </div>
          <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Sahi<span style={{ color: 'var(--color-primary)' }}>Hai</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated ? (
            <Link to={getDashboardPath()} className="btn-primary">
              Open Dashboard <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '5rem 2rem 4rem',
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '3.5rem',
          alignItems: 'center',
        }}
      >
        {/* Hero Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          <div className="section-tag">
            <Sparkles size={14} /> Next-Gen Store Rating Platform
          </div>

          <h1 className="heading-display">
            Elevate Store Discovery with <span style={{ color: 'var(--color-primary)' }}>Real Customer Insights</span>
          </h1>

          <p className="subheading" style={{ fontSize: '1.1rem', maxWidth: '520px' }}>
            SahiHai connects conscious shoppers with authentic verified businesses. Discover top-rated stores, submit honest ratings, and power your business with SaaS-grade rating analytics.
          </p>

          {/* CTA Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <Link
              to="/register"
              className="btn-primary"
              style={{ padding: '0.85rem 1.6rem', fontSize: '1rem' }}
            >
              Create Free Account <ArrowRight size={18} />
            </Link>

            <Link
              to="/login"
              className="btn-secondary"
              style={{ padding: '0.85rem 1.6rem', fontSize: '1rem' }}
            >
              Sign In to Portal
            </Link>
          </div>

          {/* Trust Highlights */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} /> Verified Ratings
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} /> Role-Based Access
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} /> MatDash Analytics
            </div>
          </div>
        </motion.div>

        {/* Hero Right Visual Mockup */}
        <motion.div
          initial={{ opacity: 0, x: 30, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          style={{ position: 'relative' }}
        >
          {/* Card Mockup Shell */}
          <div
            className="card-modern"
            style={{
              padding: '1.75rem',
              boxShadow: 'var(--shadow-hover)',
              border: '1px solid var(--color-primary-border)',
              position: 'relative',
              zIndex: 2,
            }}
          >
            {/* Header of Mockup */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <span className="micro-label">Featured Showcase</span>
                <h3 className="heading-md" style={{ fontSize: '1.25rem' }}>Grand City Retailers</h3>
              </div>
              <span className="badge badge-success">Top Rated 4.9★</span>
            </div>

            {/* Mock Image */}
            <motion.div
              style={{
                height: '180px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                position: 'relative',
                marginBottom: '1.25rem',
                cursor: 'pointer',
              }}
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            >
              <img
                src="/store-bg.jpg"
                alt="Store Showcase"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
              />
              <div
                style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(15, 23, 42, 0.75) 0%, transparent 60%)',
                }}
              />
              <div style={{ position: 'absolute', bottom: '0.85rem', left: '1rem', color: '#FFFFFF' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Fashion · Grocery · Beauty</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>All your stores, rated & verified</div>
              </div>
            </motion.div>

            {/* Quick Rating Preview */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--bg-surface-muted)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ display: 'flex', color: 'var(--color-star-active)' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={15} fill="currentColor" />
                  ))}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>4.9 / 5.0</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                1,248 Verified Ratings
              </span>
            </div>
          </div>

          {/* Floating Highlight Badge 1 */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: '-1.5rem',
              right: '-1.5rem',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-dropdown)',
              padding: '0.75rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              zIndex: 3,
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-success-bg)',
                color: 'var(--color-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Satisfaction</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>+98.4% Positive</div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Feature Cards Grid */}
      <section
        style={{
          padding: '4rem 2rem',
          maxWidth: '1280px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="section-tag">Powerful Features</span>
          <h2 className="heading-xl" style={{ marginTop: '0.75rem', fontSize: '2.1rem' }}>
            Built for Customers, Business Owners, & Administrators
          </h2>
          <p className="subheading" style={{ marginTop: '0.5rem', maxWidth: '600px', margin: '0.5rem auto 0' }}>
            Everything you need to discover great shopping destinations and analyze business reputation.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {featureCards.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="card-modern"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: feat.bg,
                    color: feat.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={24} />
                </div>
                <h3 className="heading-md">{feat.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  {feat.desc || feat.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Store Collage Visual Showcase ── */}
      <section style={{ padding: '0 0 4rem', overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', padding: '0 2rem 2rem' }}>
          <span className="section-tag">Our Universe of Stores</span>
          <h2 className="heading-xl" style={{ marginTop: '0.75rem', fontSize: '2rem' }}>
            Fashion · Grocery · Cosmetics · Electronics
          </h2>
        </div>

        {/* Full-width AI collage */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 100, damping: 18 }}
          style={{
            position: 'relative',
            height: '380px',
            overflow: 'hidden',
            cursor: 'zoom-in',
            borderRadius: 'var(--radius-xl)',
            margin: '0 2rem',
            boxShadow: 'var(--shadow-hover)',
          }}
        >
          <img
            src="/store-bg.jpg"
            alt="Combination of Fashion, Grocery and Cosmetics stores"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
          />
          {/* gradient overlay for readability */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(10,14,30,0.15) 0%, rgba(10,14,30,0.6) 100%)',
          }} />

          {/* Category chips */}
          <div style={{
            position: 'absolute', bottom: '1.5rem', left: '1.5rem',
            display: 'flex', gap: '0.6rem', flexWrap: 'wrap',
          }}>
            {['🛍 Fashion', '🛒 Grocery', '💄 Cosmetics', '⭐ Top Rated', '📍 Nearby Stores'].map((cat, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.1, backgroundColor: 'var(--color-primary)', color: '#fff' }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(10px)',
                  color: '#FFFFFF',
                  padding: '0.4rem 0.9rem',
                  borderRadius: '99px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.3)',
                  cursor: 'pointer',
                  display: 'inline-block',
                }}
              >
                {cat}
              </motion.span>
            ))}
          </div>

          {/* Live badge */}
          <motion.div
            animate={{ scale: [1, 1.07, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{
              position: 'absolute', top: '1.25rem', right: '1.5rem',
              backgroundColor: 'rgba(34, 197, 94, 0.92)',
              backdropFilter: 'blur(8px)',
              color: '#FFF',
              padding: '0.4rem 0.9rem',
              borderRadius: '99px',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}
          >
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#fff', display: 'inline-block' }} />
            Live Store Ratings
          </motion.div>
        </motion.div>
      </section>

      {/* 3-Step "How It Works" Section */}
      <section
        style={{
          padding: '4rem 2rem',
          backgroundColor: 'var(--bg-surface-muted)',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="section-tag">Simple Workflow</span>
            <h2 className="heading-xl" style={{ marginTop: '0.75rem' }}>
              How SahiHai Works in 3 Steps
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
            }}
          >
            {steps.map((s, idx) => (
              <div
                key={idx}
                className="card-modern"
                style={{
                  position: 'relative',
                  backgroundColor: 'var(--bg-surface)',
                  padding: '2rem 1.5rem',
                }}
              >
                <div
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    color: 'var(--color-primary)',
                    opacity: 0.25,
                    lineHeight: 1,
                    marginBottom: '1rem',
                  }}
                >
                  {s.step}
                </div>
                <h3 className="heading-md" style={{ marginBottom: '0.5rem' }}>{s.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section
        style={{
          padding: '5rem 2rem',
          maxWidth: '1280px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <div
          className="card-modern"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
            color: '#FFFFFF',
            padding: '3.5rem 2rem',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 20px 40px var(--color-primary-glow)',
          }}
        >
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Ready to Discover & Manage Verified Store Ratings?
          </h2>
          <p style={{ fontSize: '1.05rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 2rem' }}>
            Join thousands of shoppers and store owners today. Instant access, transparent scoring, and actionable SaaS analytics.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to="/register"
              style={{
                backgroundColor: '#FFFFFF',
                color: 'var(--color-primary-dark)',
                padding: '0.85rem 1.75rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: '0.95rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                padding: '0.85rem 1.75rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.95rem',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'var(--bg-surface)',
          padding: '2.5rem 2rem',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Star size={18} fill="var(--color-primary)" color="var(--color-primary)" />
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>SahiHai</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              © {new Date().getFullYear()} All Rights Reserved.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Create Account</Link>
            <span style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              ● Systems Operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;
