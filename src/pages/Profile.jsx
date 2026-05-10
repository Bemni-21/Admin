import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  User, 
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/authStore";
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
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saveError, setSaveError] = useState("");

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
          phone: profileData.phone_number || profileData.phone || user?.phone || "", // Changed to phone_number
          profileImage: profileData.image || profileData.profileImage || profileData.photo_url || user?.photo_url || "", // Changed to image
          role: profileData.role || user?.role || "Global Admin",
          bureau: profileData.bureau || user?.bureau || "Global",
          createdAt: profileData.created_at || profileData.createdAt || user?.createdAt || new Date().toISOString() // Changed to created_at
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

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");
    
    try {
      // Send only the fields that can be updated
      const updateData = {
        name: profileSettings.name,
        phone_number: profileSettings.phone // Changed to phone_number to match API
      };
      
      console.log("Updating profile with:", updateData);
      
      const response = await authApi.updateGlobalAdminProfile(
        updateData,
        access_token
      );

      if (response.success) {
        setSaveSuccess("Profile updated successfully!");
        // Refresh profile data to get updated values
        await fetchProfile();
        setTimeout(() => setSaveSuccess(""), 3000);
      } else {
        setSaveError(response.error || "Failed to update profile");
        setTimeout(() => setSaveError(""), 3000);
      }
    } catch (err) {
      console.error("Update error:", err);
      setSaveError(err.message || "Failed to update profile");
      setTimeout(() => setSaveError(""), 3000);
    } finally {
      setSaving(false);
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
      {/* Success/Error Messages */}
      {saveSuccess && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <p className="text-green-600 dark:text-green-400">{saveSuccess}</p>
          </div>
        </div>
      )}

      {saveError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-red-600 dark:text-red-400">{saveError}</p>
          </div>
        </div>
      )}

      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Image & Role */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                {/* Profile Image - Static display only */}
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
                    <span className="text-gray-600 dark:text-gray-300 break-all">{profileSettings.email}</span>
                  </div>
                  
                  {profileSettings.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">{profileSettings.phone}</span>
                    </div>
                  )}
                  
                  {profileSettings.bureau && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">{profileSettings.bureau}</span>
                    </div>
                  )}
                  
                  {profileSettings.createdAt && (
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Joined {formatDate(profileSettings.createdAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={profileSettings.name}
                    onChange={handleProfileChange}
                    placeholder="Enter your full name"
                    className="focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profileSettings.email}
                    disabled
                    className="bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={profileSettings.phone}
                    onChange={handleProfileChange}
                    placeholder="+251-XXX-XXX-XXX"
                  />
                </div>
              </div>

              <Separator className="my-4" />

              {/* Save Button at the bottom */}
              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Profile Changes
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-300">Security Note</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                      Your email address is used for account verification and important notifications. 
                      To change your email, please contact system administrator.
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