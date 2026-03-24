import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Calendar,
  ArrowUpRight,
  Filter,
  Download,
  Activity,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/Dashboard.scss';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnimatedCounter = ({ value, prefix = '', suffix = '', duration = 1000 }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime = null;
    const startValue = 0;
    const endValue = value;
    
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(startValue + (endValue - startValue) * easeOutQuart));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, duration]);
  
  return (
    <span className="animated-counter">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

const ModernStatCard = ({ title, value, change, icon: Icon, color, subtitle, loading }) => {
  const isPositive = change >= 0;
  
  return (
    <div className={`modern-stat-card ${color} ${loading ? 'loading' : ''}`}>
      <div className="stat-card-glow"></div>
      <div className="stat-card-content">
        <div className="stat-header">
          <div className={`stat-icon-wrapper ${color}`}>
            <Icon size={22} />
          </div>
          <div className={`stat-trend ${isPositive ? 'up' : 'down'}`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{Math.abs(change).toFixed(1)}%</span>
          </div>
        </div>
        
        <div className="stat-body">
          <h3 className="stat-value">
            {loading ? (
              <span className="skeleton-text">----</span>
            ) : (
              value
            )}
          </h3>
          <p className="stat-title">{title}</p>
          {subtitle && <p className="stat-subtitle">{subtitle}</p>}
        </div>
        
        <div className="stat-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${Math.min(Math.abs(change) * 2, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityItem = ({ type, title, time, status, amount }) => {
  const icons = {
    order: ShoppingBag,
    payment: CreditCard,
    shipping: Truck,
    completed: CheckCircle2,
    pending: Clock,
    cancelled: XCircle
  };
  
  const Icon = icons[type] || Activity;
  
  return (
    <div className="activity-item">
      <div className={`activity-icon ${type} ${status}`}>
        <Icon size={16} />
      </div>
      <div className="activity-content">
        <div className="activity-header">
          <span className="activity-title">{title}</span>
          {amount && <span className="activity-amount">{amount}</span>}
        </div>
        <div className="activity-meta">
          <span className="activity-time">{time}</span>
          <span className={`activity-status ${status}`}>{status}</span>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    salesChange: 12.5,
    ordersChange: -2.3,
    productsChange: 8.1,
    usersChange: 15.4
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [activities, setActivities] = useState([]);
  const [salesData, setSalesData] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const chartRef = useRef(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  const fetchDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const [statsRes, ordersRes] = await Promise.all([
        axios.get(`${backendUrl}/api/user/admin/stats`, { headers: { token } }),
        axios.get(`${backendUrl}/api/order/admin/all?page=1&limit=10`, { headers: { token } })
      ]);

      if (statsRes.data.success) {
        const backendStats = statsRes.data.stats || {};
        
        setStats({
          totalSales: backendStats.totalRevenue || 0,
          totalOrders: backendStats.totalOrders || 0,
          totalProducts: backendStats.totalProducts || 0,
          totalUsers: backendStats.totalUsers || 0,
          salesChange: 12.5,
          ordersChange: -2.3,
          productsChange: 8.1,
          usersChange: 15.4
        });
      }

      if (ordersRes.data.success) {
        const orders = ordersRes.data.orders || [];
        
        const formattedOrders = orders.slice(0, 10).map(order => ({
          id: order._id?.toString().slice(-6).toUpperCase() || 'UNKNOWN',
          customer: order.userId?.name || order.address?.fullName || 'Guest',
          email: order.userId?.email || order.address?.email || '',
          amount: order.amount || 0,
          status: order.status || 'pending',
          date: order.date || order.createdAt,
          items: order.items?.length || 0,
          payment: order.payment || false
        }));
        
        setRecentOrders(formattedOrders);

        const recentActivities = formattedOrders.slice(0, 8).map(order => ({
          type: order.status === 'delivered' ? 'completed' : 
                order.status === 'shipped' ? 'shipping' : 
                order.status === 'pending' ? 'pending' : 'order',
          title: `Order #${order.id} - ${order.customer}`,
          time: formatTimeAgo(order.date),
          status: order.status,
          amount: formatCurrency(order.amount)
        }));
        setActivities(recentActivities);

        const salesByDate = {};
        orders.forEach(order => {
          if (order.payment && order.date) {
            const date = new Date(order.date);
            const dateKey = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            salesByDate[dateKey] = (salesByDate[dateKey] || 0) + (order.amount || 0);
          }
        });

        const labels = Object.keys(salesByDate).slice(-7);
        const data = labels.map(label => salesByDate[label]);
        const finalLabels = labels.length > 0 ? labels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const finalData = data.length > 0 ? data : orders.slice(0, 7).map((o) => o.amount || 0);

        setSalesData({
          labels: finalLabels,
          datasets: [{
            label: 'Revenue',
            data: finalData,
            borderColor: '#D4AF37',
            backgroundColor: (context) => {
              const chart = context.chart;
              const {ctx, chartArea} = chart;
              if (!chartArea) return null;
              const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
              gradient.addColorStop(0, 'rgba(212, 175, 55, 0)');
              gradient.addColorStop(1, 'rgba(212, 175, 55, 0.3)');
              return gradient;
            },
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 8,
            pointBackgroundColor: '#D4AF37',
            pointBorderColor: '#0a0a0a',
            pointBorderWidth: 2
          }]
        });
      }

    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('API endpoint not found');
      } else if (error.response?.status === 401) {
        toast.error('Unauthorized');
      } else {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [backendUrl, timeRange]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(value || 0);
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const orderStatusData = useMemo(() => ({
    labels: ['Delivered', 'Processing', 'Pending', 'Cancelled'],
    datasets: [{
      data: [
        recentOrders.filter(o => o.status === 'delivered').length,
        recentOrders.filter(o => o.status === 'processing' || o.status === 'shipped').length,
        recentOrders.filter(o => o.status === 'pending').length,
        recentOrders.filter(o => o.status === 'cancelled').length
      ],
      backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'],
      borderWidth: 0,
      hoverOffset: 8
    }]
  }), [recentOrders]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(10, 10, 10, 0.9)',
        titleColor: '#D4AF37',
        bodyColor: '#fff',
        borderColor: 'rgba(212, 175, 55, 0.3)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => `Revenue: ${formatCurrency(context.raw)}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { 
          color: '#6B7280',
          font: { size: 11 }
        }
      },
      y: {
        grid: { 
          color: 'rgba(75, 85, 99, 0.1)',
          drawBorder: false
        },
        ticks: { 
          color: '#6B7280',
          font: { size: 11 },
          callback: (value) => `£${(value / 1000).toFixed(0)}k`
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#9CA3AF',
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 12 }
        }
      }
    }
  };

  return (
    <div className="dashboard-v2">
      <main className="dashboard-main">
        <section className="welcome-section">
          <div className="welcome-text">
            <h2>Dashboard Overview</h2>
            <p>Welcome back! Here's what's happening with your store.</p>
          </div>
          <div className="date-picker">
            <Calendar size={16} />
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
              <option value="1y">Last year</option>
            </select>
            <button 
              className={`refresh-btn ${refreshing ? 'spinning' : ''}`}
              onClick={fetchDashboardData}
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </section>

        <section className="stats-section">
          <ModernStatCard
            title="Total Revenue"
            value={loading ? null : formatCurrency(stats.totalSales)}
            change={stats.salesChange}
            icon={DollarSign}
            color="gold"
            subtitle="vs last month"
            loading={loading}
          />
          <ModernStatCard
            title="Total Orders"
            value={loading ? null : stats.totalOrders.toLocaleString()}
            change={stats.ordersChange}
            icon={ShoppingBag}
            color="blue"
            subtitle="vs last month"
            loading={loading}
          />
          <ModernStatCard
            title="Active Products"
            value={loading ? null : stats.totalProducts}
            change={stats.productsChange}
            icon={Package}
            color="green"
            subtitle="in stock"
            loading={loading}
          />
          <ModernStatCard
            title="Total Customers"
            value={loading ? null : stats.totalUsers.toLocaleString()}
            change={stats.usersChange}
            icon={Users}
            color="purple"
            subtitle="registered"
            loading={loading}
          />
        </section>

        <section className="charts-section">
          <div className="chart-card main-chart">
            <div className="chart-header">
              <div>
                <h3>Revenue Overview</h3>
                <p className="chart-subtitle">Sales performance over time</p>
              </div>
              <div className="chart-actions">
                <button className="btn-icon">
                  <Filter size={16} />
                </button>
                <button className="btn-icon">
                  <Download size={16} />
                </button>
              </div>
            </div>
            <div className="chart-body">
              {salesData ? (
                <Line ref={chartRef} data={salesData} options={chartOptions} />
              ) : (
                <div className="chart-skeleton">
                  <div className="skeleton-line"></div>
                  <div className="skeleton-bars"></div>
                </div>
              )}
            </div>
          </div>

          <div className="chart-card side-chart">
            <div className="chart-header">
              <h3>Order Status</h3>
            </div>
            <div className="chart-body doughnut">
              {recentOrders.length > 0 ? (
                <Doughnut data={orderStatusData} options={doughnutOptions} />
              ) : (
                <div className="chart-skeleton circle"></div>
              )}
            </div>
            <div className="chart-legend-custom">
              <div className="legend-item">
                <span className="dot delivered"></span>
                <span>Delivered</span>
                <strong>{recentOrders.filter(o => o.status === 'delivered').length}</strong>
              </div>
              <div className="legend-item">
                <span className="dot processing"></span>
                <span>Processing</span>
                <strong>{recentOrders.filter(o => o.status === 'processing' || o.status === 'shipped').length}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="bottom-section">
          <div className="panel orders-panel">
            <div className="panel-header">
              <div>
                <h3>Recent Orders</h3>
                <p className="panel-subtitle">Latest customer orders</p>
              </div>
              <button className="btn-view-all">
                View All
                <ArrowUpRight size={16} />
              </button>
            </div>
            
            <div className="orders-table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i} className="skeleton-row">
                        <td><div className="skeleton-text short"></div></td>
                        <td><div className="skeleton-text medium"></div></td>
                        <td><div className="skeleton-text short"></div></td>
                        <td><div className="skeleton-text short"></div></td>
                        <td><div className="skeleton-badge"></div></td>
                      </tr>
                    ))
                  ) : recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <tr key={order.id} className="order-row">
                        <td className="order-id">#{order.id}</td>
                        <td>
                          <div className="customer-cell">
                            <div className="customer-avatar">
                              {order.customer.charAt(0).toUpperCase()}
                            </div>
                            <div className="customer-info">
                              <span className="customer-name">{order.customer}</span>
                              <span className="customer-email">{order.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="order-date">{formatTimeAgo(order.date)}</td>
                        <td className="order-amount">{formatCurrency(order.amount)}</td>
                        <td>
                          <span className={`status-pill ${order.status}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="empty-state">
                        <Package size={48} />
                        <p>No orders yet</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel activity-panel">
            <div className="panel-header">
              <div>
                <h3>Recent Activity</h3>
                <p className="panel-subtitle">Live updates from your store</p>
              </div>
            </div>
            
            <div className="activity-list">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="activity-item skeleton">
                    <div className="skeleton-icon"></div>
                    <div className="skeleton-content">
                      <div className="skeleton-text medium"></div>
                      <div className="skeleton-text short"></div>
                    </div>
                  </div>
                ))
              ) : activities.length > 0 ? (
                activities.map((activity, index) => (
                  <ActivityItem key={index} {...activity} />
                ))
              ) : (
                <div className="empty-state">
                  <Activity size={48} />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;