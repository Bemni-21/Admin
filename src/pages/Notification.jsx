import { useState, useEffect } from "react";
import { 
  Bell, 
  CheckCheck, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  Mail,
  Clock,
  RefreshCw,
  Eye,
  EyeOff,
  TrendingUp,
  Flag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/services/Api";

export default function Notification() {
  const { access_token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await authApi.getAuditNotifications(access_token, {});
      
      console.log("API Response:", response);
      
      let notificationsData = [];
      
      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
          notificationsData = response.data;
        }
        else if (response.data.notifications && Array.isArray(response.data.notifications)) {
          notificationsData = response.data.notifications;
        }
      } 
      else if (Array.isArray(response)) {
        notificationsData = response;
      }
      else if (response.notifications && Array.isArray(response.notifications)) {
        notificationsData = response.notifications;
      }
      
      console.log("Extracted notifications:", notificationsData);
      
      const mappedNotifications = notificationsData.map(notif => ({
        id: notif.id,
        title: notif.title,
        message: notif.message,
        type: notif.type === 'danger' ? 'error' : notif.type,
        is_read: notif.is_read,
        read: notif.is_read,
        created_at: notif.created_at,
        target_screen: notif.target_screen,
        target_id: notif.target_id,
        user_id: notif.user_id
      }));
      
      setNotifications(mappedNotifications);
      calculateStats(mappedNotifications);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const unread = data.filter(n => !n.read && !n.is_read).length;
    const read = total - unread;
    setStats({ total, unread, read });
  };

  const markAsRead = async (id) => {
    try {
      const response = await authApi.markNotificationAsRead(id, access_token);
      if (response.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === id ? { ...notif, read: true, is_read: true } : notif
          )
        );
        calculateStats(notifications.map(n => n.id === id ? { ...n, read: true, is_read: true } : n));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await authApi.markAllNotificationsAsRead(access_token);
      if (response.success) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true, is_read: true }))
        );
        setStats(prev => ({ ...prev, unread: 0, read: prev.total }));
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
      case 'danger':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'trending':
        return <TrendingUp className="h-5 w-5 text-purple-500" />;
      case 'report':
        return <Flag className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card className="hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{value}</p>
          </div>
          <div className={`p-2 rounded-full ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header - Only refresh button */}
      <div className="flex justify-end">
        <div className="flex gap-2">
          {stats.unread > 0 && (
            <Button 
              variant="outline" 
              onClick={markAllAsRead}
              className="gap-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={fetchNotifications}
            className="gap-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard 
          title="Total Notifications" 
          value={stats.total} 
          icon={Bell}
          color="bg-blue-500"
        />
        <StatCard 
          title="Unread" 
          value={stats.unread} 
          icon={EyeOff}
          color="bg-yellow-500"
        />
        <StatCard 
          title="Read" 
          value={stats.read} 
          icon={Eye}
          color="bg-green-500"
        />
      </div>

      {/* Notifications List - With Mark Read buttons */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <Bell className="h-5 w-5" />
                Notification History
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                All system notifications and alerts
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No notifications found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    !notification.read && !notification.is_read
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <h4 className={`font-medium ${
                            !notification.read && !notification.is_read
                              ? 'text-gray-900 dark:text-white' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && !notification.is_read && (
                          <Badge className="bg-blue-500 text-white dark:bg-blue-600 whitespace-nowrap">
                            New
                          </Badge>
                        )}
                      </div>
                      
                      {/* Metadata */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 dark:text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{getTimeAgo(notification.created_at)}</span>
                        </div>
                        {notification.target_screen && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{notification.target_screen}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Mark Read Button for unread notifications */}
                    {!notification.read && !notification.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="flex-shrink-0 dark:text-gray-400 dark:hover:text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark read
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}