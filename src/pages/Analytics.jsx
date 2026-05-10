import { useState, useEffect } from "react";
import { 
  MapPin, 
  Briefcase, 
  Shield, 
  MessageSquare, 
  Lightbulb, 
  Flag,
  Building2,
  TrendingUp,
  Users,
  Vote,
  Calendar,
  Download,
  Filter,
  PieChart,
  BarChart3,
  Activity,
  Award,
  Clock,
  Target,
  Zap,
  Crown,
  Globe,
  UserCheck,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/services/Api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  Scatter
} from "recharts";

export default function Analytics() {
  const { access_token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [overviewStats, setOverviewStats] = useState(null);
  const [detailedStats, setDetailedStats] = useState(null);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1'];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [overviewResponse, detailedResponse] = await Promise.all([
        authApi.getOverviewStats(access_token),
        authApi.getDetailedStats(access_token)
      ]);

      if (overviewResponse.success) {
        setOverviewStats(overviewResponse.data);
      }

      if (detailedResponse.success) {
        setDetailedStats(detailedResponse.data);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch statistics");
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if object has data
  const hasData = (obj) => {
    return obj && Object.keys(obj).length > 0;
  };

  // Helper function to calculate total
  const calculateTotal = (obj) => {
    if (!obj) return 0;
    return Object.values(obj).reduce((a, b) => a + b, 0);
  };

  // Calculate key metrics
  const totalCitizens = overviewStats?.totalCitizens || calculateTotal(detailedStats?.citizensByGender);
  const totalAdmins = overviewStats?.totalAdmins || calculateTotal(detailedStats?.adminsByBureau);
  const totalPolls = overviewStats?.totalPolls || calculateTotal(detailedStats?.pollsByStatus);
  const totalForums = overviewStats?.totalForumPosts || calculateTotal(detailedStats?.forumsByCategory);
  const totalSuggestions = overviewStats?.totalSuggestions || calculateTotal(detailedStats?.suggestionsByStatus);
  const totalReports = overviewStats?.totalReports || calculateTotal(detailedStats?.reportsByStatus);
  const totalBureaus = overviewStats?.totalBureaus || (detailedStats?.adminsByBureau ? Object.keys(detailedStats.adminsByBureau).length : 0);

  // Prepare activity distribution data
  const activityData = detailedStats?.citizensByActivityLevel ? [
    { name: 'Active', value: detailedStats.citizensByActivityLevel.active || 0, color: '#10B981' },
    { name: 'Inactive', value: detailedStats.citizensByActivityLevel.inactive || 0, color: '#EF4444' }
  ] : [];

  // Prepare admins by bureau data - vertical bar chart
  const adminsByBureauData = detailedStats?.adminsByBureau ? 
    Object.entries(detailedStats.adminsByBureau).map(([bureau, count]) => ({
      name: bureau.length > 20 ? bureau.substring(0, 17) + '...' : bureau,
      fullName: bureau,
      admins: count
    })).sort((a, b) => b.admins - a.admins) : [];

  // Prepare polls status data
  const pollsStatusData = detailedStats?.pollsByStatus ? 
    Object.entries(detailedStats.pollsByStatus).map(([status, count]) => ({
      name: status === 'active' ? 'Active' : status === 'completed' ? 'Completed' : status,
      originalStatus: status,
      count: count,
      percentage: totalPolls > 0 ? Math.round((count / totalPolls) * 100) : 0
    })) : [];

  // Prepare work type data
  const workTypeData = detailedStats?.citizensByWorkType ? 
    Object.entries(detailedStats.citizensByWorkType).map(([type, count]) => ({
      name: type,
      count: count,
      percentage: Math.round((count / totalCitizens) * 100)
    })).sort((a, b) => b.count - a.count) : [];

  // Prepare region data with percentages
  const regionData = detailedStats?.citizensByRegion ? 
    Object.entries(detailedStats.citizensByRegion).map(([region, count]) => ({
      name: region,
      count: count,
      percentage: Math.round((count / totalCitizens) * 100)
    })).sort((a, b) => b.count - a.count) : [];

  // Prepare forums by category data
  const forumsByCategoryData = detailedStats?.forumsByCategory ? 
    Object.entries(detailedStats.forumsByCategory).map(([category, count]) => ({
      name: category,
      forums: count
    })) : [];

  // Prepare reports status data
  const reportsStatusData = detailedStats?.reportsByStatus ? 
    Object.entries(detailedStats.reportsByStatus).map(([status, count]) => ({
      name: status === 'open' ? 'Open' : status === 'resolved' ? 'Resolved' : status,
      count: count,
      backgroundColor: status === 'open' ? '#EF4444' : status === 'resolved' ? '#10B981' : '#6B7280'
    })) : [];

  // Prepare suggestions status data
  const suggestionsStatusData = detailedStats?.suggestionsByStatus ? 
    Object.entries(detailedStats.suggestionsByStatus).map(([status, count]) => ({
      name: status === 'pending' ? 'Pending' : status === 'responded' ? 'Responded' : status,
      count: count,
      backgroundColor: status === 'pending' ? '#F59E0B' : '#10B981'
    })) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading analytics data...</p>
          <p className="text-sm text-gray-400 mt-1">Please wait while we process your data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
          <p className="text-red-600 font-medium mb-2">Failed to load analytics data</p>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Comprehensive insights and advanced metrics about your platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Citizens</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalCitizens.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Admins</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalAdmins}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Bureaus</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalBureaus}</p>
              </div>
              <Building2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Active Polls</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{detailedStats?.pollsByStatus?.active || 0}</p>
              </div>
              <Vote className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Forum Posts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalForums.toLocaleString()}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Suggestions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalSuggestions}</p>
              </div>
              <Lightbulb className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Regions and Work Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {regionData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" />
                Top Regions
              </CardTitle>
              <CardDescription>Citizen distribution by region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regionData.slice(0, 5).map((region) => (
                  <div key={region.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{region.name}</span>
                      <span className="text-gray-500">{region.count} citizens ({region.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${region.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {workTypeData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-green-500" />
                Employment Sectors
              </CardTitle>
              <CardDescription>Citizen distribution by work type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workTypeData.map((type) => (
                  <div key={type.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{type.name}</span>
                      <span className="text-gray-500">{type.count} ({type.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${type.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Admins by Bureau (Wider) and Polls Overview (Narrower) - Side by Side with custom column sizing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Admins by Bureau - Takes 2/3 of the space (wider) */}
        {adminsByBureauData.length > 0 && (
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-green-500" />
                  Admins by Bureau
                </CardTitle>
                <CardDescription>Distribution of administrators across government bureaus</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={adminsByBureauData}
                      margin={{ top: 20, right: 30, left: 60, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={80}
                        interval={0}
                        tick={{ fontSize: 11, fill: "#6B7280" }}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name, props) => {
                          return [`${value} admins`, props.payload.fullName || props.payload.name];
                        }}
                      />
                      <Bar dataKey="admins" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Polls Overview - Takes 1/3 of the space (narrower) */}
        {pollsStatusData.length > 0 && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Vote className="h-5 w-5 text-orange-500" />
                  Polls Overview
                </CardTitle>
                <CardDescription>Distribution of active and completed polls</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-4 w-full">
                    {pollsStatusData.map((poll) => (
                      <div key={poll.name} className="text-center">
                        <div className="relative w-28 h-28 mx-auto">
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="#E5E7EB"
                              strokeWidth="10"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke={poll.name === 'Active' ? '#10B981' : '#6B7280'}
                              strokeWidth="10"
                              strokeDasharray={`${(poll.count / totalPolls) * 283} 283`}
                              strokeLinecap="round"
                              transform="rotate(-90 50 50)"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <p className="text-xl font-bold" style={{ color: poll.name === 'Active' ? '#10B981' : '#6B7280' }}>
                              {poll.percentage}%
                            </p>
                            <p className="text-xs text-gray-500">{poll.name}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">{poll.count} polls</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Forums by Category and Activity Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {forumsByCategoryData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                Forums by Category
              </CardTitle>
              <CardDescription>Distribution of forums across categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={forumsByCategoryData}
                    margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="forums" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {activityData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Activity Status
              </CardTitle>
              <CardDescription>Active vs Inactive citizens</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-80">
                <div className="grid grid-cols-2 gap-8 w-full">
                  {activityData.map((item) => {
                    const percentage = Math.round((item.value / totalCitizens) * 100);
                    return (
                      <div key={item.name} className="text-center">
                        <div className="relative w-32 h-32 mx-auto">
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="#E5E7EB"
                              strokeWidth="10"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke={item.color}
                              strokeWidth="10"
                              strokeDasharray={`${(item.value / totalCitizens) * 283} 283`}
                              strokeLinecap="round"
                              transform="rotate(-90 50 50)"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <p className="text-2xl font-bold" style={{ color: item.color }}>
                              {percentage}%
                            </p>
                            <p className="text-xs text-gray-500">{item.name}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{item.value.toLocaleString()} citizens</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reports and Suggestions Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reportsStatusData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-red-500" />
                Reports Status
              </CardTitle>
              <CardDescription>Open vs Resolved reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-6 w-full">
                  {reportsStatusData.map((report) => {
                    const total = calculateTotal(detailedStats.reportsByStatus);
                    const percentage = total > 0 ? Math.round((report.count / total) * 100) : 0;
                    return (
                      <div key={report.name} className="text-center">
                        <div className="relative w-32 h-32 mx-auto">
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="#E5E7EB"
                              strokeWidth="10"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke={report.backgroundColor}
                              strokeWidth="10"
                              strokeDasharray={`${(report.count / total) * 283} 283`}
                              strokeLinecap="round"
                              transform="rotate(-90 50 50)"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <p className="text-2xl font-bold" style={{ color: report.backgroundColor }}>
                              {percentage}%
                            </p>
                            <p className="text-xs text-gray-500">{report.name}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{report.count} reports</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {suggestionsStatusData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Suggestions Status
              </CardTitle>
              <CardDescription>Pending vs Responded suggestions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-6 w-full">
                  {suggestionsStatusData.map((suggestion) => {
                    const total = calculateTotal(detailedStats.suggestionsByStatus);
                    const percentage = total > 0 ? Math.round((suggestion.count / total) * 100) : 0;
                    return (
                      <div key={suggestion.name} className="text-center">
                        <div className="relative w-32 h-32 mx-auto">
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="#E5E7EB"
                              strokeWidth="10"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke={suggestion.backgroundColor}
                              strokeWidth="10"
                              strokeDasharray={`${(suggestion.count / total) * 283} 283`}
                              strokeLinecap="round"
                              transform="rotate(-90 50 50)"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <p className="text-2xl font-bold" style={{ color: suggestion.backgroundColor }}>
                              {percentage}%
                            </p>
                            <p className="text-xs text-gray-500">{suggestion.name}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{suggestion.count} suggestions</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}