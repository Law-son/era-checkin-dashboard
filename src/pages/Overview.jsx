import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";
import { Users, UserCheck, Clock, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";

// Define colors for membership types
const MEMBERSHIP_COLORS = [
  "#4f46e5", // Indigo for Student
  "#10b981", // Green for Staff
  "#f59e0b", // Amber for Executive
  "#ef4444", // Red for Guest
  "#8b5cf6", // Purple for Managing Lead
];

const MEMBERSHIP_TYPES = [
  "Student",
  "Staff",
  "Executive",
  "Guest",
  "Managing Lead",
];

// Custom tooltip for Today's Traffic
const TrafficTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
        <p className="font-medium text-gray-900">{`${label}:00`}</p>
        <p className="text-gray-600">{`${payload[0].value} check-ins`}</p>
      </div>
    );
  }
  return null;
};

// Custom tooltip for Membership Types
const MembershipTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-gray-600">{`${payload[0].value} members`}</p>
        <p className="text-sm text-gray-500">{`${payload[0].payload.percentage}% of total`}</p>
      </div>
    );
  }
  return null;
};

// Components
const StatCard = ({ title, value, icon: Icon, trend }) => (
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
          <p
            className={`text-sm mt-1 ${
              trend >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend >= 0 ? "+" : ""}
            {trend.toFixed(1)}% from last week
          </p>
        )}
      </div>
      <div className="p-3 bg-indigo-50 rounded-full">
        <Icon size={24} className="text-indigo-600" />
      </div>
    </div>
  </motion.div>
);

export default function Overview() {
  // Fetch current dashboard data
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await axios.get(
        "http://localhost:5000/api/admin/dashboard"
      );
      return response.data.data;
    },
  });

  // Fetch last week's dashboard data
  const { data: lastWeekData, isLoading: isLastWeekLoading } = useQuery({
    queryKey: ["dashboard-last-week"],
    queryFn: async () => {
      const lastWeekDate = new Date();
      lastWeekDate.setDate(lastWeekDate.getDate() - 7);
      const response = await axios.get(
        `http://localhost:5000/api/admin/dashboard?date=${lastWeekDate.toISOString()}`
      );
      return response.data.data;
    },
  });

  // Fetch today's data
  const { data: todayData, isLoading: isTodayLoading } = useQuery({
    queryKey: ["dashboard-today"],
    queryFn: async () => {
      const response = await axios.get(
        "http://localhost:5000/api/admin/dashboard/today"
      );
      return response.data.data;
    },
  });

  // Calculate percentage changes
  const calculatePercentageChange = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Process membership data to include percentages and colors
  const processMembershipData = (membershipTypes) => {
    const total = membershipTypes.reduce((sum, type) => sum + type.count, 0);
    return membershipTypes.map((type, index) => ({
      ...type,
      percentage: ((type.count / total) * 100).toFixed(1),
      fill: MEMBERSHIP_COLORS[index], // Assign color directly to the data
    }));
  };

  // Process hourly data to be more readable
  const processHourlyData = (distribution) => {
    return distribution.map((item) => ({
      ...item,
      hour: `${String(item.hour).padStart(2, "0")}:00`,
      // Add a formatted tooltip label
      label: `${String(item.hour).padStart(2, "0")}:00 - ${String(
        (item.hour + 1) % 24
      ).padStart(2, "0")}:00`,
    }));
  };

  if (isDashboardLoading || isTodayLoading || isLastWeekLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const { stats } = dashboardData;
  const { stats: lastWeekStats } = lastWeekData || { stats: {} };
  const { stats: todayStats } = todayData;

  // Process the data
  const processedMembershipData = processMembershipData(
    stats.members.membershipTypes
  );
  const processedHourlyData = processHourlyData(todayStats.hourlyDistribution);

  // Calculate trends
  const membersTrend = calculatePercentageChange(
    stats.members.total,
    lastWeekStats.members?.total
  );

  const presentTrend = calculatePercentageChange(
    stats.members.present,
    lastWeekStats.members?.present
  );

  const durationTrend = calculatePercentageChange(
    todayStats.avgDuration,
    lastWeekStats.attendance?.avgDuration
  );

  const checkInsTrend = calculatePercentageChange(
    stats.attendance.month,
    lastWeekStats.attendance?.month
  );

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-600">
          Monitor your hub's performance and member activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Members"
          value={stats.members.total}
          icon={Users}
          trend={membersTrend}
        />
        <StatCard
          title="Present Today"
          value={stats.members.present}
          icon={UserCheck}
          trend={presentTrend}
        />
        <StatCard
          title="Avg. Duration"
          value={`${Math.round(todayStats.avgDuration / 60)}h`}
          icon={Clock}
          trend={durationTrend}
        />
        <StatCard
          title="Monthly Check-ins"
          value={stats.attendance.month}
          icon={TrendingUp}
          trend={checkInsTrend}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Today's Traffic
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processedHourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 12 }}
                  interval={2}
                  tickFormatter={(value) => value}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}`}
                  label={{
                    value: "Check-ins",
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: "middle" },
                  }}
                />
                <Tooltip content={<TrafficTooltip />} />
                <Bar
                  dataKey="count"
                  fill="#4f46e5"
                  name="Check-ins"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Hourly check-in distribution over the past 24 hours
          </p>
        </motion.div>

        {/* Membership Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Membership Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={processedMembershipData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="type" tick={{ fontSize: 12 }} interval={0} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}`}
                  label={{
                    value: "Members",
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: "middle" },
                  }}
                />
                <Tooltip content={<MembershipTooltip />} />
                <Bar
                  dataKey="count"
                  name="Members" // Base name for the bar
                  radius={[4, 4, 0, 0]}
                >
                  {processedMembershipData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={MEMBERSHIP_COLORS[index]}
                    />
                  ))}
                </Bar>
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  payload={processedMembershipData.map((entry, index) => ({
                    value: entry._id, // This is what will be shown next to the color box
                    type: "square",
                    color: MEMBERSHIP_COLORS[index],
                    id: entry._id, // Unique key
                  }))}
                  wrapperStyle={{
                    paddingTop: "10px",
                  }}
                  formatter={(value, entry) => (
                    <span style={{ color: "#374151" }}>{value}</span>
                  )}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Distribution of members by membership type
          </p>
        </motion.div>
      </div>
    </div>
  );
}
