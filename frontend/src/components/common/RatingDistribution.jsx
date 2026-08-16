import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const RatingDistribution = ({ distribution = {}, totalRatings = 0, showAverage = true, averageRating = 0 }) => {
  const starKeys = [5, 4, 3, 2, 1];

  const getColorForStar = (star) => {
    switch (star) {
      case 5:
        return 'var(--color-success)';
      case 4:
        return 'var(--color-primary)';
      case 3:
        return 'var(--color-warning)';
      case 2:
        return '#F97316'; // orange
      case 1:
        return 'var(--color-danger)';
      default:
        return 'var(--color-primary)';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {showAverage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '0.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>
              {Number(averageRating || 0).toFixed(1)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '4px' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={14}
                  fill={averageRating >= s ? 'var(--color-star-active)' : 'none'}
                  color={averageRating >= s ? 'var(--color-star-active)' : 'var(--color-star-inactive)'}
                />
              ))}
            </div>
            <span className="micro-label" style={{ display: 'block', marginTop: '4px' }}>
              {totalRatings} {totalRatings === 1 ? 'Review' : 'Reviews'}
            </span>
          </div>

          <div style={{ flex: 1, borderLeft: '1px solid var(--color-border)', paddingLeft: '1.25rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              Overall customer satisfaction score based on verified user submissions.
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {starKeys.map((star) => {
          const count = distribution[star] || 0;
          const percentage = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;
          const barColor = getColorForStar(star);

          return (
            <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.825rem' }}>
              <div
                style={{
                  width: '38px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  color: 'var(--color-text-primary)',
                }}
              >
                <span>{star}</span>
                <Star size={13} fill="var(--color-star-active)" color="var(--color-star-active)" />
              </div>

              <div
                style={{
                  flex: 1,
                  height: '8px',
                  backgroundColor: 'var(--bg-surface-muted)',
                  borderRadius: 'var(--radius-pill)',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    backgroundColor: barColor,
                    borderRadius: 'var(--radius-pill)',
                  }}
                />
              </div>

              <div
                style={{
                  width: '70px',
                  textAlign: 'right',
                  fontSize: '0.78rem',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 500,
                }}
              >
                <span>{count}</span> <span style={{ color: 'var(--color-text-muted)' }}>({percentage}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RatingDistribution;
