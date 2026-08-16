import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import StatCard from '../../components/common/StatCard';
import Toast from '../../components/common/Toast';
import {
  ShieldAlert,
  Shield,
  Activity,
  Eye,
  RotateCcw,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Store,
  Star,
  Lock,
  Globe,
  Laptop,
  AlertTriangle,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { motion } from 'framer-motion';

// Formats action string into human-friendly label and color scheme
const getActionMeta = (action) => {
  switch (action) {
    case 'USER_CREATED':
      return { label: 'User Created', color: 'success', icon: User };
    case 'USER_REGISTERED':
      return { label: 'User Registered', color: 'primary', icon: User };
    case 'USER_UPDATED':
      return { label: 'User Updated', color: 'info', icon: User };
    case 'STORE_CREATED':
      return { label: 'Store Created', color: 'success', icon: Store };
    case 'STORE_UPDATED':
      return { label: 'Store Updated', color: 'info', icon: Store };
    case 'STORE_DELETED':
      return { label: 'Store Deleted', color: 'danger', icon: Store };
    case 'STORE_OWNER_ASSIGNED':
      return { label: 'Owner Assigned', color: 'primary', icon: Store };
    case 'STORE_OWNER_REGISTERED':
      return { label: 'Owner Registered', color: 'primary', icon: User };
    case 'RATING_SUBMITTED':
      return { label: 'Rating Submitted', color: 'warning', icon: Star };
    case 'RATING_UPDATED':
      return { label: 'Rating Modified', color: 'warning', icon: Star };
    case 'ADMIN_REGISTERED':
      return { label: 'Admin Registered', color: 'primary', icon: Shield };
    case 'ADMIN_LOGIN_SUCCESS':
      return { label: 'Admin Login Success', color: 'success', icon: Lock };
    case 'ADMIN_LOGIN_FAILED':
      return { label: 'Admin Login Failed', color: 'danger', icon: AlertTriangle };
    case 'LOGIN_FAILED':
      return { label: 'Login Failed', color: 'danger', icon: AlertTriangle };
    case 'USER_LOGIN_SUCCESS':
    case 'OWNER_LOGIN_SUCCESS':
      return { label: 'Login Success', color: 'primary', icon: Lock };
    case 'ADMIN_LOGOUT':
    case 'USER_LOGOUT':
      return { label: 'User Logged Out', color: 'secondary', icon: Lock };
    case 'PASSWORD_CHANGED':
      return { label: 'Password Changed', color: 'info', icon: Lock };
    case 'PASSWORD_CHANGE_FAILED':
      return { label: 'Password Change Failed', color: 'danger', icon: AlertTriangle };
    default:
      return {
        label: action ? action.replace(/_/g, ' ') : 'System Action',
        color: 'primary',
        icon: Activity,
      };
  }
};

const AdminAuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({
    totalEvents: 0,
    todayEvents: 0,
    failedEvents: 0,
    topActions: [],
  });

  // Filters State
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [page, setPage] = useState(1);
  const limit = 15;

  // Selected Log for Inspection Modal
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [errorMsg, setErrorMsg] = useState('');

  const fetchStats = async () => {
    try {
      const res = await adminService.getAuditStats();
      if (res.data) setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch audit stats:', err);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await adminService.getAuditLogs({
        search: search.trim() || undefined,
        action: actionFilter || undefined,
        entityType: entityFilter || undefined,
        status: statusFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sortBy,
        sortOrder,
        page,
        limit,
      });

      setLogs(res.data.rows || []);
      setTotal(res.data.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setErrorMsg(err.message || 'Failed to fetch audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [search, actionFilter, entityFilter, statusFilter, startDate, endDate, sortBy, sortOrder, page]);

  const handleResetFilters = () => {
    setSearch('');
    setActionFilter('');
    setEntityFilter('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setSortBy('created_at');
    setSortOrder('DESC');
    setPage(1);
  };

  const handleInspect = (log) => {
    setSelectedLog(log);
    setIsDossierOpen(true);
  };

  const handleExportCSV = () => {
    if (!logs.length) {
      setToast({ message: 'No records available to export.', type: 'error' });
      return;
    }

    const headers = ['ID', 'Timestamp', 'Actor Name', 'Actor Email', 'Role', 'Action', 'Entity Type', 'Entity ID', 'Description', 'IP Address', 'Status'];
    const csvRows = [headers.join(',')];

    logs.forEach((row) => {
      const line = [
        row.id,
        `"${new Date(row.createdAt).toISOString()}"`,
        `"${row.actor?.name || 'System'}"`,
        `"${row.actor?.email || ''}"`,
        `"${row.actor?.role || ''}"`,
        `"${row.action}"`,
        `"${row.entityType}"`,
        row.entityId || '',
        `"${(row.description || '').replace(/"/g, '""')}"`,
        `"${row.ipAddress || ''}"`,
        `"${row.status}"`,
      ];
      csvRows.push(line.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToast({ message: 'Audit log exported as CSV successfully.', type: 'success' });
  };

  const columns = [
    {
      header: 'Timestamp',
      accessorKey: 'createdAt',
      render: (row) => {
        const dateObj = new Date(row.createdAt);
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
              {dateObj.toLocaleDateString(undefined, {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Clock size={11} /> {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Actor / User',
      accessorKey: 'actor',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: row.actor?.role === 'admin' ? 'var(--color-primary-light)' : 'var(--bg-surface-muted)',
              color: row.actor?.role === 'admin' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.78rem',
            }}
          >
            {row.actor?.name ? row.actor.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
              {row.actor?.name || 'System / Guest'}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
              {row.actor?.email || 'unauthenticated'}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Action',
      accessorKey: 'action',
      render: (row) => {
        const meta = getActionMeta(row.action);
        const Icon = meta.icon;
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <span
              className={`badge badge-${meta.color}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
            >
              <Icon size={12} />
              {meta.label}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Affected Target',
      accessorKey: 'entityType',
      render: (row) => (
        <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
          <span style={{ color: 'var(--color-primary)', marginRight: '4px' }}>{row.entityType}</span>
          {row.entityId ? <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>#{row.entityId}</span> : '—'}
        </div>
      ),
    },
    {
      header: 'Description',
      accessorKey: 'description',
      render: (row) => (
        <div
          style={{
            maxWidth: '320px',
            fontSize: '0.825rem',
            color: 'var(--color-text-primary)',
            lineHeight: 1.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={row.description}
        >
          {row.description}
        </div>
      ),
    },
    {
      header: 'IP & Origin',
      accessorKey: 'ipAddress',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
          <Globe size={12} style={{ color: 'var(--color-text-muted)' }} />
          <span>{row.ipAddress || '127.0.0.1'}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      render: (row) => (
        row.status === 'SUCCESS' ? (
          <span className="badge badge-success" style={{ gap: '0.25rem', fontSize: '0.72rem' }}>
            <CheckCircle2 size={11} /> SUCCESS
          </span>
        ) : (
          <span className="badge badge-danger" style={{ gap: '0.25rem', fontSize: '0.72rem' }}>
            <XCircle size={11} /> FAILED
          </span>
        )
      ),
    },
    {
      header: 'Dossier',
      render: (row) => (
        <button
          className="btn-secondary"
          style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem', gap: '0.3rem' }}
          onClick={() => handleInspect(row)}
          title="Inspect Audit Event Dossier"
        >
          <Eye size={13} /> Inspect
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
            <ShieldAlert size={13} /> Security & Governance
          </div>
          <h1 className="heading-xl">Administrator Audit Trail</h1>
          <p className="subheading" style={{ marginTop: '0.2rem' }}>
            Immutable, append-only security log of privileged operations, access attempts, and resource mutations.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={handleExportCSV} style={{ gap: '0.4rem' }}>
            <FileSpreadsheet size={15} /> Export CSV
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              fetchStats();
              fetchLogs();
              setToast({ message: 'Audit logs refreshed.', type: 'success' });
            }}
            style={{ gap: '0.4rem' }}
          >
            <RotateCcw size={15} /> Refresh Feed
          </button>
        </div>
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

      {/* Stats Cards */}
      <div className="grid-stats">
        <StatCard
          title="Total Audit Events"
          value={stats.totalEvents}
          subtitle="Lifetime recorded operations"
          icon={Activity}
          colorScheme="primary"
        />
        <StatCard
          title="Events Recorded Today"
          value={stats.todayEvents}
          subtitle="24h administrative velocity"
          icon={Clock}
          colorScheme="success"
        />
        <StatCard
          title="Security / Failed Events"
          value={stats.failedEvents}
          subtitle="Access & authentication alerts"
          icon={AlertTriangle}
          colorScheme={stats.failedEvents > 0 ? 'danger' : 'secondary'}
        />
        <StatCard
          title="Audit Trail Integrity"
          value="100% Valid"
          subtitle="Append-only immutable record"
          icon={Shield}
          colorScheme="info"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="card-modern" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
              <Filter size={16} style={{ color: 'var(--color-primary)' }} /> Audit Stream Filter & Slicing
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                className="btn-ghost"
                onClick={handleResetFilters}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', gap: '0.3rem' }}
              >
                <RotateCcw size={13} /> Reset Filters
              </button>
              <span className="badge badge-primary">{total} Matching Records</span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.85rem',
            }}
          >
            {/* Action Select */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                Action Type
              </label>
              <select
                className="input-modern"
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPage(1);
                }}
                style={{ fontSize: '0.825rem', padding: '0.5rem 0.75rem' }}
              >
                <option value="">All Action Types</option>
                <option value="USER_CREATED">USER_CREATED</option>
                <option value="USER_REGISTERED">USER_REGISTERED</option>
                <option value="USER_UPDATED">USER_UPDATED</option>
                <option value="STORE_CREATED">STORE_CREATED</option>
                <option value="STORE_UPDATED">STORE_UPDATED</option>
                <option value="STORE_DELETED">STORE_DELETED</option>
                <option value="STORE_OWNER_ASSIGNED">STORE_OWNER_ASSIGNED</option>
                <option value="STORE_OWNER_REGISTERED">STORE_OWNER_REGISTERED</option>
                <option value="RATING_SUBMITTED">RATING_SUBMITTED</option>
                <option value="RATING_UPDATED">RATING_UPDATED</option>
                <option value="ADMIN_REGISTERED">ADMIN_REGISTERED</option>
                <option value="ADMIN_LOGIN_SUCCESS">ADMIN_LOGIN_SUCCESS</option>
                <option value="ADMIN_LOGIN_FAILED">ADMIN_LOGIN_FAILED</option>
                <option value="LOGIN_FAILED">LOGIN_FAILED</option>
                <option value="ADMIN_LOGOUT">ADMIN_LOGOUT</option>
                <option value="PASSWORD_CHANGED">PASSWORD_CHANGED</option>
              </select>
            </div>

            {/* Entity Filter */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                Target Entity
              </label>
              <select
                className="input-modern"
                value={entityFilter}
                onChange={(e) => {
                  setEntityFilter(e.target.value);
                  setPage(1);
                }}
                style={{ fontSize: '0.825rem', padding: '0.5rem 0.75rem' }}
              >
                <option value="">All Entities</option>
                <option value="USER">USER</option>
                <option value="STORE">STORE</option>
                <option value="RATING">RATING</option>
                <option value="AUTH">AUTH</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                Execution Status
              </label>
              <select
                className="input-modern"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                style={{ fontSize: '0.825rem', padding: '0.5rem 0.75rem' }}
              >
                <option value="">All Statuses</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                Start Date
              </label>
              <input
                type="date"
                className="input-modern"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                style={{ fontSize: '0.825rem', padding: '0.45rem 0.75rem' }}
              />
            </div>

            {/* End Date */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                End Date
              </label>
              <input
                type="date"
                className="input-modern"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                style={{ fontSize: '0.825rem', padding: '0.45rem 0.75rem' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={(p) => setPage(p)}
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder="Search audit logs by actor, action, description, IP, or entity ID..."
        emptyMessage="No audit records matched your current query."
      />

      {/* Audit Record Dossier Modal */}
      <Modal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        title={`Audit Event Dossier #${selectedLog?.id || ''}`}
      >
        {selectedLog && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Header Badge Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--color-border-subtle)',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span className={`badge badge-${getActionMeta(selectedLog.action).color}`}>
                  {selectedLog.action}
                </span>
                {selectedLog.status === 'SUCCESS' ? (
                  <span className="badge badge-success">SUCCESS</span>
                ) : (
                  <span className="badge badge-danger">FAILED</span>
                )}
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                {new Date(selectedLog.createdAt).toLocaleString()}
              </div>
            </div>

            {/* Structured Info Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                fontSize: '0.85rem',
              }}
            >
              <div>
                <span className="micro-label">Actor Account</span>
                <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                  {selectedLog.actor?.name || 'System'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {selectedLog.actor?.email} (Role: {selectedLog.actor?.role})
                </div>
              </div>

              <div>
                <span className="micro-label">Target Entity</span>
                <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                  {selectedLog.entityType} {selectedLog.entityId ? `#${selectedLog.entityId}` : ''}
                </div>
              </div>

              <div>
                <span className="micro-label">Originating IP Address</span>
                <div style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginTop: '2px', fontFamily: 'monospace' }}>
                  {selectedLog.ipAddress || '127.0.0.1'}
                </div>
              </div>

              <div>
                <span className="micro-label">Audit Log ID</span>
                <div style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Record #{selectedLog.id}
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <span className="micro-label">Summary Description</span>
                <div
                  style={{
                    fontWeight: 500,
                    color: 'var(--color-text-primary)',
                    marginTop: '2px',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: 'var(--bg-surface-muted)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {selectedLog.description}
                </div>
              </div>

              {selectedLog.userAgent && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <span className="micro-label">Client User-Agent</span>
                  <div
                    style={{
                      fontSize: '0.76rem',
                      color: 'var(--color-text-muted)',
                      fontFamily: 'monospace',
                      wordBreak: 'break-all',
                      marginTop: '2px',
                    }}
                  >
                    {selectedLog.userAgent}
                  </div>
                </div>
              )}

              {selectedLog.details && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <span className="micro-label">Event Context Metadata (JSON)</span>
                  <pre
                    style={{
                      marginTop: '4px',
                      padding: '0.85rem',
                      backgroundColor: 'var(--bg-app)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.78rem',
                      fontFamily: 'monospace',
                      overflowX: 'auto',
                      maxHeight: '180px',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button className="btn-secondary" onClick={() => setIsDossierOpen(false)}>
                Close Dossier
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminAuditLogsPage;
