import { useState, useEffect } from "react";
import * as yup from "yup";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Bell,
  Calendar,
  AlertCircle,
  Eye,
  Building2,
  CheckCircle,
  X,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { authApi, pollsApi } from "@/services/Api";
import UpdateAnnouncementModal from "@/components/UpdateAnnouncementModal";
import DeleteAnnouncementModal from "@/components/DeleteAnnouncementModal";

// Validation schema for creating announcement
const createAnnouncementSchema = yup.object({
  title: yup
    .string()
    .required("Title is required")
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be less than 200 characters"),
  content: yup
    .string()
    .required("Content is required")
    .min(10, "Content must be at least 10 characters")
    .max(5000, "Content must be less than 5000 characters"),
});

export default function Announcement() {
  const { access_token } = useAuthStore();
  const [announcements, setAnnouncements] = useState([]);
  const [bureaus, setBureaus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  const announcementsPerPage = 6;

  // Form state for creating announcement
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    target_role: "all",
    bureau_id: ""
  });

  // Validation functions
  const validateField = async (field, value) => {
    try {
      await createAnnouncementSchema.validateAt(field, { [field]: value });
      setFieldErrors(prev => ({ ...prev, [field]: "" }));
      return true;
    } catch (err) {
      setFieldErrors(prev => ({ ...prev, [field]: err.message }));
      return false;
    }
  };

  const validateForm = async () => {
    try {
      await createAnnouncementSchema.validate(formData, { abortEarly: false });
      setFieldErrors({});
      return true;
    } catch (err) {
      const errors = {};
      err.inner.forEach(error => {
        errors[error.path] = error.message;
      });
      setFieldErrors(errors);
      return false;
    }
  };

  const handleFieldBlur = async (field) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    await validateField(field, formData[field]);
  };

  const showError = (field) => {
    return touchedFields[field] && fieldErrors[field];
  };

  // Fetch announcements and bureaus on component mount
  useEffect(() => {
    fetchAnnouncements();
    fetchBureaus();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setFetchError("");
    
    try {
      const response = await authApi.getGlobalAnnouncements(access_token);
      
      if (response && response.success) {
        const activeOnly = Array.isArray(response.data) 
          ? response.data.filter(announcement => announcement.is_active === true)
          : [];
        setAnnouncements(activeOnly);
      } else {
        setFetchError(response?.error || "Failed to load announcements");
        toast.error("Failed to load announcements");
        setAnnouncements([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      const errorMsg = err.message || "Failed to fetch announcements";
      setFetchError(errorMsg);
      toast.error(errorMsg);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBureaus = async () => {
    try {
      const response = await pollsApi.getBureaus(access_token);
      if (response && response.success && response.data) {
        setBureaus(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch bureaus:", err);
    }
  };

  // Filter announcements based on search only
  const filteredAnnouncements = announcements.filter(announcement => {
    if (!announcement) return false;
    
    const matchesSearch = announcement.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Pagination
  const indexOfLastAnnouncement = currentPage * announcementsPerPage;
  const indexOfFirstAnnouncement = indexOfLastAnnouncement - announcementsPerPage;
  const currentAnnouncements = filteredAnnouncements.slice(indexOfFirstAnnouncement, indexOfLastAnnouncement);
  const totalPages = Math.ceil(filteredAnnouncements.length / announcementsPerPage);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touchedFields[name]) {
      validateField(name, value);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    
    const allFields = ["title", "content"];
    const newTouched = {};
    allFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouchedFields(prev => ({ ...prev, ...newTouched }));
    
    const isValid = await validateForm();
    if (!isValid) {
      toast.error("Please fix the form errors before submitting");
      return;
    }
    
    setSubmitting(true);
    setError("");
    setSuccess("");
    
    const toastId = toast.loading("Creating announcement...");

    try {
      const submitData = {
        title: formData.title,
        content: formData.content,
        target_role: formData.target_role
      };
      
      if (formData.bureau_id && formData.bureau_id !== "") {
        submitData.bureau_id = formData.bureau_id;
      }

      const response = await authApi.createGlobalAnnouncement(submitData, access_token);

      if (response && response.success) {
        toast.success("Announcement created successfully!", { id: toastId });
        setFormData({
          title: "",
          content: "",
          target_role: "all",
          bureau_id: ""
        });
        setFieldErrors({});
        setTouchedFields({});
        await fetchAnnouncements();
        setTimeout(() => {
          setShowCreateModal(false);
          setSuccess("");
        }, 1500);
      } else {
        const errorMsg = response?.error || "Failed to create announcement";
        toast.error(errorMsg, { id: toastId });
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to create announcement";
      toast.error(errorMsg, { id: toastId });
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setError("");
    setSuccess("");
    setFieldErrors({});
    setTouchedFields({});
    setFormData({
      title: "",
      content: "",
      target_role: "all",
      bureau_id: ""
    });
  };

  const handleEditClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowUpdateModal(true);
  };

  const handleUpdateAnnouncement = async (updatedData) => {
    setSubmitting(true);
    setError("");
    
    const toastId = toast.loading("Updating announcement...");

    try {
      const response = await authApi.updateGlobalAnnouncement(
        selectedAnnouncement.id,
        updatedData,
        access_token
      );

      if (response && response.success) {
        toast.success("Announcement updated successfully!", { id: toastId });
        await fetchAnnouncements();
        setTimeout(() => {
          setShowUpdateModal(false);
          setSelectedAnnouncement(null);
          setSuccess("");
        }, 1500);
      } else {
        const errorMsg = response?.error || "Failed to update announcement";
        toast.error(errorMsg, { id: toastId });
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to update announcement";
      toast.error(errorMsg, { id: toastId });
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowDeleteModal(true);
  };

  const handleDeleteAnnouncement = async () => {
    setSubmitting(true);
    setError("");
    
    const toastId = toast.loading("Deleting announcement...");

    try {
      const response = await authApi.deleteGlobalAnnouncement(selectedAnnouncement.id, access_token);

      if (response && response.success) {
        toast.success("Announcement deleted successfully!", { id: toastId });
        await fetchAnnouncements();
        setTimeout(() => {
          setShowDeleteModal(false);
          setSelectedAnnouncement(null);
          setSuccess("");
        }, 1500);
      } else {
        const errorMsg = response?.error || "Failed to delete announcement";
        toast.error(errorMsg, { id: toastId });
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to delete announcement";
      toast.error(errorMsg, { id: toastId });
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const getTargetRoleLabel = (targetRole) => {
    switch(targetRole) {
      case 'citizen': return 'Citizens';
      case 'admin': return 'Admins';
      case 'super_admin': return 'Super Admins';
      case 'moderator': return 'Moderators';
      default: return 'All Users';
    }
  };

  const getTargetRoleColor = (targetRole) => {
    switch(targetRole) {
      case 'citizen': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'super_admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'moderator': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getBureauName = (bureauId) => {
    if (!bureauId) return 'All Bureaus';
    const bureau = bureaus.find(b => b.id === bureauId);
    return bureau ? bureau.name : 'Unknown Bureau';
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Invalid Date";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400 dark:text-gray-500" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Create Button */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder="Search announcements by title or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
          />
        </div>
        
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-gray-900 hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Announcement
        </Button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-100 rounded-lg dark:bg-green-900/20 dark:border-green-800">
          <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
        </div>
      )}

      {/* Error Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg dark:bg-red-900/20 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {fetchError && (
        <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-800">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">{fetchError}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchAnnouncements}
            className="mt-2 dark:border-gray-600 dark:text-gray-300"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Announcements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentAnnouncements.length > 0 ? (
          currentAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Bell className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <CardTitle className="text-lg line-clamp-1 dark:text-white">{announcement.title}</CardTitle>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                      <Badge className={getTargetRoleColor(announcement.target_role)}>
                        <Eye className="h-3 w-3 mr-1" />
                        {getTargetRoleLabel(announcement.target_role)}
                      </Badge>
                      {announcement.bureau_id && (
                        <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                          <Building2 className="h-3 w-3 mr-1" />
                          {getBureauName(announcement.bureau_id)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* 3-Dot Dropdown Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 dark:text-gray-400">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
                      <DropdownMenuItem onClick={() => handleEditClick(announcement)} className="dark:text-gray-300 dark:hover:bg-gray-700">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Announcement
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteClick(announcement)}
                        className="text-red-600 focus:text-red-600 dark:text-red-400 dark:hover:bg-gray-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Announcement
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription className="line-clamp-3 mt-2 dark:text-gray-400">
                  {announcement.content}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="h-3 w-3" />
                  <span>Created: {formatDate(announcement.created_at)}</span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-lg font-medium">No active announcements found</p>
            <p className="text-sm mt-1">Click "Create Announcement" to add a new announcement</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {indexOfFirstAnnouncement + 1} to {Math.min(indexOfLastAnnouncement, filteredAnnouncements.length)} of {filteredAnnouncements.length} active announcements
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="dark:border-gray-600 dark:text-gray-300"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="dark:border-gray-600 dark:text-gray-300"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Create Announcement Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader className="relative">
            <DialogTitle className="dark:text-white">Create New Announcement</DialogTitle>
            <CardDescription className="dark:text-gray-400">
              Create a global announcement for citizens and admins
            </CardDescription>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleCloseCreateModal}
              className="absolute right-0 top-0 h-8 w-8 dark:text-gray-400 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <form onSubmit={handleCreateAnnouncement} className="space-y-4">
            <div className="space-y-4 py-2">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg dark:bg-red-900/20 dark:border-red-800">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Title Field */}
              <div className="space-y-2">
                <Label htmlFor="title" className="dark:text-gray-300">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter announcement title"
                  value={formData.title}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur('title')}
                  className={showError('title') ? 'border-red-500' : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white'}
                  required
                />
                {showError('title') && (
                  <p className="text-xs text-red-500">{fieldErrors.title}</p>
                )}
              </div>

              {/* Content Field */}
              <div className="space-y-2">
                <Label htmlFor="content" className="dark:text-gray-300">Content *</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Write announcement content here..."
                  value={formData.content}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur('content')}
                  rows={5}
                  className={showError('content') ? 'border-red-500' : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white'}
                  required
                />
                {showError('content') && (
                  <p className="text-xs text-red-500">{fieldErrors.content}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Target Role Field */}
                <div className="space-y-2">
                  <Label htmlFor="target_role" className="dark:text-gray-300">Target Audience</Label>
                  <select
                    id="target_role"
                    name="target_role"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={formData.target_role}
                    onChange={handleInputChange}
                  >
                    <option value="all">All Users</option>
                    <option value="citizen">Citizens</option>
                    <option value="admin">Admins</option>
                    <option value="super_admin">Super Admins</option>
                    <option value="moderator">Moderators</option>
                  </select>
                </div>

                {/* Bureau Field - Optional */}
                <div className="space-y-2">
                  <Label htmlFor="bureau_id" className="dark:text-gray-300">Specific Bureau (Optional)</Label>
                  <select
                    id="bureau_id"
                    name="bureau_id"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={formData.bureau_id}
                    onChange={handleInputChange}
                  >
                    <option value="">All Bureaus (Global)</option>
                    {bureaus.map((bureau) => (
                      <option key={bureau.id} value={bureau.id}>
                        {bureau.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Leave empty for global announcement</p>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  New announcements are automatically set as <strong>Active</strong> and will be visible to users immediately.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseCreateModal} className="dark:border-gray-600 dark:text-gray-300">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-gray-900 hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700">
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </span>
                ) : (
                  'Create Announcement'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Announcement Modal */}
      <UpdateAnnouncementModal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedAnnouncement(null);
          setError("");
        }}
        onSubmit={handleUpdateAnnouncement}
        announcement={selectedAnnouncement}
        submitting={submitting}
        error={error}
      />

      {/* Delete Announcement Modal */}
      <DeleteAnnouncementModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedAnnouncement(null);
          setError("");
        }}
        onConfirm={handleDeleteAnnouncement}
        announcement={selectedAnnouncement}
        submitting={submitting}
        error={error}
      />
    </div>
  );
}