import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Clock, 
  Users, 
  TrendingUp, 
  Calendar,
  AlertTriangle,
  Trophy,
  UserX,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const DEPARTMENT_COLORS = {
  'ERA OPENLABS': '#4338ca',    // Deep indigo
  'ERA Softwares': '#059669',   // Deep emerald
  'ERA Manufacturing': '#b45309', // Deep amber
  'ERA Education': '#dc2626',   // Deep red
  'None': '#6b7280'            // Gray for any undefined departments
};

const DEPARTMENTS = [
  'ERA OPENLABS',
  'ERA Softwares',
  'ERA Manufacturing',
  'ERA Education',
  'None'
];

const StatCard = ({ title, value, icon: Icon, trend, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        {trend !== undefined && (
          <p className={`text-sm mt-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? '+' : ''}{trend.toFixed(1)}% {description}
          </p>
        )}
      </div>
      <div className="p-3 bg-indigo-50 rounded-full">
        <Icon size={24} className="text-indigo-600" />
      </div>
    </div>
  </motion.div>
);

// Custom tooltip for the daily trends chart
const DailyTrendTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
        <p className="font-medium text-gray-900">{data.date}</p>
        <div className="mt-1">
          <p className="text-gray-600">{data.total} check-ins</p>
          {data.previousTotal && (
            <p className="text-sm mt-1">
              <span className={data.total > data.previousTotal ? 'text-green-600' : 'text-red-600'}>
                {data.total > data.previousTotal ? '↑' : '↓'} 
                {Math.abs(((data.total - data.previousTotal) / data.previousTotal) * 100).toFixed(1)}% vs previous {period}
              </span>
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

// Enhanced tooltip for the pie chart
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-lg min-w-[200px]">
        <div className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: data.color }}
          />
          <p className="font-medium text-gray-900">{data.name}</p>
        </div>
        <div className="mt-2 space-y-1">
          <p className="text-gray-600">
            <span className="font-medium">{data.value}</span> active members
          </p>
          <p className="text-sm text-gray-500">
            {data.percentage}% of total workforce
          </p>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div
              className="h-1.5 rounded-full"
              style={{
                width: `${data.percentage}%`,
                backgroundColor: data.color
              }}
            />
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Member activity card component
const MemberListCard = ({ title, description, icon: Icon, members, loading, error, emptyMessage, renderMemberInfo }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const totalPages = members ? Math.ceil(members.length / itemsPerPage) : 0;
  const paginatedMembers = members?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
    >
      <div className="flex flex-col space-y-1">
        <div className="flex items-center space-x-2">
          <Icon className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-48 text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>Failed to load data</span>
          </div>
        ) : members?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-500">
            <Icon className="h-8 w-8 mb-2" />
            <span>{emptyMessage}</span>
          </div>
        ) : (
          <>
            <div className="space-y-3 mt-4">
              {paginatedMembers.map((member, index) => (
                <div 
                  key={member.memberId} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-100 rounded-full text-indigo-600 font-medium">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{member.fullName}</h4>
                      <p className="text-sm text-gray-500">{member.department}</p>
                    </div>
                  </div>
                  {renderMemberInfo(member)}
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, members.length)}
                    </span> of{' '}
                    <span className="font-medium">{members.length}</span> results
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-md hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-md hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default function Analytics() {
  const [period, setPeriod] = useState('week');

  // Helper function to get date range for queries
  const getDateRange = (period) => {
    const end = new Date();
    const start = new Date();
    
    switch(period) {
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setMonth(end.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(end.getFullYear() - 1);
        break;
      default:
        start.setDate(end.getDate() - 7);
    }
    
    // Format dates as YYYY-MM-DD
    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };
    
    return { 
      start: formatDate(start), 
      end: formatDate(end)
    };
  };

  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics', period],
    queryFn: async () => {
      const { start, end } = getDateRange(period);
      console.log('Fetching analytics with params:', { period, start, end });
      
      const response = await axios.get(
        `http://localhost:5000/api/admin/reports/analytics?period=${period}&startDate=${start}&endDate=${end}`
      );
      
      console.log('Raw API Response:', response.data);
      console.log('Analytics Data Structure:', {
        dailyTrends: response.data.data.analytics.dailyTrends,
        departmentDistribution: response.data.data.analytics.departmentDistribution
      });
      
      return response.data.data.analytics;
    }
  });

  // Process daily trends data with previous period comparison
  const processedDailyTrends = analyticsData?.dailyTrends?.map(day => {
    console.log('Processing day data:', day);
    
    try {
      const dateObj = new Date(day.date);
      console.log('Parsed date object:', dateObj);
      
      if (isNaN(dateObj.getTime())) {
        console.error('Invalid date encountered:', day.date);
        return null;
      }
      
      return {
        date: dateObj.toLocaleDateString('en-US', { 
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        }),
        total: day.total,
        previousTotal: day.previousTotal
      };
    } catch (error) {
      console.error('Error processing date:', error);
      return null;
    }
  }).filter(Boolean) || [];

  console.log('Processed daily trends:', processedDailyTrends);

  // Process department distribution data with enhanced color mapping
  const departmentData = useMemo(() => {
    console.log('Processing department data:', analyticsData?.departmentDistribution);
    
    if (!analyticsData?.departmentDistribution?.length) {
      console.log('No department distribution data available');
      return [];
    }

    const total = analyticsData.departmentDistribution.reduce((sum, d) => sum + d.count, 0);
    console.log('Total members across departments:', total);

    const processed = analyticsData.departmentDistribution.map(dept => {
      const data = {
        name: dept.department,
        value: dept.count,
        percentage: ((dept.count / total) * 100).toFixed(1),
        color: DEPARTMENT_COLORS[dept.department] || DEPARTMENT_COLORS.None
      };
      console.log('Processed department:', data);
      return data;
    }).sort((a, b) => b.value - a.value);

    console.log('Final processed department data:', processed);
    return processed;
  }, [analyticsData?.departmentDistribution]);

  // Calculate total members
  const totalMembers = departmentData.reduce((sum, dept) => sum + dept.value, 0);

  // Calculate percentage change
  const calculatePercentageChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Calculate trends
  const calculateTrends = () => {
    if (!analyticsData) return {};

    const currentTotal = analyticsData.dailyTrends?.[analyticsData.dailyTrends.length - 1]?.total || 0;
    const previousTotal = analyticsData.dailyTrends?.[analyticsData.dailyTrends.length - 2]?.total || 0;

    const checkInsTrend = calculatePercentageChange(currentTotal, previousTotal);
    const activeMembersTrend = calculatePercentageChange(
      departmentData.reduce((sum, dept) => sum + dept.value, 0),
      0 // You might want to get this from your API
    );

    const avgDurationTrend = calculatePercentageChange(
      analyticsData.averageDuration || 0,
      0 // You might want to get this from your API
    );

    return {
      checkInsTrend,
      activeMembersTrend,
      avgDurationTrend
    };
  };

  // Format duration in hours and minutes
  const formatDuration = (minutes) => {
    if (!minutes) return '0m';
    
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${String(hours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}`;
  };

  // Format hour to 12-hour format with AM/PM
  const formatHour = (hour) => {
    if (!hour && hour !== 0) return 'N/A';
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}${ampm}`;
  };

  // Get peak hour with check-in count
  const getPeakHourInfo = () => {
    if (!analyticsData?.peakHours || analyticsData.peakHours.length === 0) {
      return { hour: null, count: 0 };
    }
    return analyticsData.peakHours.reduce((max, current) => 
      current.count > max.count ? current : max
    , { hour: null, count: 0 });
  };

  const trends = calculateTrends();
  const peakHourInfo = getPeakHourInfo();

  // Fetch top active members
  const { 
    data: topActiveData,
    isLoading: isLoadingTopActive,
    error: topActiveError
  } = useQuery({
    queryKey: ['top-active-members', period],
    queryFn: async () => {
      const response = await axios.get(
        `http://localhost:5000/api/admin/reports/analytics/top-active?period=${period}&limit=10`
      );
      return response.data.data.members;
    }
  });

  // Fetch inactive members
  const {
    data: inactiveData,
    isLoading: isLoadingInactive,
    error: inactiveError
  } = useQuery({
    queryKey: ['inactive-members'],
    queryFn: async () => {
      const response = await axios.get(
        'http://localhost:5000/api/admin/reports/analytics/inactive?days=21'
      );
      console.log('Inactive members raw data:', response.data.data.members);
      return response.data.data.members;
    }
  });

  // Format date to relative time
  const formatRelativeTime = (date) => {
    if (!date) return 'Never';
    
    try {
      const now = new Date();
      const then = new Date(date);
      
      // Check if the date is valid
      if (isNaN(then.getTime())) {
        console.error('Invalid date received:', date);
        return 'Invalid date';
      }
      
      const diffInDays = Math.floor((now - then) / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) return 'Today';
      if (diffInDays === 1) return 'Yesterday';
      if (diffInDays < 7) return `${diffInDays} days ago`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
      if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
      if (diffInDays > 1000) return 'Never'; // Safeguard against extremely old dates
      return `${Math.floor(diffInDays / 365)} years ago`;
    } catch (error) {
      console.error('Error formatting date:', error, 'Date value:', date);
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-600">
          Monitor check-in trends and department distribution
        </p>
      </div>

      {/* Period Selector */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-gray-700">Select Time Range</label>
        <div className="flex space-x-2">
          {['week', 'month', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                period === p
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Check-ins"
          value={analyticsData?.dailyTrends?.[analyticsData.dailyTrends?.length - 1]?.total || 0}
          icon={Calendar}
          trend={trends.checkInsTrend}
          description="vs last period"
        />
        <StatCard
          title="Active Members"
          value={departmentData.reduce((sum, dept) => sum + dept.value, 0)}
          icon={Users}
          trend={trends.activeMembersTrend}
          description="vs last period"
        />
        <StatCard
          title="Peak Hour"
          value={formatHour(peakHourInfo.hour)}
          icon={Clock}
          description={peakHourInfo.count ? `${peakHourInfo.count} check-ins` : "No data available"}
        />
        <StatCard
          title="Avg. Duration"
          value={formatDuration(analyticsData?.averageDuration || 0)}
          icon={TrendingUp}
          trend={trends.avgDurationTrend}
          description="vs last period"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex flex-col space-y-1">
            <h3 className="text-lg font-medium text-gray-900">Daily Check-in Trends</h3>
            <p className="text-sm text-gray-500">Track daily attendance patterns</p>
          </div>
          <div className="h-80 mt-4">
            {processedDailyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedDailyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value}`}
                    label={{
                      value: "Check-ins",
                      angle: -90,
                      position: "insideLeft",
                      style: { textAnchor: "middle" }
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                    }}
                    labelStyle={{ color: "#374151" }}
                  >
                    {({ active, payload, label }) => (
                      <DailyTrendTooltip
                        active={active}
                        payload={payload}
                        label={label}
                      />
                    )}
                  </Tooltip>
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    dot={{ fill: "#4f46e5", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">No check-in data available for this period</p>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Number of check-ins per day over the selected period
          </p>
        </motion.div>

        {/* Department Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex flex-col space-y-1">
            <h3 className="text-lg font-medium text-gray-900">Department Distribution</h3>
            <p className="text-sm text-gray-500">Active members by department</p>
          </div>
          
          {departmentData.length > 0 ? (
            <>
              <div className="h-80 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percentage }) => `${name} (${percentage}%)`}
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Workforce Distribution</h4>
                  <div className="space-y-3">
                    {departmentData.map((dept, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: dept.color }}
                            />
                            <span className="text-sm font-medium text-gray-700">
                              {dept.name}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600">
                            {dept.value} members
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full transition-all duration-500"
                            style={{
                              width: `${dept.percentage}%`,
                              backgroundColor: dept.color
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total Workforce</span>
                    <span className="text-sm font-medium text-gray-900">{totalMembers} members</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    * Percentages represent each department's share of total active members
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <p className="text-gray-500">No department data available</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Member Activity Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Active Members */}
        <MemberListCard
          title="Most Active Members"
          description="Top 10 members with highest attendance frequency"
          icon={Trophy}
          members={topActiveData}
          loading={isLoadingTopActive}
          error={topActiveError}
          emptyMessage="No active members data available"
          renderMemberInfo={(member) => (
            <div className="text-right">
              <div className="text-sm font-medium text-indigo-600">
                {member.checkInCount} check-ins
              </div>
              <div className="text-xs text-gray-500">
                Last seen: {formatRelativeTime(member.lastCheckIn)}
              </div>
            </div>
          )}
        />

        {/* Inactive Members */}
        <MemberListCard
          title="Inactive Members"
          description="Members who haven't checked in for 21+ days"
          icon={UserX}
          members={inactiveData}
          loading={isLoadingInactive}
          error={inactiveError}
          emptyMessage="No inactive members"
          renderMemberInfo={(member) => (
            <div className="text-right">
              <div className="text-sm font-medium text-red-600">
                {member.inactiveDays} days inactive
              </div>
              <div className="text-xs text-gray-500">
                Last seen: {member.inactiveDays} days ago
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
} 