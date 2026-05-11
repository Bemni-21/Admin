import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  User, 
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Building2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/authStore";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { authApi } from "@/services/Api";

export default function Profile() {
  const { t } = useTranslation();
  const { user, access_token } = useAuthStore();
  
  // Profile settings
  const [profileSettings, setProfileSettings] = useState({
    name: "",
    email: "",
    phone: "",
    profileImage: "",
    role: "",
    bureau: "",
    createdAt: ""
  });

  const [loading, setLoading] = useState(true);

  // Fetch profile data on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await authApi.getGlobalAdminProfile(access_token);
      console.log("Profile response:", response);
      
      // Check if response has data property
      if (response.success && response.data) {
        const profileData = response.data;
        console.log("Profile data from API:", profileData);
        
        setProfileSettings({
          name: profileData.name || user?.name || "",
          email: profileData.email || user?.email || "",
          phone: profileData.phone_number || profileData.phone || user?.phone || "",
          profileImage: profileData.image || profileData.profileImage || profileData.photo_url || user?.photo_url || "",
          role: profileData.role || user?.role || "Global Admin",
          bureau: profileData.bureau || user?.bureau || "Global",
          createdAt: profileData.created_at || profileData.createdAt || user?.createdAt || new Date().toISOString()
        });
      } else if (response.data) {
        // If response doesn't have success property but has data
        const profileData = response.data;
        setProfileSettings({
          name: profileData.name || user?.name || "",
          email: profileData.email || user?.email || "",
          phone: profileData.phone_number || profileData.phone || user?.phone || "",
          profileImage: profileData.image || profileData.profileImage || profileData.photo_url || user?.photo_url || "",
          role: profileData.role || user?.role || "Global Admin",
          bureau: profileData.bureau || user?.bureau || "Global",
          createdAt: profileData.created_at || profileData.createdAt || user?.createdAt || new Date().toISOString()
        });
      } else {
        // Fallback to existing user data
        setProfileSettings({
          name: user?.name || "",
          email: user?.email || "",
          phone: user?.phone || "",
          profileImage: user?.photo_url || "",
          role: user?.role || "Global Admin",
          bureau: user?.bureau || "Global",
          createdAt: user?.createdAt || new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Fallback to existing user data
      setProfileSettings({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        profileImage: user?.photo_url || "",
        role: user?.role || "Global Admin",
        bureau: user?.bureau || "Global",
        createdAt: user?.createdAt || new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Image & Role */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                {/* Profile Image */}
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={profileSettings.profileImage} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-3xl">
                    {getInitials(profileSettings.name)}
                  </AvatarFallback>
                </Avatar>

                {/* Role Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                  <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {profileSettings.role === 'super_admin' ? 'Super Admin' : profileSettings.role}
                  </span>
                </div>

                <Separator className="my-4" />

                {/* Account Info */}
                <div className="w-full space-y-3 text-left">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Account Information</h3>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Email</p>
                      <span className="text-gray-600 dark:text-gray-300 break-all">{profileSettings.email}</span>
                    </div>
                  </div>
                  
                  {profileSettings.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Phone</p>
                        <span className="text-gray-600 dark:text-gray-300">{profileSettings.phone}</span>
                      </div>
                    </div>
                  )}
                  
                  {profileSettings.bureau && (
                    <div className="flex items-center gap-3 text-sm">
                      <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Bureau</p>
                        <span className="text-gray-600 dark:text-gray-300">{profileSettings.bureau}</span>
                      </div>
                    </div>
                  )}
                  
                  {profileSettings.createdAt && (
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Joined</p>
                        <span className="text-gray-600 dark:text-gray-300">
                          {formatDate(profileSettings.createdAt)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Profile Details (Read Only) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Your profile information (read-only)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name - Read Only */}
                <div className="space-y-1">
                  <Label className="text-sm text-gray-500 dark:text-gray-400">Full Name</Label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-900 dark:text-white font-medium">{profileSettings.name || "Not provided"}</p>
                  </div>
                </div>

                {/* Email - Read Only */}
                <div className="space-y-1">
                  <Label className="text-sm text-gray-500 dark:text-gray-400">Email Address</Label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-900 dark:text-white">{profileSettings.email || "Not provided"}</p>
                  </div>
                </div>

                {/* Phone - Read Only */}
                <div className="space-y-1">
                  <Label className="text-sm text-gray-500 dark:text-gray-400">Phone Number</Label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-900 dark:text-white">{profileSettings.phone || "Not provided"}</p>
                  </div>
                </div>

                {/* Role - Read Only */}
                <div className="space-y-1">
                  <Label className="text-sm text-gray-500 dark:text-gray-400">Role</Label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-900 dark:text-white">
                      {profileSettings.role === 'super_admin' ? 'Super Admin' : profileSettings.role || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Info Note */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-300">Profile Information</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                      Your profile information is managed by system administrators. 
                      To update any details, please contact your system administrator.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
