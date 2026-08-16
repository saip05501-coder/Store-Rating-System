import React from 'react';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-modern"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '3rem 2rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-modal)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
            border: '1px solid var(--color-danger-border)',
          }}
        >
          <ShieldAlert size={32} />
        </div>

        <h1 className="heading-xl" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
          Access Denied
        </h1>
        
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '2rem', lineHeight: 1.5 }}>
          You do not have the required role privileges to access this page. Please sign in with an account that has appropriate authorization.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary"
            style={{ flex: 1 }}
          >
            <ArrowLeft size={16} /> Go Back
          </button>
          <Link
            to="/"
            className="btn-primary"
            style={{ flex: 1 }}
          >
            <Home size={16} /> Return Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default UnauthorizedPage;
