import { useState, useEffect } from "react";
import { 
  Users, 
  Shield, 
  Vote, 
  MessageSquare,
  TrendingUp,
  MapPin,
  CheckCircle,
  Activity,
  Target,
  Award,
  Sparkles,
  Globe,
  BarChart4,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/services/Api";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";

export default function Overview() {
  const { access_token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [overviewStats, setOverviewStats] = useState(null);
  const [detailedStats, setDetailedStats] = useState(null);
  const [growthStats, setGrowthStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [overviewResponse, detailedResponse, growthResponse] = await Promise.all([
        authApi.getOverviewStats(access_token),
        authApi.getDetailedStats(access_token),
        authApi.getGrowthStats(access_token)
      ]);

      console.log("Growth Response:", growthResponse);

      if (overviewResponse.success) {
        setOverviewStats(overviewResponse.data);
      }

      if (detailedResponse.success) {
        setDetailedStats(detailedResponse.data);
      }

      if (growthResponse && growthResponse.success) {
        if (growthResponse.data && Array.isArray(growthResponse.data)) {
          setGrowthStats(growthResponse.data);
        } else if (Array.isArray(growthResponse)) {
          setGrowthStats(growthResponse);
        } else if (growthResponse.data && growthResponse.data.data) {
          setGrowthStats(growthResponse.data.data);
        }
      }
    } catch (err) {
      setError(err.message || "Failed to fetch statistics");
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate total
  const calculateTotal = (obj) => {
    if (!obj) return 0;
    return Object.values(obj).reduce((a, b) => a + b, 0);
  };

  const totalCitizens = calculateTotal(detailedStats?.citizensByGender);
  const totalAdmins = calculateTotal(detailedStats?.adminsByBureau);
  const totalPolls = calculateTotal(detailedStats?.pollsByStatus);
  const totalForums = calculateTotal(detailedStats?.forumsByCategory);

  // Prepare data for simple charts
  const activityData = detailedStats?.citizensByActivityLevel || {};
  const pollsData = detailedStats?.pollsByStatus || {};

  // Calculate percentages for simple charts
  const getPercentage = (value, total) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
  };

  const totalActivity = calculateTotal(activityData);
  const totalPollsStatus = calculateTotal(pollsData);

  // Prepare growth trend data from API
  const prepareGrowthData = () => {
    if (!growthStats) return [];

    if (Array.isArray(growthStats)) {
      return growthStats.map(item => ({
        month: item.label || item.month || item.period,
        citizens: parseInt(item.citizens) || 0,
        interactions: parseInt(item.interactions) || 0,
      }));
    }

    if (growthStats.data && Array.isArray(growthStats.data)) {
      return growthStats.data.map(item => ({
        month: item.label || item.month || item.period,
        citizens: parseInt(item.citizens) || 0,
        interactions: parseInt(item.interactions) || 0,
      }));
    }

    return [];
  };

  const trendData = prepareGrowthData();
  const hasGrowthData = trendData.length > 0;

  const getSummaryStats = () => {
    if (!hasGrowthData) return null;
    
    const citizens = trendData.map(d => d.citizens);
    const interactions = trendData.map(d => d.interactions);
    
    return {
      peakCitizens: Math.max(...citizens),
      peakInteractions: Math.max(...interactions),
      totalCitizens: citizens.reduce((a, b) => a + b, 0),
      totalInteractions: interactions.reduce((a, b) => a + b, 0),
      monthsWithData: citizens.filter(c => c > 0).length,
    };
  };

  const summaryStats = getSummaryStats();

  const MetricCard = ({ title, value, icon: Icon, color }) => (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
          </div>
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${color} shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Loading dashboard data...</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Please wait while we fetch the latest statistics</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-10 w-10 text-red-500 dark:text-red-400" />
          </div>
          <p className="text-red-600 dark:text-red-400 font-medium mb-2">Failed to load dashboard data</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{error}</p>
          <button 
            onClick={fetchStats}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Welcome back, Admin!</h2>
            <p className="text-blue-100">Here's what's happening with your platform today.</p>
          </div>
          <Sparkles className="h-8 w-8 text-yellow-300 animate-pulse" />
        </div>
      </div>

      {/* Key Metrics Cards - No trends or subtitles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Citizens"
          value={totalCitizens}
          icon={Users}
          color="from-blue-500 to-blue-600"
        />
        <MetricCard
          title="Total Admins"
          value={totalAdmins}
          icon={Shield}
          color="from-purple-500 to-purple-600"
        />
        <MetricCard
          title="Total Polls"
          value={totalPolls}
          icon={Vote}
          color="from-green-500 to-green-600"
        />
        <MetricCard
          title="Forum Categories"
          value={totalForums}
          icon={MessageSquare}
          color="from-orange-500 to-orange-600"
        />
      </div>

      {/* Growth Trend Chart */}
      <Card className="overflow-hidden dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Platform Growth Trends
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Monthly growth of citizens and interactions
              </CardDescription>
            </div>
            {summaryStats && (
              <div className="text-right text-sm">
                <p className="text-gray-600 dark:text-gray-400">Peak Citizens: <span className="font-semibold text-green-600 dark:text-green-400">{summaryStats.peakCitizens}</span></p>
                <p className="text-gray-500 dark:text-gray-500 text-xs">Peak Interactions: {summaryStats.peakInteractions}</p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {hasGrowthData ? (
            <>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorCitizens" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorInteractions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                    <YAxis yAxisId="left" stroke="#3B82F6" tick={{ fill: '#9CA3AF' }} label={{ value: 'Citizens', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#10B981" tick={{ fill: '#9CA3AF' }} label={{ value: 'Interactions', angle: 90, position: 'insideRight', fill: '#9CA3AF' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F9FAFB' }}
                      formatter={(value, name) => {
                        if (name === 'citizens') return [`${value} citizens`, 'Total Citizens'];
                        if (name === 'interactions') return [`${value} interactions`, 'Interactions'];
                        return [value, name];
                      }}
                    />
                    <Area yAxisId="left" type="monotone" dataKey="citizens" stroke="#3B82F6" fill="url(#colorCitizens)" name="citizens" strokeWidth={2} />
                    <Area yAxisId="right" type="monotone" dataKey="interactions" stroke="#10B981" fill="url(#colorInteractions)" name="interactions" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              {summaryStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Peak Citizens</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{summaryStats.peakCitizens}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Peak Interactions</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{summaryStats.peakInteractions}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Citizens</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{summaryStats.totalCitizens}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Interactions</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{summaryStats.totalInteractions}</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">No growth data available</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Growth statistics will appear here as data accumulates</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Two Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Citizens by Region */}
        {detailedStats?.citizensByRegion && Object.keys(detailedStats.citizensByRegion).length > 0 && (
          <Card className="overflow-hidden dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <MapPin className="h-5 w-5 text-blue-500" />
                Citizens by Region
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Distribution of citizens across regions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Object.entries(detailedStats.citizensByRegion).map(([region, count]) => ({
                      name: region,
                      citizens: count
                    }))}
                    margin={{ top: 20, right: 30, left: 40, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={80}
                      interval={0}
                      tick={{ fontSize: 12, fill: "#9CA3AF" }}
                    />
                    <YAxis tick={{ fill: '#9CA3AF' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F9FAFB' }}
                      formatter={(value) => [`${value} citizens`, 'Citizens']}
                    />
                    <Bar dataKey="citizens" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chart 2: Citizens by Gender - Donut Chart with Empty Center */}
        {detailedStats?.citizensByGender && Object.keys(detailedStats.citizensByGender).length > 0 && (
          <Card className="overflow-hidden dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <Users className="h-5 w-5 text-pink-500" />
                Citizens by Gender
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Gender distribution of citizens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={Object.entries(detailedStats.citizensByGender).map(([gender, count]) => ({
                        name: gender === 'male' ? 'Male' : gender === 'female' ? 'Female' : gender,
                        value: count
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {Object.entries(detailedStats.citizensByGender).map(([gender]) => (
                        <Cell 
                          key={gender} 
                          fill={gender === 'male' ? '#3B82F6' : gender === 'female' ? '#EC4899' : '#6B7280'} 
                          stroke="#ffffff"
                          strokeWidth={3}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F9FAFB' }}
                      formatter={(value) => [`${value} citizens`, '']}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-8 mt-4">
                {Object.entries(detailedStats.citizensByGender).map(([gender, count]) => {
                  const total = calculateTotal(detailedStats.citizensByGender);
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <div key={gender} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full shadow-sm" 
                        style={{ backgroundColor: gender === 'male' ? '#3B82F6' : gender === 'female' ? '#EC4899' : '#6B7280' }}
                      />
                      <span className="text-sm capitalize text-gray-600 dark:text-gray-400">{gender}:</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{percentage.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Two Simple Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Simple Chart 1: Activity Level */}
        {Object.keys(activityData).length > 0 && (
          <Card className="overflow-hidden dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 dark:text-white">
                <Activity className="h-4 w-4 text-blue-500" />
                Activity Level
              </CardTitle>
              <CardDescription className="dark:text-gray-400">Active vs Inactive citizens</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(activityData).map(([level, count]) => {
                  const percentage = getPercentage(count, totalActivity);
                  return (
                    <div key={level}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize font-medium text-gray-700 dark:text-gray-300">{level}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{count} ({percentage}%)</span>
                      </div>
                      <Progress 
                        value={parseFloat(percentage)} 
                        className={level === 'active' ? 'bg-green-500' : 'bg-gray-500'} 
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Simple Chart 2: Polls by Status */}
        {Object.keys(pollsData).length > 0 && (
          <Card className="overflow-hidden dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 dark:text-white">
                <Vote className="h-4 w-4 text-purple-500" />
                Polls Status
              </CardTitle>
              <CardDescription className="dark:text-gray-400">Active vs Draft polls</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(pollsData).map(([status, count]) => {
                  const percentage = getPercentage(count, totalPollsStatus);
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize font-medium text-gray-700 dark:text-gray-300">{status}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{count} ({percentage}%)</span>
                      </div>
                      <Progress 
                        value={parseFloat(percentage)} 
                        className={status === 'active' ? 'bg-green-500' : 'bg-yellow-500'} 
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}