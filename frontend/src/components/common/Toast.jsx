import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} className="text-emerald-500" style={{ color: 'var(--color-success)' }} />;
      case 'error':
      case 'danger':
        return <AlertCircle size={18} className="text-rose-500" style={{ color: 'var(--color-danger)' }} />;
      default:
        return <Info size={18} className="text-sky-500" style={{ color: 'var(--color-info)' }} />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'var(--color-success-border)';
      case 'error':
      case 'danger':
        return 'var(--color-danger-border)';
      default:
        return 'var(--color-info-border)';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          top: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-surface)',
          border: `1px solid ${getBorderColor()}`,
          boxShadow: 'var(--shadow-dropdown)',
          color: 'var(--color-text-primary)',
          maxWidth: '420px',
        }}
      >
        {getIcon()}
        <span style={{ fontSize: '0.875rem', fontWeight: 500, flex: 1 }}>{message}</span>
        <button
          onClick={onClose}
          style={{
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            padding: '2px',
          }}
        >
          <X size={16} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default Toast;
