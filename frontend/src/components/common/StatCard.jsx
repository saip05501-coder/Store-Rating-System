import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  colorScheme = 'primary', // 'primary' | 'success' | 'warning' | 'info'
}) => {
  const getThemeStyles = () => {
    switch (colorScheme) {
      case 'success':
        return {
          iconBg: 'var(--color-success-bg)',
          iconColor: 'var(--color-success)',
          border: 'var(--color-success-border)',
        };
      case 'warning':
        return {
          iconBg: 'var(--color-warning-bg)',
          iconColor: 'var(--color-warning)',
          border: 'var(--color-warning-border)',
        };
      case 'info':
        return {
          iconBg: 'var(--color-info-bg)',
          iconColor: 'var(--color-info)',
          border: 'var(--color-info-border)',
        };
      default:
        return {
          iconBg: 'var(--color-primary-light)',
          iconColor: 'var(--color-primary)',
          border: 'var(--color-primary-border)',
        };
    }
  };

  const theme = getThemeStyles();

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      className="card-modern"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <span className="micro-label" style={{ display: 'block', marginBottom: '0.4rem' }}>
            {title}
          </span>
          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)',
            }}
          >
            {value}
          </div>
        </div>

        {Icon && (
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: theme.iconBg,
              color: theme.iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${theme.border}`,
            }}
          >
            <Icon size={22} />
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '1rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--color-border-subtle)',
          fontSize: '0.8rem',
          color: 'var(--color-text-secondary)',
        }}
      >
        {trend && (
          <span
            className={`badge ${trendPositive ? 'badge-success' : 'badge-danger'}`}
            style={{ padding: '0.15rem 0.5rem', fontSize: '0.72rem' }}
          >
            {trendPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend}
          </span>
        )}
        {subtitle && <span>{subtitle}</span>}
      </div>
    </motion.div>
  );
};

export default StatCard;
