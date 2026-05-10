import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Globe,
  Lock,
  Hash,
  Folder,
  MessageSquare,
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
  CardFooter 
} from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { forumApi } from "@/services/Api";
import UpdateForum from "@/components/UpdateForum";
import DeleteForum from "@/components/DeleteForum";

// Validation schema for creating forum
const createForumSchema = yup.object({
  name: yup
    .string()
    .required("Forum name is required")
    .min(3, "Forum name must be at least 3 characters")
    .max(100, "Forum name must be less than 100 characters"),
  description: yup
    .string()
    .max(500, "Description must be less than 500 characters"),
  icon: yup.string(),
  category: yup.string().required("Category is required"),
});

export default function Forums() {
  const navigate = useNavigate();
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedForum, setSelectedForum] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  
  const { access_token } = useAuthStore();
  const forumsPerPage = 10;

  // Form state for creating forum
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "folder",
    category: "general",
    is_restricted: false,
    allowed_roles: [],
    allowed_regions: [],
    allowed_work_types: []
  });

  // Available options
  const iconOptions = [
    { value: "folder", label: "Folder" },
    { value: "globe", label: "Globe" },
    { value: "hash", label: "Hashtag" },
    { value: "lock", label: "Lock" },
    { value: "message-circle", label: "Message" },
    { value: "users", label: "Users" }
  ];

  const categoryOptions = [
    { value: "general", label: "General" },
    { value: "announcements", label: "Announcements" },
    { value: "support", label: "Support" },
    { value: "feedback", label: "Feedback" },
    { value: "discussions", label: "Discussions" }
  ];

  const roleOptions = [
    { value: "citizen", label: "Citizen" },
    { value: "moderator", label: "Moderator" },
    { value: "admin", label: "Admin" },
    { value: "super_admin", label: "Super Admin" }
  ];

  // Validation functions
  const validateField = async (field, value) => {
    try {
      await createForumSchema.validateAt(field, { [field]: value });
      setFieldErrors(prev => ({ ...prev, [field]: "" }));
      return true;
    } catch (err) {
      setFieldErrors(prev => ({ ...prev, [field]: err.message }));
      return false;
    }
  };

  const validateForm = async () => {
    try {
      await createForumSchema.validate(formData, { abortEarly: false });
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touchedFields[name]) {
      validateField(name, value);
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touchedFields[name]) {
      validateField(name, value);
    }
  };

  const handleMultiSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: prev[name].includes(value)
        ? prev[name].filter(item => item !== value)
        : [...prev[name], value]
    }));
  };

  // Fetch forums on component mount
  useEffect(() => {
    fetchForums();
  }, []);

  const fetchForums = async () => {
    setLoading(true);
    setFetchError("");
    
    try {
      const response = await forumApi.getForums(access_token);
      
      if (response.success && response.data) {
        setForums(response.data);
      } else {
        setFetchError("Failed to load forums");
        toast.error("Failed to load forums");
      }
    } catch (err) {
      const errorMessage = err.message || "Failed to fetch forums";
      setFetchError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle forum click to navigate to dashboard with forum ID
  const handleForumClick = (forumId) => {
    navigate(`/dashboard?tab=forums&forumId=${forumId}`);
  };

  // Handle edit button click
  const handleEditClick = (forum) => {
    setSelectedForum(forum);
    setShowUpdateModal(true);
  };

  // Handle delete button click
  const handleDeleteClick = (forum) => {
    setSelectedForum(forum);
    setShowDeleteModal(true);
  };

  // Handle update forum
  const handleUpdateForum = async (updatedData) => {
    setSubmitting(true);
    setError("");
    
    const toastId = toast.loading("Updating forum...");

    try {
      const response = await forumApi.updateForum(selectedForum.id, updatedData, access_token);
      
      if (response.success) {
        toast.success("Forum updated successfully!", { id: toastId });
        await fetchForums();
        setTimeout(() => {
          setShowUpdateModal(false);
          setSelectedForum(null);
          setSuccess("");
        }, 1500);
      } else {
        const errorMsg = response.error || "Failed to update forum";
        toast.error(errorMsg, { id: toastId });
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to update forum";
      toast.error(errorMsg, { id: toastId });
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete forum
  const handleDeleteForum = async () => {
    setSubmitting(true);
    setError("");
    
    const toastId = toast.loading("Deleting forum...");

    try {
      const response = await forumApi.deleteForum(selectedForum.id, access_token);
      
      if (response.success) {
        toast.success("Forum deleted successfully!", { id: toastId });
        await fetchForums();
        setTimeout(() => {
          setShowDeleteModal(false);
          setSelectedForum(null);
          setSuccess("");
        }, 1500);
      } else {
        const errorMsg = response.error || "Failed to delete forum";
        toast.error(errorMsg, { id: toastId });
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to delete forum";
      toast.error(errorMsg, { id: toastId });
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateForum = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allFields = ["name", "description", "icon", "category"];
    const newTouched = {};
    allFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouchedFields(prev => ({ ...prev, ...newTouched }));
    
    // Validate form
    const isValid = await validateForm();
    if (!isValid) {
      toast.error("Please fix the form errors before submitting");
      return;
    }
    
    setSubmitting(true);
    setError("");
    setSuccess("");
    
    const toastId = toast.loading("Creating forum...");

    try {
      const response = await forumApi.createForum(formData, access_token);
      
      if (response.success) {
        toast.success("Forum created successfully!", { id: toastId });
        setFormData({
          name: "",
          description: "",
          icon: "folder",
          category: "general",
          is_restricted: false,
          allowed_roles: [],
          allowed_regions: [],
          allowed_work_types: []
        });
        
        await fetchForums();
        
        setTimeout(() => {
          setShowCreateModal(false);
          setSuccess("");
          setFieldErrors({});
          setTouchedFields({});
        }, 1500);
      } else {
        const errorMsg = response.error || "Failed to create forum";
        toast.error(errorMsg, { id: toastId });
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to create forum";
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
      name: "",
      description: "",
      icon: "folder",
      category: "general",
      is_restricted: false,
      allowed_roles: [],
      allowed_regions: [],
      allowed_work_types: []
    });
  };

  const getIconComponent = (iconName) => {
    switch(iconName) {
      case 'globe': return <Globe className="h-4 w-4" />;
      case 'lock': return <Lock className="h-4 w-4" />;
      case 'hash': return <Hash className="h-4 w-4" />;
      default: return <Folder className="h-4 w-4" />;
    }
  };

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const showError = (field) => {
    return touchedFields[field] && fieldErrors[field];
  };

  // Filter forums based on search
  const filteredForums = forums.filter(forum => 
    forum.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    forum.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    forum.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const indexOfLastForum = currentPage * forumsPerPage;
  const indexOfFirstForum = indexOfLastForum - forumsPerPage;
  const currentForums = filteredForums.slice(indexOfFirstForum, indexOfLastForum);
  const totalPages = Math.ceil(filteredForums.length / forumsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400 dark:text-gray-500" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading forums...</p>
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
            placeholder="Search forums by name, description, or category..."
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
          Create Forum
        </Button>
      </div>

      {/* Error Message */}
      {fetchError && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg dark:bg-red-900/20 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 text-sm">{fetchError}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchForums}
            className="mt-2 dark:border-gray-600 dark:text-gray-300"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Forums Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentForums.length > 0 ? (
          currentForums.map((forum) => (
            <Card 
              key={forum.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer group dark:bg-gray-800 dark:border-gray-700"
              onClick={() => handleForumClick(forum.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:group-hover:bg-gray-600">
                      {getIconComponent(forum.icon)}
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-gray-900 transition-colors dark:text-white dark:group-hover:text-gray-200">
                        {forum.name}
                      </CardTitle>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{forum.category}</p>
                    </div>
                  </div>
                  
                  {/* Dropdown Menu - Top Right Corner */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 -mt-1 -mr-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(forum);
                        }}
                        className="dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Forum
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(forum);
                        }}
                        className="text-red-600 focus:text-red-600 dark:text-red-400 dark:hover:bg-gray-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Forum
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3 dark:text-gray-400">
                  {forum.description || "No description"}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  {forum.is_restricted && (
                    <span className="flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Restricted
                    </span>
                  )}
                  {forum.is_system && (
                    <span className="flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      System
                    </span>
                  )}
                </div>
                <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                  Created {new Date(forum.created_at).toLocaleDateString()}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 dark:border-gray-700">
                <div className="w-full flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {forum.post_count || 0} posts
                    </span>
                  </div>
                  {forum.status && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(forum.status)}`}>
                      {forum.status}
                    </span>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            No forums found
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {indexOfFirstForum + 1} to {Math.min(indexOfLastForum, filteredForums.length)} of {filteredForums.length} forums
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="dark:border-gray-600 dark:text-gray-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="dark:border-gray-600 dark:text-gray-300"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create Forum Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader className="relative">
            <DialogTitle className="dark:text-white">Create New Forum</DialogTitle>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleCloseCreateModal}
              className="absolute right-0 top-0 h-8 w-8 dark:text-gray-400 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          
          <form onSubmit={handleCreateForum}>
            <div className="space-y-4 py-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg dark:bg-red-900/20 dark:border-red-800">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}
              
              {success && (
                <div className="p-3 bg-green-50 border border-green-100 rounded-lg dark:bg-green-900/20 dark:border-green-800">
                  <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="dark:text-gray-300">Forum Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., General Discussion"
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur('name')}
                    className={showError('name') ? 'border-red-500' : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white'}
                    required
                  />
                  {showError('name') && (
                    <p className="text-xs text-red-500">{fieldErrors.name}</p>
                  )}
                </div>

                {/* Icon Field */}
                <div className="space-y-2">
                  <Label htmlFor="icon" className="dark:text-gray-300">Icon</Label>
                  <Select
                    value={formData.icon}
                    onValueChange={(value) => handleSelectChange("icon", value)}
                  >
                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <SelectValue placeholder="Select icon" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      {iconOptions.map(option => (
                        <SelectItem key={option.value} value={option.value} className="dark:text-gray-300">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Field */}
                <div className="space-y-2">
                  <Label htmlFor="category" className="dark:text-gray-300">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleSelectChange("category", value)}
                  >
                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      {categoryOptions.map(option => (
                        <SelectItem key={option.value} value={option.value} className="dark:text-gray-300">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {showError('category') && (
                    <p className="text-xs text-red-500">{fieldErrors.category}</p>
                  )}
                </div>

                {/* Description Field - Full width */}
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe the purpose of this forum..."
                    value={formData.description}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur('description')}
                    rows={3}
                    className={showError('description') ? 'border-red-500' : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white'}
                  />
                  {showError('description') && (
                    <p className="text-xs text-red-500">{fieldErrors.description}</p>
                  )}
                </div>

                {/* Restricted Toggle */}
                <div className="col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_restricted"
                    checked={formData.is_restricted}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      is_restricted: e.target.checked
                    }))}
                    className="w-4 h-4 rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                  <Label htmlFor="is_restricted" className="dark:text-gray-300">Restrict access to specific roles</Label>
                </div>

                {/* Allowed Roles - Show only if restricted */}
                {formData.is_restricted && (
                  <div className="col-span-2 space-y-2">
                    <Label className="dark:text-gray-300">Allowed Roles</Label>
                    <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg dark:border-gray-600 dark:bg-gray-700">
                      {roleOptions.map(role => (
                        <label key={role.value} className="flex items-center gap-2 dark:text-gray-300">
                          <input
                            type="checkbox"
                            value={role.value}
                            checked={formData.allowed_roles.includes(role.value)}
                            onChange={(e) => handleMultiSelectChange("allowed_roles", e.target.value)}
                            className="w-4 h-4 rounded dark:bg-gray-600"
                          />
                          <span className="text-sm">{role.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
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
                  'Create Forum'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Forum Modal */}
      <UpdateForum
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedForum(null);
          setError("");
        }}
        onSubmit={handleUpdateForum}
        forum={selectedForum}
        submitting={submitting}
        error={error}
      />

      {/* Delete Forum Modal */}
      <DeleteForum
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedForum(null);
          setError("");
        }}
        onConfirm={handleDeleteForum}
        forum={selectedForum}
        submitting={submitting}
        error={error}
      />
    </div>
  );
}