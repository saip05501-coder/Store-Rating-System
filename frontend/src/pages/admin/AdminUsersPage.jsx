import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';
import { Eye, Plus, Users, User, Shield, Store, Mail, MapPin, Calendar, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    role: 'user',
  });

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await adminService.getUsers({
        name: search,
        email: search,
        role: roleFilter || undefined,
        page,
        limit,
      });
      setUsers(res.data.rows || []);
      setTotal(res.data.pagination?.total || 0);
    } catch (err) {
      console.error('Error fetching users:', err);
      setErrorMsg(err.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, page]);

  const handleViewUser = async (user) => {
    try {
      const response = await adminService.getUserById(user.id);
      setSelectedUser(response.data);
      setIsViewModalOpen(true);
    } catch (err) {
      setToast({ message: err.message || 'Unable to load user details.', type: 'error' });
    }
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    if (newUser.name.trim().length < 2 || newUser.name.trim().length > 60) {
      setToast({ message: 'Full name must be between 2 and 60 characters.', type: 'error' });
      return;
    }

    setCreating(true);
    try {
      await adminService.createUser({
        ...newUser,
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        address: newUser.address.trim() || null,
      });
      setToast({ message: 'User account created successfully.', type: 'success' });
      setIsCreateModalOpen(false);
      setNewUser({ name: '', email: '', address: '', password: '', role: 'user' });
      fetchUsers();
    } catch (err) {
      setToast({ message: err.message || 'Unable to create the user account.', type: 'error' });
    } finally {
      setCreating(false);
    }
  };

  const columns = [
    {
      header: 'User / ID',
      accessorKey: 'name',
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
            {row.name ? row.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{row.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>UID #{row.id}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Email Address',
      accessorKey: 'email',
      render: (row) => (
        <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>{row.email}</span>
      ),
    },
    {
      header: 'Assigned Role',
      accessorKey: 'role',
      render: (row) => <span className={`badge badge-${row.role}`}>{row.role}</span>,
    },
    {
      header: 'Address',
      accessorKey: 'address',
      render: (row) => (
        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.825rem' }}>
          {row.address || '—'}
        </span>
      ),
    },
    {
      header: 'Member Since',
      accessorKey: 'created_at',
      render: (row) => (
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          {new Date(row.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <button
          className="btn-secondary"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', gap: '0.35rem' }}
          onClick={() => handleViewUser(row)}
        >
          <Eye size={14} /> Inspect
        </button>
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
            <Users size={13} /> User Governance
          </div>
          <h1 className="heading-xl">User Directory & Management</h1>
          <p className="subheading" style={{ marginTop: '0.2rem' }}>
            View, filter, create, and audit all system registered user profiles.
          </p>
        </div>

        <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={16} /> Add New User
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

      {/* Filters Toolbar */}
      <div className="card-modern" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <select
              className="input-modern"
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              style={{ width: 'auto', minWidth: '200px' }}
            >
              <option value="">All Account Roles</option>
              <option value="admin">Administrator (admin)</option>
              <option value="owner">Store Owner (owner)</option>
              <option value="user">Normal User (user)</option>
            </select>
          </div>

          <span className="badge badge-primary">
            {total} Total Registered Users
          </span>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={(p) => setPage(p)}
        searchValue={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        searchPlaceholder="Search users by name or email..."
        emptyMessage="No user accounts matched your search criteria."
      />

      {/* User Details Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="User Account Dossier">
        {selectedUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border-subtle)' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.35rem',
                  fontWeight: 800,
                }}
              >
                {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h4 className="heading-md" style={{ fontSize: '1.15rem' }}>{selectedUser.name}</h4>
                <div style={{ marginTop: '0.2rem' }}>
                  <span className={`badge badge-${selectedUser.role}`}>{selectedUser.role}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', fontSize: '0.875rem' }}>
              <div>
                <span className="micro-label">Email Address</span>
                <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px' }}>{selectedUser.email}</div>
              </div>
              <div>
                <span className="micro-label">User Account ID</span>
                <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px' }}>UID #{selectedUser.id}</div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <span className="micro-label">Registered Address</span>
                <div style={{ fontWeight: 500, color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  {selectedUser.address || 'No address registered.'}
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <span className="micro-label">Registration Date</span>
                <div style={{ fontWeight: 500, color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  {new Date(selectedUser.created_at).toLocaleString()}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setIsViewModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add User Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New User Account">
        <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="form-label">Full Name</label>
              <span className="form-helper">2–60 characters</span>
            </div>
            <input
              required
              minLength={2}
              maxLength={60}
              className="input-modern"
              placeholder="e.g. John Doe / Mahesh Mane"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email Address</label>
            <input
              required
              type="email"
              className="input-modern"
              placeholder="user@example.com"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Account Role</label>
            <select
              className="input-modern"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="user">Normal User</option>
              <option value="owner">Store Owner</option>
              <option value="admin">System Administrator</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Physical Address (Optional)</label>
            <input
              maxLength={400}
              className="input-modern"
              placeholder="e.g. 500 West 33rd Street, New York"
              value={newUser.address}
              onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="form-label">Password</label>
              <span className="form-helper">8-16 chars, 1 uppercase, 1 special</span>
            </div>
            <input
              required
              type="password"
              minLength={8}
              maxLength={16}
              className="input-modern"
              placeholder="••••••••"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={creating}>
              {creating ? <div className="spinner" /> : <><Plus size={16} /> Create User</>}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminUsersPage;
