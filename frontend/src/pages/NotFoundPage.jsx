import React from 'react';
import { Compass, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
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
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            border: '1px solid var(--color-primary-border)',
          }}
        >
          <Compass size={32} />
        </div>

        <div
          style={{
            fontSize: '3.5rem',
            fontWeight: 900,
            color: 'var(--color-primary)',
            lineHeight: 1,
            marginBottom: '0.5rem',
            letterSpacing: '-0.03em',
          }}
        >
          404
        </div>

        <h1 className="heading-lg" style={{ marginBottom: '0.5rem' }}>
          Page Not Found
        </h1>
        
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '2rem', lineHeight: 1.5 }}>
          The requested page route could not be found or has been moved. Check the URL or return to safety.
        </p>

        <Link to="/" className="btn-primary" style={{ width: '100%' }}>
          <Home size={16} /> Return to Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
