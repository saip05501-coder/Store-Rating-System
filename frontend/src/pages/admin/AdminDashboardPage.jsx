import React, { useState, useEffect } from 'react';
import StatCard from '../../components/common/StatCard';
import { adminService } from '../../services/adminService';
import { demoService } from '../../services/demoService';
import { Users, Store, Star, ArrowRight, Plus, Database, Sparkles, TrendingUp, BarChart3, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import Chart from 'react-apexcharts';

const AdminDashboardPage = () => {
  const { isDark } = useTheme();
  const [userCount, setUserCount] = useState(0);
  const [storeCount, setStoreCount] = useState(0);
  const [totalRatingsCount, setTotalRatingsCount] = useState(0);
  const [avgPlatformRating, setAvgPlatformRating] = useState('4.8');
  
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentStores, setRecentStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [demoLoading, setDemoLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [dashboardRes, usersRes, storesRes] = await Promise.all([
          adminService.getDashboard(),
          adminService.getUsers({ page: 1, limit: 5 }),
          adminService.getStores({ page: 1, limit: 5, sortBy: 'created_at', sortOrder: 'DESC' }),
        ]);

        const dashStats = dashboardRes.data || {};
        const usersData = usersRes.data || {};
        const storesData = storesRes.data || {};

        setUserCount(dashStats.totalUsers || 0);
        setStoreCount(dashStats.totalStores || 0);
        setTotalRatingsCount(dashStats.totalRatings || 0);
        setRecentUsers(usersData.rows || []);
        setRecentStores((storesData.rows || []).slice(0, 5));

        // Compute average score across stores
        if (storesData.rows && storesData.rows.length > 0) {
          const totalAvg = storesData.rows.reduce((acc, s) => acc + Number(s.avg_rating || 0), 0);
          setAvgPlatformRating((totalAvg / storesData.rows.length).toFixed(1));
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
        setErrorMsg('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLoadDemoData = async () => {
    if (!window.confirm('Load demo users, stores, and ratings into MySQL?')) return;
    setDemoLoading(true);
    setErrorMsg('');
    try {
      const result = await demoService.load();
      window.alert(`${result.message}\n\nDemo account: ${result.data?.credentials?.email || 'admin@storerating.com'}`);
      window.location.reload();
    } catch (err) {
      setErrorMsg(err.message || 'Unable to load demo data.');
    } finally {
      setDemoLoading(false);
    }
  };

  // ApexCharts Chart Configurations for Growth Analytics
  const growthChartOptions = {
    chart: {
      type: 'area',
      height: 280,
      toolbar: { show: false },
      fontFamily: 'inherit',
      background: 'transparent',
    },
    colors: ['#6366F1', '#22C55E'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2.5 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: isDark ? 0.35 : 0.25,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
      labels: {
        style: { colors: isDark ? '#94A3B8' : '#64748B', fontSize: '12px' },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: isDark ? '#94A3B8' : '#64748B', fontSize: '12px' },
      },
    },
    grid: {
      borderColor: isDark ? '#334155' : '#E2E8F0',
      strokeDashArray: 4,
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: { colors: isDark ? '#F8FAFC' : '#1E293B' },
    },
  };

  const growthChartSeries = [
    {
      name: 'Registered Users',
      data: [12, 18, 25, 32, 45, 60, 85, userCount || 110],
    },
    {
      name: 'Active Stores',
      data: [4, 8, 12, 16, 22, 28, 36, storeCount || 45],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div>
          <div className="section-tag" style={{ marginBottom: '0.4rem' }}>
            <Activity size={13} /> Administration Overview
          </div>
          <h1 className="heading-xl">Platform Intelligence Dashboard</h1>
          <p className="subheading" style={{ marginTop: '0.2rem' }}>
            Real-time analytics for registered stores, platform users, and review activity.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            className="btn-secondary"
            onClick={handleLoadDemoData}
            disabled={demoLoading}
            style={{ gap: '0.4rem' }}
          >
            <Database size={16} /> {demoLoading ? 'Seeding Demo Data...' : 'Seed Demo Data'}
          </button>

          <Link to="/admin/stores" className="btn-primary" style={{ gap: '0.4rem' }}>
            <Plus size={16} /> Manage Stores
          </Link>
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

      {/* KPI Stats Grid */}
      <div className="grid-stats">
        <StatCard
          title="Total Platform Users"
          value={loading ? '...' : userCount}
          subtitle="Registered accounts"
          icon={Users}
          trend="+18.2%"
          trendPositive={true}
          colorScheme="primary"
        />
        <StatCard
          title="Total Active Stores"
          value={loading ? '...' : storeCount}
          subtitle="Verified business locations"
          icon={Store}
          trend="+12.4%"
          trendPositive={true}
          colorScheme="success"
        />
        <StatCard
          title="Total Ratings Submitted"
          value={loading ? '...' : totalRatingsCount}
          subtitle="Authentic user reviews"
          icon={Star}
          trend="+24.8%"
          trendPositive={true}
          colorScheme="warning"
        />
        <StatCard
          title="Platform Average Score"
          value={loading ? '...' : `${avgPlatformRating} ★`}
          subtitle="Overall satisfaction rating"
          icon={Sparkles}
          trend="+4.2%"
          trendPositive={true}
          colorScheme="info"
        />
      </div>

      {/* Analytics Chart Row */}
      <div className="card-modern">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 className="heading-md">Platform Growth & Expansion Trend</h3>
            <p className="subheading" style={{ fontSize: '0.825rem' }}>
              Monthly progression of registered users versus newly added business stores.
            </p>
          </div>
          <span className="badge badge-primary">Live Trend</span>
        </div>

        <div style={{ minHeight: '280px' }}>
          <Chart options={growthChartOptions} series={growthChartSeries} type="area" height={280} />
        </div>
      </div>

      {/* Recent Records Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Stores */}
        <div className="card-modern">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 className="heading-md">Recently Registered Stores</h3>
            <Link to="/admin/stores" className="btn-ghost" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="skeleton" style={{ height: '180px' }} />
          ) : recentStores.length === 0 ? (
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>No stores registered yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentStores.map((store) => (
                <div
                  key={store.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--bg-surface-muted)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>{store.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{store.address}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                      {Number(store.avg_rating || 0).toFixed(1)} ★
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                      {store.rating_count || 0} reviews
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="card-modern">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 className="heading-md">Recently Registered Users</h3>
            <Link to="/admin/users" className="btn-ghost" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="skeleton" style={{ height: '180px' }} />
          ) : recentUsers.length === 0 ? (
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>No users registered yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentUsers.map((u) => (
                <div
                  key={u.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--bg-surface-muted)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primary-light)',
                        color: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                      }}
                    >
                      {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>{u.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{u.email}</div>
                    </div>
                  </div>
                  <span className={`badge badge-${u.role}`}>{u.role}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
