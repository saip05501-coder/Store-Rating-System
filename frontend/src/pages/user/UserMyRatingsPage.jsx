import React, { useState, useEffect } from 'react';
import { ratingService } from '../../services/ratingService';
import DataTable from '../../components/common/DataTable';
import StarRating from '../../components/common/StarRating';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';
import { Edit2, Star, Sparkles, MapPin, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';

const UserMyRatingsPage = () => {
  const [myRatings, setMyRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [selectedRating, setSelectedRating] = useState(null);
  const [newRatingValue, setNewRatingValue] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [errorMsg, setErrorMsg] = useState('');

  const fetchMyRatings = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await ratingService.getMyRatings({ page, limit });
      setMyRatings(res.data.rows || []);
      setTotal(res.data.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to fetch user ratings:', err);
      setErrorMsg(err.message || 'Failed to load your submitted ratings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRatings();
  }, [page]);

  const handleOpenEditModal = (item) => {
    setSelectedRating(item);
    setNewRatingValue(item.rating);
    setIsModalOpen(true);
  };

  const handleUpdateRating = async (e) => {
    e.preventDefault();
    if (!selectedRating) return;

    setSubmitting(true);
    try {
      await ratingService.submitRating({
        store_id: selectedRating.store_id,
        rating: newRatingValue,
      });

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (c) {}

      setToast({ message: 'Rating updated successfully!', type: 'success' });
      setIsModalOpen(false);
      fetchMyRatings();
    } catch (err) {
      setToast({ message: err.message || 'Failed to update rating.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Store / Location',
      accessorKey: 'store_name',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '0.925rem' }}>{row.store_name}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <MapPin size={12} style={{ color: 'var(--color-primary)' }} /> {row.store_address}
          </div>
        </div>
      ),
    },
    {
      header: 'Your Submitted Rating',
      accessorKey: 'rating',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <StarRating rating={row.rating} readOnly showValue size={17} />
        </div>
      ),
    },
    {
      header: 'Date Submitted / Modified',
      accessorKey: 'updated_at',
      render: (row) => (
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Calendar size={13} /> {new Date(row.updated_at || row.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <button
          className="btn-secondary"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', gap: '0.35rem' }}
          onClick={() => handleOpenEditModal(row)}
        >
          <Edit2 size={14} /> Modify Rating
        </button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div>
        <div className="section-tag" style={{ marginBottom: '0.3rem' }}>
          <Star size={13} /> Rating Activity
        </div>
        <h1 className="heading-xl">My Submitted Store Ratings</h1>
        <p className="subheading" style={{ marginTop: '0.2rem' }}>
          Review, modify, or inspect all store ratings and feedback you have submitted across the platform.
        </p>
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

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={myRatings}
        loading={loading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={(p) => setPage(p)}
        emptyMessage="You have not submitted any store ratings yet. Explore stores and share your feedback!"
      />

      {/* Edit Rating Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Modify Submitted Rating">
        {selectedRating && (
          <form onSubmit={handleUpdateRating}>
            <div style={{ textAlign: 'center', margin: '0.75rem 0 1.75rem' }}>
              <h4 className="heading-md" style={{ fontSize: '1.2rem' }}>{selectedRating.store_name}</h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                {selectedRating.store_address}
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
                <span className="micro-label">Adjust your score</span>
                <StarRating
                  rating={newRatingValue}
                  onRatingChange={(val) => setNewRatingValue(val)}
                  size={38}
                />
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {newRatingValue} of 5 Stars
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? <div className="spinner" /> : <><Star size={16} /> Save Changes</>}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default UserMyRatingsPage;
