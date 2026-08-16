import React, { useState } from 'react';
import Modal from './Modal';
import StarRating from './StarRating';
import RatingDistribution from './RatingDistribution';
import { MapPin, Mail, User, Star, Calendar, ShieldCheck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const STORE_IMAGES = [
  'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1000&auto=format&fit=crop&q=80',
];

const StoreDetailsModal = ({
  isOpen,
  onClose,
  store,
  onSubmitRating,
  canRate = true,
}) => {
  if (!store) return null;

  const [ratingVal, setRatingVal] = useState(store.user_submitted_rating || 5);
  const [submitting, setSubmitting] = useState(false);

  const avgRating = Number(store.avg_rating || store.average_rating || 0);
  const ratingCount = Number(store.rating_count || store.total_ratings || 0);

  // Generate mockup distribution based on avg rating if not provided
  const distribution = store.distribution || {
    5: Math.round(ratingCount * 0.6),
    4: Math.round(ratingCount * 0.25),
    3: Math.round(ratingCount * 0.1),
    2: Math.round(ratingCount * 0.03),
    1: Math.round(ratingCount * 0.02),
  };

  const handleRate = async (e) => {
    e.preventDefault();
    if (!onSubmitRating) return;
    setSubmitting(true);
    try {
      await onSubmitRating(store.id, ratingVal);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (err) {
        // silent confetti fail
      }
    } finally {
      setSubmitting(false);
    }
  };

  const coverImg = store.image_url || STORE_IMAGES[(store.id || 1) % STORE_IMAGES.length];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={store.name} maxWidth="680px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Cover Photo */}
        <div
          style={{
            height: '180px',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <img
            src={coverImg}
            alt={store.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(15, 23, 42, 0.8) 0%, transparent 60%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '1rem',
              left: '1.25rem',
              color: '#FFFFFF',
            }}
          >
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{store.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', opacity: 0.9 }}>
              <MapPin size={14} /> {store.address}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            padding: '1rem',
            backgroundColor: 'var(--bg-surface-muted)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Mail size={16} style={{ color: 'var(--color-primary)' }} />
            <div>
              <div className="micro-label">Contact Email</div>
              <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{store.email || 'N/A'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <User size={16} style={{ color: 'var(--color-primary)' }} />
            <div>
              <div className="micro-label">Store Owner</div>
              <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {store.owner_name || 'Verified Partner'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck size={16} style={{ color: 'var(--color-success)' }} />
            <div>
              <div className="micro-label">Status</div>
              <div style={{ fontWeight: 600, color: 'var(--color-success)' }}>Active & Verified</div>
            </div>
          </div>
        </div>

        {/* Rating Breakdown Section */}
        <div className="card-modern" style={{ padding: '1.25rem' }}>
          <h3 className="heading-md" style={{ marginBottom: '1rem' }}>
            Rating Summary & Breakdown
          </h3>
          <RatingDistribution
            distribution={distribution}
            totalRatings={ratingCount}
            averageRating={avgRating}
            showAverage={true}
          />
        </div>

        {/* Interactive Rate Component */}
        {canRate && onSubmitRating && (
          <form
            onSubmit={handleRate}
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-primary-border)',
              backgroundColor: 'var(--color-primary-light)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
                  {store.user_submitted_rating ? 'Update Your Rating' : 'Submit Your Rating'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  Select 1 to 5 stars to review this business
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <StarRating
                  rating={ratingVal}
                  onRatingChange={(v) => setRatingVal(v)}
                  size={26}
                  interactive={true}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  {submitting ? <div className="spinner" /> : <><Sparkles size={14} /> Save</>}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default StoreDetailsModal;
