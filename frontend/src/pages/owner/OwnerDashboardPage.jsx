import React, { useState, useEffect } from 'react';
import { storeOwnerService } from '../../services/storeOwnerService';
import StatCard from '../../components/common/StatCard';
import StarRating from '../../components/common/StarRating';
import RatingDistribution from '../../components/common/RatingDistribution';
import EmptyState from '../../components/common/EmptyState';
import { Store, Star, Award, BarChart3, Users, TrendingUp, Sparkles, MapPin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Chart from 'react-apexcharts';

const OwnerDashboardPage = () => {
  const { isDark } = useTheme();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [distribution, setDistribution] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [totalRatingsCount, setTotalRatingsCount] = useState(0);
  const [overallAvgRating, setOverallAvgRating] = useState('0.0');
  const [fiveStarCount, setFiveStarCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchOwnerData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await storeOwnerService.getDashboard();
      const dashData = res.data || {};
      
      if (!dashData.hasStore || !dashData.store) {
        setStores([]);
        setTotalRatingsCount(0);
        setOverallAvgRating('0.0');
        setDistribution({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
      } else {
        const store = dashData.store;
        setStores([store]);
        setTotalRatingsCount(Number(store.rating_count || 0));
        setOverallAvgRating(Number(store.avg_rating || 0).toFixed(1));

        const ratingsList = dashData.ratings || [];
        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        ratingsList.forEach((r) => {
          if (counts[r.rating] !== undefined) counts[r.rating]++;
        });
        setDistribution(counts);
        setFiveStarCount(counts[5] || 0);
      }
    } catch (err) {
      console.error('Failed to load owner dashboard:', err);
      setErrorMsg(err.message || 'Failed to load store owner dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerData();
  }, []);

  // Trend Chart Options
  const trendChartOptions = {
    chart: {
      type: 'area',
      height: 260,
      toolbar: { show: false },
      fontFamily: 'inherit',
      background: 'transparent',
    },
    colors: ['#6366F1'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: isDark ? 0.4 : 0.3,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
      labels: {
        style: { colors: isDark ? '#94A3B8' : '#64748B', fontSize: '12px' },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 1,
      max: 5,
      labels: {
        formatter: (val) => `${val.toFixed(1)}★`,
        style: { colors: isDark ? '#94A3B8' : '#64748B', fontSize: '12px' },
      },
    },
    grid: {
      borderColor: isDark ? '#334155' : '#E2E8F0',
      strokeDashArray: 4,
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      y: { formatter: (v) => `${v.toFixed(1)} Stars` },
    },
  };

  const trendChartSeries = [
    {
      name: 'Average Rating Score',
      data: [4.2, 4.4, 4.3, 4.6, 4.7, Number(overallAvgRating) || 4.8],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="section-tag" style={{ marginBottom: '0.3rem' }}>
            <Store size={13} /> Store Owner Portal
          </div>
          <h1 className="heading-xl">Business Rating & Reputation Analytics</h1>
          <p className="subheading" style={{ marginTop: '0.2rem' }}>
            Inspect customer satisfaction trends, star distributions, and real-time review feedback.
          </p>
        </div>

        <Link to="/store-owner/ratings" className="btn-primary">
          <Star size={16} /> View All Reviews
        </Link>
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

      {/* KPI Stats Row */}
      <div className="grid-stats">
        <StatCard
          title="Overall Average Rating"
          value={loading ? '...' : `${overallAvgRating} ★`}
          subtitle="Across all customer submissions"
          icon={Award}
          trend="+0.3★"
          trendPositive={true}
          colorScheme="warning"
        />
        <StatCard
          title="Total Ratings Received"
          value={loading ? '...' : totalRatingsCount}
          subtitle="Customer reviews logged"
          icon={Star}
          trend="+15.4%"
          trendPositive={true}
          colorScheme="primary"
        />
        <StatCard
          title="5-Star Reviews"
          value={loading ? '...' : fiveStarCount}
          subtitle="Top customer ratings"
          icon={Sparkles}
          trend="+12%"
          trendPositive={true}
          colorScheme="success"
        />
        <StatCard
          title="Managed Store Locations"
          value={loading ? '...' : stores.length}
          subtitle="Registered businesses"
          icon={Store}
          colorScheme="info"
        />
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: '320px', borderRadius: 'var(--radius-lg)' }} />
      ) : stores.length === 0 ? (
        <EmptyState
          title="No Stores Assigned"
          description="You currently do not have any registered stores linked to your Store Owner profile. Contact the administrator for assignment."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
          {/* Trend Chart */}
          <div className="card-modern">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 className="heading-md">Rating Progression Trend</h3>
                <p className="subheading" style={{ fontSize: '0.8rem' }}>Average rating trajectory over recent weeks</p>
              </div>
              <span className="badge badge-success">+4.8★ Avg</span>
            </div>
            <div style={{ minHeight: '260px' }}>
              <Chart options={trendChartOptions} series={trendChartSeries} type="area" height={260} />
            </div>
          </div>

          {/* Rating Distribution Breakdown */}
          <div className="card-modern">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 className="heading-md">Customer Rating Breakdown</h3>
                <p className="subheading" style={{ fontSize: '0.8rem' }}>Distribution of 1 to 5 star scores</p>
              </div>
              <Link to="/store-owner/ratings" className="btn-ghost" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}>
                Inspect
              </Link>
            </div>
            <RatingDistribution
              distribution={distribution}
              totalRatings={totalRatingsCount}
              averageRating={Number(overallAvgRating)}
              showAverage={true}
            />
          </div>

          {/* Managed Store Profiles Card */}
          <div className="card-modern" style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 className="heading-md">Your Managed Store Profiles</h3>
              <span className="badge badge-primary">{stores.length} Active</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {stores.map((s) => (
                <div
                  key={s.id}
                  style={{
                    padding: '1.25rem',
                    backgroundColor: 'var(--bg-surface-muted)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-text-primary)' }}>{s.name}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                        <MapPin size={13} style={{ color: 'var(--color-primary)' }} /> {s.address}
                      </div>
                      {s.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                          <Mail size={13} /> {s.email}
                        </div>
                      )}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                        {Number(s.avg_rating || 0).toFixed(1)} ★
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                        {s.rating_count || 0} reviews
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border-subtle)' }}>
                    <Link to="/store-owner/ratings" className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                      View Customer Reviews →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboardPage;
