import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storeService } from '../../services/storeService';
import { ratingService } from '../../services/ratingService';
import StoreCard from '../../components/common/StoreCard';
import StarRating from '../../components/common/StarRating';
import StoreDetailsModal from '../../components/common/StoreDetailsModal';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';
import EmptyState from '../../components/common/EmptyState';
import {
  Search, SlidersHorizontal, Star, Sparkles, Compass,
  TrendingUp, Award, CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

const CATEGORIES = [
  'All Stores',
  'Electronics & Tech',
  'Fashion & Boutique',
  'Dining & Cafes',
  'Supermarkets & Groceries',
  'Books & Stationery',
];

const UserDashboardPage = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Stores');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Modals
  const [selectedStoreForRate, setSelectedStoreForRate] = useState(null);
  const [userRating, setUserRating] = useState(5);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [selectedStoreForDetails, setSelectedStoreForDetails] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [errorMsg, setErrorMsg] = useState('');

  const fetchStores = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await storeService.getStores({
        search,
        sortBy,
        sortOrder,
        page,
        limit: 12,
      });
      setStores(res.data.rows || []);
      setTotal(res.data.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to load stores:', err);
      setErrorMsg(err.message || 'Failed to load store catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [search, sortBy, sortOrder, page]);

  const handleOpenRateModal = (store) => {
    setSelectedStoreForRate(store);
    setUserRating(store.user_submitted_rating || 5);
    setIsRateModalOpen(true);
  };

  const handleOpenDetails = (store) => {
    setSelectedStoreForDetails(store);
    setIsDetailsModalOpen(true);
  };

  const handleSubmitRating = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!selectedStoreForRate) return;

    setSubmitting(true);
    try {
      if (selectedStoreForRate.user_submitted_rating) {
        await ratingService.modifyStoreRating(selectedStoreForRate.id, userRating);
      } else {
        await ratingService.submitStoreRating(selectedStoreForRate.id, userRating);
      }

      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (cErr) {
        // silent fail
      }

      setToast({
        message: `Your ${userRating}-star rating for "${selectedStoreForRate.name}" has been recorded!`,
        type: 'success',
      });
      setIsRateModalOpen(false);
      fetchStores();
    } catch (err) {
      setToast({ message: err.message || 'Failed to submit rating.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDirectDetailsRating = async (storeId, newRating) => {
    const targetStore = stores.find((s) => s.id === storeId) || selectedStoreForDetails;
    if (!targetStore) return;

    if (targetStore.user_submitted_rating) {
      await ratingService.modifyStoreRating(storeId, newRating);
    } else {
      await ratingService.submitStoreRating(storeId, newRating);
    }

    setToast({
      message: `Rating updated to ${newRating} stars for "${targetStore.name}"!`,
      type: 'success',
    });
    fetchStores();
    setIsDetailsModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Welcome Hero Banner */}
      <div
        className="card-modern"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
          color: '#FFFFFF',
          padding: '2.25rem 2rem',
          borderRadius: 'var(--radius-xl)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 30px var(--color-primary-glow)',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '640px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}
          >
            <Sparkles size={13} /> Verified Store Discovery
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Welcome, {user?.name ? user.name.split(' ')[0] : 'Shopper'}! 👋
          </h1>
          <p style={{ fontSize: '0.95rem', opacity: 0.9, lineHeight: 1.5 }}>
            Discover trusted neighborhood businesses, browse authentic customer ratings, and share your own rating experience.
          </p>
        </div>

        {/* Floating Background Accent */}
        <div
          style={{
            position: 'absolute',
            right: '-40px',
            bottom: '-40px',
            width: '220px',
            height: '220px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {errorMsg && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-danger-border)',
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* Discovery & Search Bar Toolbar */}
      <div className="card-modern" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '440px' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                }}
              />
              <input
                type="text"
                className="input-modern"
                style={{ paddingLeft: '2.6rem' }}
                placeholder="Search by store name, keyword, or city..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <SlidersHorizontal size={16} style={{ color: 'var(--color-text-muted)' }} />
                <span className="micro-label">Sort:</span>
              </div>
              <select
                className="input-modern"
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                style={{ width: 'auto', padding: '0.6rem 0.9rem' }}
              >
                <option value="name">Store Name (A-Z)</option>
                <option value="rating">Highest Customer Rating</option>
                <option value="created_at">Recently Added</option>
              </select>

              <select
                className="input-modern"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                style={{ width: 'auto', padding: '0.6rem 0.8rem' }}
              >
                <option value="ASC">Ascending</option>
                <option value="DESC">Descending</option>
              </select>
            </div>
          </div>

          {/* Category Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', paddingBottom: '2px' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.8rem',
                  fontWeight: selectedCategory === cat ? 700 : 500,
                  backgroundColor: selectedCategory === cat ? 'var(--color-primary)' : 'var(--bg-surface-muted)',
                  color: selectedCategory === cat ? '#FFFFFF' : 'var(--color-text-secondary)',
                  border: selectedCategory === cat ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                  whiteSpace: 'nowrap',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Store Grid */}
      {loading ? (
        <div className="grid-responsive">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="card-modern" style={{ height: '280px' }}>
              <div className="skeleton" style={{ height: '160px', width: '100%', borderRadius: 'var(--radius-sm)' }} />
              <div className="skeleton" style={{ height: '20px', width: '60%', marginTop: '1rem' }} />
              <div className="skeleton" style={{ height: '14px', width: '80%', marginTop: '0.5rem' }} />
            </div>
          ))}
        </div>
      ) : stores.length === 0 ? (
        <EmptyState
          title="No Stores Match Your Search"
          description="We couldn't find any registered businesses matching your current query or category filter."
          action={
            <button className="btn-secondary" onClick={() => { setSearch(''); setSelectedCategory('All Stores'); }}>
              Reset Filters
            </button>
          }
        />
      ) : (
        <div className="grid-responsive">
          {stores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              onRate={handleOpenRateModal}
              onViewDetails={handleOpenDetails}
            />
          ))}
        </div>
      )}

      {/* Interactive Rate Store Modal */}
      <Modal
        isOpen={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        title={selectedStoreForRate?.user_submitted_rating ? 'Update Your Store Rating' : 'Submit Customer Rating'}
      >
        {selectedStoreForRate && (
          <form onSubmit={handleSubmitRating}>
            <div style={{ textAlign: 'center', margin: '0.75rem 0 1.75rem' }}>
              <h4 className="heading-md" style={{ fontSize: '1.2rem' }}>
                {selectedStoreForRate.name}
              </h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                {selectedStoreForRate.address}
              </p>

              <div
                style={{
                  margin: '1.75rem 0',
                  padding: '1.5rem',
                  backgroundColor: 'var(--bg-surface-muted)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <span className="micro-label">Tap a star to rate</span>
                <StarRating
                  rating={userRating}
                  onRatingChange={(val) => setUserRating(val)}
                  size={38}
                  interactive={true}
                />
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {userRating} of 5 Stars
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsRateModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
              >
                {submitting ? <div className="spinner" /> : <><Star size={16} /> Save Rating</>}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Store Details Modal with Breakdown */}
      <StoreDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        store={selectedStoreForDetails}
        onSubmitRating={handleDirectDetailsRating}
        canRate={true}
      />
    </div>
  );
};

export default UserDashboardPage;
