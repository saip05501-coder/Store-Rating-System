import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { storeService } from '../../services/storeService';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import StarRating from '../../components/common/StarRating';
import Toast from '../../components/common/Toast';
import { Plus, Edit2, Trash2, Store, MapPin, Mail, User, AlertTriangle, ExternalLink, Sparkles } from 'lucide-react';

const AdminStoresPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const [ownersList, setOwnersList] = useState([]);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [errorMsg, setErrorMsg] = useState('');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedStore, setSelectedStore] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchStores = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await adminService.getStores({
        name: search,
        email: search,
        address: search,
        page,
        limit,
      });
      setStores(res.data.rows || []);
      setTotal(res.data.pagination?.total || 0);
    } catch (err) {
      console.error('Error fetching stores:', err);
      setErrorMsg(err.message || 'Failed to load store listing.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOwners = async () => {
    try {
      const res = await adminService.getUsers({ role: 'owner', limit: 100 });
      setOwnersList(res.data.rows || []);
    } catch (err) {
      console.error('Failed to load store owners:', err);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [search, page]);

  useEffect(() => {
    fetchOwners();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({ name: '', email: '', address: '', owner_id: '' });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (store) => {
    setSelectedStore(store);
    setFormData({
      name: store.name || '',
      email: store.email || '',
      address: store.address || '',
      owner_id: store.owner_id ? String(store.owner_id) : '',
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (store) => {
    setSelectedStore(store);
    setIsDeleteModalOpen(true);
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await adminService.createStore({
        ...formData,
        owner_id: formData.owner_id ? parseInt(formData.owner_id, 10) : null,
      });
      setToast({ message: 'Store created and published successfully.', type: 'success' });
      setIsAddModalOpen(false);
      fetchStores();
    } catch (err) {
      setToast({ message: err.message || 'Unable to register store.', type: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateStore = async (e) => {
    e.preventDefault();
    if (!selectedStore) return;
    setFormLoading(true);
    try {
      await storeService.updateStore(selectedStore.id, {
        ...formData,
        owner_id: formData.owner_id ? parseInt(formData.owner_id, 10) : null,
      });
      setToast({ message: 'Store profile updated successfully.', type: 'success' });
      setIsEditModalOpen(false);
      fetchStores();
    } catch (err) {
      setToast({ message: err.message || 'Unable to update store.', type: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteStore = async () => {
    if (!selectedStore) return;
    setFormLoading(true);
    try {
      await storeService.deleteStore(selectedStore.id);
      setToast({ message: `Store "${selectedStore.name}" removed successfully.`, type: 'success' });
      setIsDeleteModalOpen(false);
      fetchStores();
    } catch (err) {
      setToast({ message: err.message || 'Failed to delete store.', type: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [
    {
      header: 'Store Name / Location',
      accessorKey: 'name',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '0.925rem' }}>{row.name}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <MapPin size={12} style={{ color: 'var(--color-primary)' }} /> {row.address}
          </div>
        </div>
      ),
    },
    {
      header: 'Contact Email',
      accessorKey: 'email',
      render: (row) => <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{row.email}</span>,
    },
    {
      header: 'Assigned Owner',
      accessorKey: 'owner_name',
      render: (row) => (
        <span className="badge badge-primary">
          <User size={12} /> {row.owner_name || 'Unassigned'}
        </span>
      ),
    },
    {
      header: 'Customer Rating',
      accessorKey: 'avg_rating',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <StarRating rating={Number(row.avg_rating || 0)} readOnly showValue size={15} />
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            ({row.rating_count || 0})
          </span>
        </div>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            className="btn-secondary"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', gap: '0.3rem' }}
            onClick={() => handleOpenEditModal(row)}
            title="Edit Store"
          >
            <Edit2 size={13} /> Edit
          </button>
          <button
            className="btn-secondary"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', color: 'var(--color-danger)', borderColor: 'var(--color-danger-border)' }}
            onClick={() => handleOpenDeleteModal(row)}
            title="Delete Store"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div className="section-tag" style={{ marginBottom: '0.3rem' }}>
            <Store size={13} /> Store Directory
          </div>
          <h1 className="heading-xl">Registered Store Catalog</h1>
          <p className="subheading" style={{ marginTop: '0.2rem' }}>
            Maintain registered businesses, review customer score aggregates, and assign store ownership.
          </p>
        </div>

        <button className="btn-primary" onClick={handleOpenAddModal}>
          <Plus size={16} /> Add New Store
        </button>
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
        data={stores}
        loading={loading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={(p) => setPage(p)}
        searchValue={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        searchPlaceholder="Search stores by name, email, or address..."
        emptyMessage="No registered stores found."
      />

      {/* Add Store Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New Store">
        <form onSubmit={handleCreateStore} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Store Brand Name</label>
            <input
              required
              minLength={2}
              maxLength={120}
              className="input-modern"
              placeholder="e.g. Apex Tech & Electronics"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Store Official Email</label>
            <input
              required
              type="email"
              className="input-modern"
              placeholder="store@domain.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Store Physical Address</label>
            <input
              required
              minLength={5}
              maxLength={400}
              className="input-modern"
              placeholder="e.g. 104 Main Boulevard, Downtown"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Assign Store Owner (Optional)</label>
            <select
              className="input-modern"
              value={formData.owner_id}
              onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
            >
              <option value="">No owner assigned</option>
              {ownersList.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.email})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={formLoading}>
              {formLoading ? <div className="spinner" /> : <><Plus size={16} /> Save Store</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Store Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Store Details">
        <form onSubmit={handleUpdateStore} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Store Brand Name</label>
            <input
              required
              minLength={2}
              maxLength={120}
              className="input-modern"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Store Email</label>
            <input
              required
              type="email"
              className="input-modern"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Store Physical Address</label>
            <input
              required
              minLength={5}
              maxLength={400}
              className="input-modern"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Assigned Store Owner</label>
            <select
              className="input-modern"
              value={formData.owner_id}
              onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
            >
              <option value="">No owner assigned</option>
              {ownersList.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.email})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={formLoading}>
              {formLoading ? <div className="spinner" /> : <>Update Store</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-danger-bg)',
                color: 'var(--color-danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={22} />
            </div>
            <div>
              <h4 className="heading-md">Delete "{selectedStore?.name}"?</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                This action will permanently delete the store record and associated customer ratings.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </button>
            <button className="btn-danger" onClick={handleDeleteStore} disabled={formLoading}>
              {formLoading ? <div className="spinner" /> : <><Trash2 size={16} /> Delete Permanently</>}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminStoresPage;
