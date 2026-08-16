import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail, Star, ExternalLink, Sparkles } from 'lucide-react';
import StarRating from './StarRating';

// Curated high quality retail/storefront images for visual richness
const STORE_IMAGES = [
  'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519748771451-a94c5963879f?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=600&auto=format&fit=crop&q=80',
];

const getStoreImage = (id) => {
  const index = (id || 1) % STORE_IMAGES.length;
  return STORE_IMAGES[index];
};

const StoreCard = ({ store, onRate, onViewDetails }) => {
  const avgRating = Number(store.avg_rating || store.average_rating || 0);
  const ratingCount = Number(store.rating_count || store.total_ratings || 0);
  const userRating = store.user_submitted_rating;
  const imageUrl = store.image_url || getStoreImage(store.id);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="card-modern card-hoverable"
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden',
      }}
    >
      {/* Store Cover Image */}
      <div style={{ position: 'relative', height: '160px', width: '100%', overflow: 'hidden' }}>
        <img
          src={imageUrl}
          alt={store.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
          onError={(e) => {
            e.target.src = STORE_IMAGES[0];
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.7) 0%, transparent 60%)',
          }}
        />

        {/* Rating Score Badge on Image */}
        <div
          style={{
            position: 'absolute',
            bottom: '0.75rem',
            left: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#FFFFFF',
          }}
        >
          <Star size={14} fill="var(--color-star-active)" color="var(--color-star-active)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
            {avgRating > 0 ? avgRating.toFixed(1) : 'New'}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>
            ({ratingCount})
          </span>
        </div>

        {/* User's Submitted Rating Badge */}
        {userRating && (
          <div
            style={{
              position: 'absolute',
              top: '0.75rem',
              right: '0.75rem',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              padding: '0.25rem 0.6rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.75rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            <Sparkles size={12} /> You rated {userRating}★
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          <h3
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              marginBottom: '0.4rem',
            }}
          >
            {store.name}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
            <MapPin size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {store.address}
            </span>
          </div>

          {store.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-muted)', fontSize: '0.78rem', marginBottom: '1rem' }}>
              <Mail size={13} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {store.email}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
          {onRate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRate(store);
              }}
              className="btn-primary"
              style={{ flex: 1, padding: '0.55rem 0.85rem', fontSize: '0.825rem' }}
            >
              <Star size={14} />
              {userRating ? 'Modify Rating' : 'Rate Store'}
            </button>
          )}

          {onViewDetails && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(store);
              }}
              className="btn-secondary"
              style={{ padding: '0.55rem 0.85rem', fontSize: '0.825rem' }}
              title="View Store Details"
            >
              <ExternalLink size={14} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StoreCard;
