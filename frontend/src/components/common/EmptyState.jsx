import React from 'react';
import { Inbox } from 'lucide-react';
import { motion } from 'framer-motion';

const EmptyState = ({ title = 'No records found', description = 'Try adjusting your search query or filter options.', action }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-modern"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3.5rem 2rem',
        margin: '1rem 0',
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
          marginBottom: '1.25rem',
          border: '1px solid var(--color-primary-border)',
        }}
      >
        <Inbox size={32} strokeWidth={1.75} />
      </div>
      <h3 className="heading-md" style={{ marginBottom: '0.4rem' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', maxWidth: '400px', marginBottom: action ? '1.5rem' : 0 }}>
        {description}
      </p>
      {action && <div>{action}</div>}
    </motion.div>
  );
};

export default EmptyState;
