import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Shield,
  UserCheck,
  Building2,
  Clock,
  Activity,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { authApi, pollsApi } from "@/services/Api";

export default function Audit() {
  const { access_token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedRows, setExpandedRows] = useState({});
  
  // Stats state
  const [stats, setStats] = useState(null);
  
  // Admin actions state
  const [adminActions, setAdminActions] = useState([]);
  const [adminActionsTotal, setAdminActionsTotal] = useState(0);
  const [adminActionsPage, setAdminActionsPage] = useState(1);
  const [adminActionsTotalPages, setAdminActionsTotalPages] = useState(1);
  
  // Filters
  const [bureaus, setBureaus] = useState([]);
  const [filters, setFilters] = useState({
    bureauId: "all",
    startDate: "",
    endDate: "",
    action: "all",
    entityType: "all"
  });
  const [searchTerm, setSearchTerm] = useState("");
  
  const limit = 20;

  // Fetch bureaus on mount
  useEffect(() => {
    fetchBureaus();
  }, []);

  // Fetch data when filters or page change
  useEffect(() => {
    fetchAuditData();
  }, [filters, adminActionsPage, searchTerm]);

  const fetchBureaus = async () => {
    try {
      const response = await pollsApi.getBureaus(access_token);
      if (response.success) {
        setBureaus(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch bureaus:", err);
    }
  };

  const fetchAuditData = async () => {
    setLoading(true);
    setError("");
    
    try {
      await fetchStats();
      await fetchAdminActions();
    } catch (err) {
      setError(err.message || "Failed to fetch audit data");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await authApi.getAuditStats(access_token);
      if (response.success && response.data) {
        setStats({
          totalCitizens: response.data.total_citizens || 0,
          totalActiveAgencies: response.data.total_active_agencies || 0,
          systemManagementActions30d: response.data.system_management_actions_30d || 0,
          serverTimestamp: response.data.server_timestamp
        });
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const fetchAdminActions = async () => {
    try {
      const params = {
        limit,
        offset: (adminActionsPage - 1) * limit
      };
      if (filters.bureauId && filters.bureauId !== "all") params.bureauId = filters.bureauId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.action && filters.action !== "all") params.action = filters.action;
      if (filters.entityType && filters.entityType !== "all") params.entityType = filters.entityType;
      
      const response = await authApi.getAdminActionsAudit(access_token, params);
      if (response.success && response.data) {
        let filteredData = response.data;
        if (searchTerm) {
          filteredData = response.data.filter(action => 
            action.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            action.admin_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            action.admin_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            action.bureau_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            action.entity_type?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        setAdminActions(filteredData);
        setAdminActionsTotal(filteredData.length);
        setAdminActionsTotalPages(Math.ceil(filteredData.length / limit));
      }
    } catch (err) {
      console.error("Failed to fetch admin actions:", err);
      setAdminActions([]);
    }
  };

  const toggleRowExpand = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const formatServerTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString();
  };

  const getActionBadgeColor = (action) => {
    if (!action) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    if (action.includes('create')) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (action.includes('update') || action.includes('change')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    if (action.includes('delete') || action.includes('remove')) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (action.includes('comment')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getStatusChangeDisplay = (oldValues, newValues) => {
    if (!oldValues && !newValues) return null;
    
    if (oldValues?.application_status && newValues?.application_status) {
      return (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-red-600 line-through">{oldValues.application_status}</span>
          <span className="text-gray-400">→</span>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            {newValues.application_status}
          </Badge>
        </div>
      );
    }
    
    const changedFields = [];
    if (oldValues && newValues) {
      Object.keys(newValues).forEach(key => {
        if (oldValues[key] !== newValues[key]) {
          changedFields.push(key);
        }
      });
    }
    
    if (changedFields.length > 0) {
      return (
        <div className="text-sm">
          <span className="font-medium text-gray-600 dark:text-gray-400">Changed fields:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {changedFields.slice(0, 3).map(field => (
              <Badge key={field} variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-400">
                {field}
              </Badge>
            ))}
            {changedFields.length > 3 && (
              <span className="text-xs text-gray-400 dark:text-gray-500">+{changedFields.length - 3} more</span>
            )}
          </div>
        </div>
      );
    }
    
    return null;
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <Card className="hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
      <CardContent className="p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-xl md:text-2xl font-bold mt-1 text-gray-900 dark:text-white">{value.toLocaleString()}</p>
            {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-2 rounded-full ${color}`}>
            <Icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading && !adminActions.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400 dark:text-gray-500" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading audit data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header - No title, only refresh button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => fetchAuditData()}
          className="gap-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <StatCard
            title="Total Citizens"
            value={stats.totalCitizens || 0}
            icon={Users}
            color="bg-blue-500"
          />
          <StatCard
            title="Active Agencies"
            value={stats.totalActiveAgencies || 0}
            icon={Building2}
            color="bg-green-500"
          />
          <StatCard
            title="System Management Actions (30d)"
            value={stats.systemManagementActions30d || 0}
            icon={Activity}
            color="bg-purple-500"
            subtitle={`Last updated: ${formatServerTimestamp(stats.serverTimestamp)}`}
          />
        </div>
      )}

      {/* Search Bar Only - No Filters */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-3 md:p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by action, admin, bureau, entity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Admin Actions Table - Mobile responsive */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="dark:text-white">Admin Actions Log</CardTitle>
          <CardDescription className="dark:text-gray-400">
            Track all administrative operations across bureaus
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          {adminActions.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">No admin actions found</p>
            </div>
          ) : (
            <>
              {/* Mobile View - Card Layout */}
              <div className="block md:hidden space-y-4">
                {adminActions.map((action) => (
                  <div key={action.id} className="border rounded-lg p-4 space-y-3 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <Badge className={getActionBadgeColor(action.action)}>
                        {action.action}
                      </Badge>
                      <button
                        onClick={() => toggleRowExpand(action.id)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                      >
                        {expandedRows[action.id] ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
                        <p className="text-sm font-medium dark:text-white">{action.admin_name || action.admin_email}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{action.admin_email}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Bureau</p>
                        <p className="text-sm dark:text-white">{action.bureau_name || 'Global'}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Entity</p>
                        <p className="text-sm dark:text-white">{action.entity_type}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                        <p className="text-sm dark:text-white">{formatDate(action.created_at)}</p>
                      </div>
                    </div>
                    
                    {expandedRows[action.id] && (
                      <div className="pt-3 border-t space-y-3 dark:border-gray-700">
                        {getStatusChangeDisplay(action.old_values, action.new_values)}
                        {action.entity_type === 'application_comments' && action.new_values?.text && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <p className="font-medium mb-1">Comment:</p>
                            <p>"{action.new_values.text}"</p>
                          </div>
                        )}
                        {action.metadata?.author_role && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Author Role</p>
                            <p className="text-sm dark:text-white">{action.metadata.author_role}</p>
                          </div>
                        )}
                        {action.metadata?.fields && action.metadata.fields.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Changed Fields</p>
                            <div className="flex flex-wrap gap-1">
                              {action.metadata.fields.map(field => (
                                <Badge key={field} variant="outline" className="text-xs dark:border-gray-600">
                                  {field}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop View - Table Layout */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr className="border-b dark:border-gray-600">
                      <th className="text-left py-3 px-4 font-medium dark:text-gray-300">Action</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-gray-300">Admin</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-gray-300">Bureau</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-gray-300">Entity</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-gray-300">Details</th>
                      <th className="text-left py-3 px-4 font-medium dark:text-gray-300">Date</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {adminActions.map((action) => (
                      <tr key={action.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="py-3 px-4">
                          <Badge className={getActionBadgeColor(action.action)}>
                            {action.action}
                          </Badge>
                         </td>
                        <td className="py-3 px-4">
                          <div className="font-medium dark:text-white">{action.admin_name || action.admin_email}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{action.admin_email}</div>
                         </td>
                        <td className="py-3 px-4 dark:text-gray-300">{action.bureau_name || 'Global'}</td>
                        <td className="py-3 px-4">
                          <div className="text-xs text-gray-500 dark:text-gray-400">{action.entity_type}</div>
                         </td>
                        <td className="py-3 px-4">
                          {getStatusChangeDisplay(action.old_values, action.new_values)}
                          {action.entity_type === 'application_comments' && action.new_values?.text && (
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              "{action.new_values.text}"
                            </div>
                          )}
                         </td>
                        <td className="py-3 px-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(action.created_at)}
                         </td>
                       </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {adminActionsTotalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400 order-2 sm:order-1">
                    Showing {Math.min(adminActionsTotal, (adminActionsPage - 1) * limit + 1)} to {Math.min(adminActionsPage * limit, adminActionsTotal)} of {adminActionsTotal} actions
                  </div>
                  <div className="flex gap-2 order-1 sm:order-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAdminActionsPage(p => Math.max(1, p - 1))}
                      disabled={adminActionsPage === 1}
                      className="dark:border-gray-600 dark:text-gray-300"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAdminActionsPage(p => Math.min(adminActionsTotalPages, p + 1))}
                      disabled={adminActionsPage === adminActionsTotalPages}
                      className="dark:border-gray-600 dark:text-gray-300"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}