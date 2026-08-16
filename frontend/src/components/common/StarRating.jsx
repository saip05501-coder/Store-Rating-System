import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const StarRating = ({
  rating = 0,
  onRatingChange,
  readOnly = false,
  size = 20,
  showValue = false,
  interactive = true,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating > 0 ? hoverRating : rating;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
        {[1, 2, 3, 4, 5].map((starValue) => {
          const isFilled = displayRating >= starValue;
          const isHalf = !isFilled && displayRating >= starValue - 0.5;

          return (
            <motion.button
              key={starValue}
              type="button"
              disabled={readOnly || !interactive}
              whileHover={!readOnly && interactive ? { scale: 1.25 } : {}}
              whileTap={!readOnly && interactive ? { scale: 0.9 } : {}}
              onMouseEnter={() => !readOnly && setHoverRating(starValue)}
              onMouseLeave={() => !readOnly && setHoverRating(0)}
              onClick={() => {
                if (!readOnly && onRatingChange) {
                  onRatingChange(starValue);
                }
              }}
              style={{
                cursor: readOnly ? 'default' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px',
                color: isFilled || isHalf ? 'var(--color-star-active)' : 'var(--color-star-inactive)',
                transition: 'color 0.15s ease',
              }}
            >
              <Star
                size={size}
                fill={isFilled ? 'currentColor' : isHalf ? 'url(#half-star)' : 'none'}
                strokeWidth={2}
              />
            </motion.button>
          );
        })}
      </div>

      {showValue && (
        <span
          style={{
            fontSize: `${Math.max(12, size * 0.75)}px`,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginLeft: '0.2rem',
          }}
        >
          {Number(rating || 0).toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
