import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, Home, BarChart3, Users as UsersIcon, Settings, LogOut, Vote, Building2, Shield, Globe, Moon, Sun, TrendingUp, Bell, Activity, Flag, Lightbulb, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { useInactivityTimer } from "@/hooks/useInactivityTimer";
import OverviewComponent from "@/pages/Overview";
import AnalyticsComponent from "@/pages/Analytics";
import UsersComponent from "@/pages/Users";
import ForumsComponent from "@/pages/Forums";
import ForumDetailView from "@/components/ForumDetailView";
import PollsComponent from "@/pages/Polls";
import BureauComponent from "@/pages/Bureau";
import AgencySuperAdminComponent from "@/pages/AgencySuperAdmin";
import SettingsComponent from "@/pages/Settings";
import AnnouncementComponent from "@/pages/Announcement";
import AuditComponent from "@/pages/Audit";
import NotificationComponent from "@/pages/Notification";
import SuggestionComponent from "@/pages/Suggestion";
import ReportComponent from "@/pages/Report";
import { authApi } from "@/services/Api";

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedForumId, setSelectedForumId] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    image: ""
  });
  const [unreadCount, setUnreadCount] = useState(0);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, access_token } = useAuthStore();

  // Add inactivity timer hook - this will auto-logout after 10 minutes of inactivity
  useInactivityTimer();

  // Track user activity and store timestamp
  useEffect(() => {
    const updateLastActivity = () => {
      localStorage.setItem('last_activity', Date.now().toString());
    };
    
    // Update immediately when dashboard loads
    updateLastActivity();
    
    // Update on user activity
    const events = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart', 'keypress'];
    events.forEach(event => {
      window.addEventListener(event, updateLastActivity);
    });
    
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateLastActivity);
      });
    };
  }, []);

  // Fetch user profile data
  useEffect(() => {
    fetchUserProfile();
    fetchUnreadNotifications();
    
    // Set up interval to fetch unread notifications every 30 seconds
    const interval = setInterval(fetchUnreadNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await authApi.getGlobalAdminProfile(access_token);
      if (response.success && response.data) {
        setUserProfile({
          name: response.data.name || user?.name || "Admin",
          email: response.data.email || user?.email || "",
          image: response.data.image || user?.photo_url || ""
        });
      } else {
        setUserProfile({
          name: user?.name || "Admin",
          email: user?.email || "",
          image: user?.photo_url || ""
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUserProfile({
        name: user?.name || "Admin",
        email: user?.email || "",
        image: user?.photo_url || ""
      });
    }
  };

  const fetchUnreadNotifications = async () => {
    try {
      const response = await authApi.getAuditNotifications(access_token, { read: false });
      
      let notificationsData = [];
      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
          notificationsData = response.data;
        } else if (response.data.notifications && Array.isArray(response.data.notifications)) {
          notificationsData = response.data.notifications;
        }
      } else if (Array.isArray(response)) {
        notificationsData = response;
      } else if (response.notifications && Array.isArray(response.notifications)) {
        notificationsData = response.notifications;
      }
      
      const unread = notificationsData.filter(n => !n.is_read && !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Failed to fetch unread notifications:", error);
    }
  };

  // Apply theme to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'am' : 'en';
    i18n.changeLanguage(newLang);
  };

  // Check URL params for forum ID on mount and when location changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    const forumId = params.get('forumId');
    
    if (tab) {
      setActiveTab(tab);
    }
    
    if (forumId) {
      setSelectedForumId(forumId);
    } else {
      setSelectedForumId(null);
    }
  }, [location.search]);

  const handleLogout = () => {
    // Clear last activity before logout
    localStorage.removeItem('last_activity');
    navigate('/logout');
  };

  const handleBackToForums = () => {
    navigate('/dashboard?tab=forums');
    setSelectedForumId(null);
  };

  const handleNotificationClick = () => {
    setUnreadCount(0);
    setActiveTab("notifications");
    navigate('/dashboard?tab=notifications');
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "AD";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get first name for welcome message
  const getFirstName = (name) => {
    if (!name) return "Admin";
    return name.split(' ')[0];
  };

  // Fixed sidebar width - always 256px when open, 80px when collapsed
  const sidebarWidth = open ? "w-64" : "w-20";

  // Navigation items with translations - ALL TRANSLATED
 const navItems = [
  { icon: <Home size={20} />, label: t('dashboard.overview'), tab: "overview" },
  { icon: <TrendingUp size={20} />, label: t('dashboard.analytics'), tab: "analytics" },
  { icon: <UsersIcon size={20} />, label: t('dashboard.users'), tab: "users" },
  { icon: <MessageSquare size={20} />, label: t('dashboard.forums'), tab: "forums" },
  { icon: <BarChart3 size={20} />, label: t('dashboard.polls'), tab: "polls" },
  { icon: <Building2 size={20} />, label: t('dashboard.bureau'), tab: "bureau" },
  { icon: <Shield size={20} />, label: t('dashboard.super_admins'), tab: "agency-super-admin" },
  { icon: <Bell size={20} />, label: t('dashboard.announcements'), tab: "announcements" },
  { icon: <Activity size={20} />, label: t('dashboard.audit'), tab: "audit" },
  { icon: <Flag size={20} />, label: t('dashboard.reports'), tab: "reports" },
  { icon: <Lightbulb size={20} />, label: t('dashboard.suggestions'), tab: "suggestions" },
  { icon: <Bell size={20} />, label: t('dashboard.notifications'), tab: "notifications" },
  { icon: <Settings size={20} />, label: t('dashboard.settings'), tab: "settings" },
];
  // Function to render content based on active tab and selected forum
  const renderContent = () => {
    if (selectedForumId) {
      return (
        <ForumDetailView 
          forumId={selectedForumId} 
          onBack={handleBackToForums} 
        />
      );
    }
    
    switch(activeTab) {
      case "overview":
        return <OverviewComponent />;
      case "analytics":
        return <AnalyticsComponent />;
      case "users":
        return <UsersComponent />;
      case "forums":
        return <ForumsComponent />;
      case "polls":
        return <PollsComponent />;
      case "bureau":
        return <BureauComponent />;
      case "agency-super-admin":
        return <AgencySuperAdminComponent />;
      case "announcements":
        return <AnnouncementComponent />;
      case "audit":
        return <AuditComponent />;
      case "reports":
        return <ReportComponent />;
      case "suggestions":
        return <SuggestionComponent />;
      case "notifications":
        return <NotificationComponent />;
      case "settings":
        return <SettingsComponent />;
      default:
        return <OverviewComponent />;
    }
  };

  const getHeaderTitle = () => {
  if (selectedForumId) {
    return t('forums.title');
  }
  const titles = {
    overview: t('dashboard.overview'),
    analytics: t('dashboard.analytics'),
    users: t('dashboard.users'),
    forums: t('dashboard.forums'),
    polls: t('dashboard.polls'),
    bureau: t('dashboard.bureau'),
    "agency-super-admin": t('dashboard.super_admins'),
    announcements: t('announcements.title'),
    audit: t('audit.title'),
    reports: t('reports.title'),
    suggestions: t('suggestions.title'),
    notifications: t('notifications.title'),
    settings: t('dashboard.settings')
  };
  return titles[activeTab] || t('dashboard.title');
};

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar - Fixed width with scrollable navigation */}
      <aside
        className={`${sidebarWidth} bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 flex flex-col fixed h-full z-30`}
      >
        {/* Logo Area - Fixed at top */}
        <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h1 className={`font-bold text-xl text-gray-800 dark:text-white ${!open && "hidden"}`}>
            {t('dashboard.admin_dashboard')}
          </h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setOpen(!open)} 
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu size={20} />
          </Button>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto">
          <nav className="mt-6 space-y-1 px-3 pb-4">
            {navItems.map((item, index) => (
              <div
                key={index}
                onClick={() => {
                  setSelectedForumId(null);
                  setActiveTab(item.tab);
                  navigate(`/dashboard?tab=${item.tab}`);
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                  activeTab === item.tab && !selectedForumId
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className={`${!open && "hidden"} font-medium text-sm`}>
                  {item.label}
                </span>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Section - Fixed at bottom */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 space-y-2 flex-shrink-0">
          {/* Theme Toggle */}
          <div
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span className={`${!open && "hidden"} text-sm font-medium`}>
              {isDarkMode ? (i18n.language === 'en' ? 'Light Mode' : 'ቀላል ሁነታ') : (i18n.language === 'en' ? 'Dark Mode' : 'ጨለማ ሁነታ')}
            </span>
          </div>

          {/* Language Toggle */}
          <div
            onClick={toggleLanguage}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
          >
            <Globe size={20} />
            <span className={`${!open && "hidden"} text-sm font-medium`}>
              {i18n.language === 'en' ? 'አማርኛ' : 'English'}
            </span>
          </div>

          {/* Logout Button */}
          <div
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300"
          >
            <LogOut size={20} />
            <span className={`${!open && "hidden"} text-sm font-medium`}>
              {t('common.logout')}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content - Add margin-left to account for fixed sidebar */}
      <main className={`flex-1 transition-all duration-300 ${open ? "ml-64" : "ml-20"}`}>
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-20">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold capitalize text-gray-800 dark:text-white">
              {getHeaderTitle()}
            </h2>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t('common.welcome')}, {getFirstName(userProfile.name)}
              </span>
              
              {/* Notification Icon with Badge */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNotificationClick}
                  className="relative text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge 
                      className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs rounded-full border-2 border-white dark:border-gray-800"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </div>

              <Avatar className="h-8 w-8">
                {userProfile.image ? (
                  <AvatarImage src={userProfile.image} alt={userProfile.name} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm">
                    {getInitials(userProfile.name)}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}