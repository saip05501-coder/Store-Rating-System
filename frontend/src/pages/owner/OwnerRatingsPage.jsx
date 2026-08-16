import React, { useState, useEffect } from 'react';
import { storeOwnerService } from '../../services/storeOwnerService';
import { userService } from '../../services/userService';
import DataTable from '../../components/common/DataTable';
import StarRating from '../../components/common/StarRating';
import EmptyState from '../../components/common/EmptyState';
import { Star, Store, Calendar, User, Mail, Sparkles } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const OwnerRatingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStoreId = searchParams.get('storeId') || '';

  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(initialStoreId);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchOwnedStores = async () => {
      try {
        const res = await userService.getOwnerDashboard();
        const ownedStores = res.data || [];
        setStores(ownedStores);

        if (ownedStores.length > 0 && !selectedStoreId) {
          setSelectedStoreId(String(ownedStores[0].id));
        }
      } catch (err) {
        console.error('Failed to fetch store list:', err);
      }
    };

    fetchOwnedStores();
  }, []);

  useEffect(() => {
    const fetchStoreRatings = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await storeOwnerService.getRatings({ page, limit });
        setRatings(res.data.rows || []);
        setTotal(res.data.pagination?.total || 0);
      } catch (err) {
        console.error('Failed to load store ratings:', err);
        setErrorMsg(err.message || 'Failed to load store ratings.');
      } finally {
        setLoading(false);
      }
    };

    fetchStoreRatings();
  }, [page]);

  const columns = [
    {
      header: 'Customer Details',
      accessorKey: 'user_name',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            {row.user_name ? row.user_name.charAt(0).toUpperCase() : 'C'}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{row.user_name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>UID #{row.user_id}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Customer Email',
      accessorKey: 'user_email',
      render: (row) => <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{row.user_email}</span>,
    },
    {
      header: 'Submitted Score',
      accessorKey: 'rating',
      render: (row) => <StarRating rating={row.rating} readOnly showValue size={17} />,
    },
    {
      header: 'Date Logged',
      accessorKey: 'created_at',
      render: (row) => (
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Calendar size={13} /> {new Date(row.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div>
        <div className="section-tag" style={{ marginBottom: '0.3rem' }}>
          <Star size={13} /> Customer Reviews
        </div>
        <h1 className="heading-xl">Customer Ratings & Feedback Log</h1>
        <p className="subheading" style={{ marginTop: '0.2rem' }}>
          Detailed chronological feedback from shoppers who reviewed your business.
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

      {/* Ratings Table */}
      <DataTable
        columns={columns}
        data={ratings}
        loading={loading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={(p) => setPage(p)}
        emptyMessage="No customer reviews have been submitted for this store yet."
      />
    </div>
  );
};

export default OwnerRatingsPage;
