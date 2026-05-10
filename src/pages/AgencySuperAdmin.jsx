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
  Shield,
  Mail,
  Calendar,
  Building2,
  RefreshCw,
  X,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/authStore";
import { agencyApi, pollsApi } from "@/services/Api";
import UpdateSuperAdmin from "@/components/UpdateSuperAdmin";
import DeleteSuperAdmin from "@/components/DeleteSuperAdmin";

// Validation schema for creating super admin
const createSuperAdminSchema = yup.object({
  name: yup
    .string()
    .required("Full name is required")
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be less than 100 characters"),
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number"),
  bureauId: yup.string().required("Please select a bureau"),
});

export default function AgencySuperAdmin() {
  const { access_token, user } = useAuthStore();
  const [superAdmins, setSuperAdmins] = useState([]);
  const [bureaus, setBureaus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  const superAdminsPerPage = 6;

  // Form state for creating agency head
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    bureauId: ""
  });

  // Validation functions
  const validateField = async (field, value) => {
    try {
      await createSuperAdminSchema.validateAt(field, { [field]: value });
      setFieldErrors(prev => ({ ...prev, [field]: "" }));
      return true;
    } catch (err) {
      setFieldErrors(prev => ({ ...prev, [field]: err.message }));
      return false;
    }
  };

  const validateForm = async () => {
    try {
      await createSuperAdminSchema.validate(formData, { abortEarly: false });
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

  // Fetch super admins and bureaus on component mount
  useEffect(() => {
    fetchSuperAdmins();
    fetchBureaus();
  }, []);

  const fetchSuperAdmins = async () => {
    setLoading(true);
    setFetchError("");
    
    try {
      const response = await agencyApi.getAdmin(access_token);
      
      if (response.success && Array.isArray(response.data)) {
        const allSuperAdmins = [];
        
        response.data.forEach(item => {
          const bureauName = item.bureau?.name || "Unknown Bureau";
          const bureauId = item.bureau?.id;
          
          if (item.superadmins && Array.isArray(item.superadmins)) {
            item.superadmins.forEach(superadmin => {
              allSuperAdmins.push({
                ...superadmin,
                bureau_name: bureauName,
                bureau_id: bureauId
              });
            });
          }
        });
        
        setSuperAdmins(allSuperAdmins);
      } else {
        setFetchError(response.error || "Failed to load super admins");
        toast.error("Failed to load super admins");
      }
    } catch (err) {
      console.error("Error fetching super admins:", err);
      const errorMsg = err.message || "Failed to fetch super admins";
      setFetchError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchBureaus = async () => {
    try {
      const response = await pollsApi.getBureaus(access_token);
      if (response.success && response.data) {
        setBureaus(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch bureaus:", err);
      toast.error("Failed to fetch bureaus");
    }
  };

  // Filter super admins based on search
  const filteredSuperAdmins = superAdmins.filter(admin => 
    admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.bureau_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastAdmin = currentPage * superAdminsPerPage;
  const indexOfFirstAdmin = indexOfLastAdmin - superAdminsPerPage;
  const currentSuperAdmins = filteredSuperAdmins.slice(indexOfFirstAdmin, indexOfLastAdmin);
  const totalPages = Math.ceil(filteredSuperAdmins.length / superAdminsPerPage);

  // Handle create super admin
  const handleCreateSuperAdmin = async (e) => {
    e.preventDefault();
    
    const allFields = ["name", "email", "password", "bureauId"];
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
    
    const toastId = toast.loading("Creating super admin...");

    try {
      const response = await agencyApi.createAgencyHead(formData, access_token);

      if (response.success) {
        toast.success("Super Admin created successfully!", { id: toastId });
        setFormData({
          email: "",
          password: "",
          name: "",
          bureauId: ""
        });
        setFieldErrors({});
        setTouchedFields({});
        await fetchSuperAdmins();
        setTimeout(() => {
          setShowCreateModal(false);
          setSuccess("");
        }, 1500);
      } else {
        const errorMsg = response.error || "Failed to create super admin";
        toast.error(errorMsg, { id: toastId });
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to create super admin";
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
      email: "",
      password: "",
      name: "",
      bureauId: ""
    });
  };

  // Handle update super admin
  const handleUpdateSuperAdmin = async (updatedData) => {
    setSubmitting(true);
    setError("");
    
    const toastId = toast.loading("Updating super admin...");

    try {
      const response = await agencyApi.updateBureauSuperAdmin(
        selectedAdmin.bureau_id,
        selectedAdmin.id,
        updatedData,
        access_token
      );

      if (response.success) {
        toast.success("Super Admin updated successfully!", { id: toastId });
        await fetchSuperAdmins();
        setTimeout(() => {
          setShowUpdateModal(false);
          setSelectedAdmin(null);
          setSuccess("");
        }, 1500);
      } else {
        const errorMsg = response.error || "Failed to update super admin";
        toast.error(errorMsg, { id: toastId });
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to update super admin";
      toast.error(errorMsg, { id: toastId });
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete super admin
  const handleDeleteSuperAdmin = async () => {
    setSubmitting(true);
    setError("");
    
    const toastId = toast.loading("Deleting super admin...");

    try {
      const response = await agencyApi.deleteBureauSuperAdmin(
        selectedAdmin.bureau_id,
        selectedAdmin.id,
        access_token
      );

      if (response.success) {
        toast.success("Super Admin deleted successfully!", { id: toastId });
        await fetchSuperAdmins();
        setTimeout(() => {
          setShowDeleteModal(false);
          setSelectedAdmin(null);
          setSuccess("");
        }, 1500);
      } else {
        const errorMsg = response.error || "Failed to delete super admin";
        toast.error(errorMsg, { id: toastId });
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to delete super admin";
      toast.error(errorMsg, { id: toastId });
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400 dark:text-gray-500" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading super admins...</p>
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
            placeholder="Search super admins by name, email, or bureau..."
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
          Create Super Admin
        </Button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg dark:bg-red-900/20 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-100 rounded-lg dark:bg-green-900/20 dark:border-green-800">
          <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
        </div>
      )}

      {fetchError && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg dark:bg-red-900/20 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 text-sm">{fetchError}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchSuperAdmins}
            className="mt-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Super Admins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentSuperAdmins.length > 0 ? (
          currentSuperAdmins.map((admin) => (
            <Card key={admin.id} className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 bg-gray-100 dark:bg-gray-700">
                      <AvatarFallback className="bg-gray-100 text-gray-700 text-lg font-semibold dark:bg-gray-700 dark:text-gray-300">
                        {admin.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg dark:text-white">{admin.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          <Shield className="h-3 w-3 mr-1" />
                          Super Admin
                        </Badge>
                        <Badge className={getStatusBadgeColor(admin.status)}>
                          {admin.status || 'active'}
                        </Badge>
                      </div>
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
                      <DropdownMenuItem 
                        onClick={() => {
                          setSelectedAdmin(admin);
                          setShowUpdateModal(true);
                        }}
                        className="dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          setSelectedAdmin(admin);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 focus:text-red-600 dark:text-red-400 dark:hover:bg-gray-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Email */}
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <a href={`mailto:${admin.email}`} className="hover:text-gray-700 dark:hover:text-gray-300">
                    {admin.email}
                  </a>
                </div>
                
                {/* Bureau */}
                {admin.bureau_name && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Building2 className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <span className="font-medium">{admin.bureau_name}</span>
                  </div>
                )}
                
                {/* Created Date */}
                {admin.created_at && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <span>Joined: {new Date(admin.created_at).toLocaleDateString()}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4 dark:border-gray-700">
                <div className="text-xs text-gray-400 dark:text-gray-500 w-full">
                  Last login: {admin.last_login_at ? new Date(admin.last_login_at).toLocaleString() : 'Never'}
                </div>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            <Shield className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-lg font-medium">No super admins found</p>
            <p className="text-sm mt-1">Click "Create Super Admin" to add agency heads</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {indexOfFirstAdmin + 1} to {Math.min(indexOfLastAdmin, filteredSuperAdmins.length)} of {filteredSuperAdmins.length} super admins
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Create Super Admin Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader className="relative">
            <DialogTitle className="dark:text-white">Create Super Admin</DialogTitle>
            <CardDescription className="dark:text-gray-400">
              Creates a new agency head with super_admin privileges assigned to a specific bureau
            </CardDescription>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleCloseCreateModal}
              className="absolute right-0 top-0 h-8 w-8 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <form onSubmit={handleCreateSuperAdmin} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="dark:text-gray-300">Full Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Agency Director"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                onBlur={() => handleFieldBlur('name')}
                className={showError('name') ? 'border-red-500 dark:border-red-500' : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white'}
                required
              />
              {showError('name') && (
                <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-gray-300">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="agency.head@bureau.gov.et"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                onBlur={() => handleFieldBlur('email')}
                className={showError('email') ? 'border-red-500 dark:border-red-500' : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white'}
                required
              />
              {showError('email') && (
                <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="dark:text-gray-300">Password *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="SecurePassword123"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                onBlur={() => handleFieldBlur('password')}
                className={showError('password') ? 'border-red-500 dark:border-red-500' : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white'}
                required
              />
              {showError('password') && (
                <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.password}</p>
              )}
              {!showError('password') && (
                <p className="text-xs text-gray-400 dark:text-gray-500">Min 6 chars, 1 uppercase, 1 lowercase, 1 number</p>
              )}
            </div>

            {/* Bureau Selection */}
            <div className="space-y-2">
              <Label htmlFor="bureauId" className="dark:text-gray-300">Select Bureau *</Label>
              <select
                id="bureauId"
                className={`w-full h-10 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  showError('bureauId') ? 'border-red-500 dark:border-red-500' : 'border-gray-200 dark:border-gray-600'
                }`}
                value={formData.bureauId}
                onChange={(e) => setFormData({...formData, bureauId: e.target.value})}
                onBlur={() => handleFieldBlur('bureauId')}
                required
              >
                <option value="">Select a bureau...</option>
                {bureaus.map((bureau) => (
                  <option key={bureau.id} value={bureau.id}>
                    {bureau.name}
                  </option>
                ))}
              </select>
              {showError('bureauId') && (
                <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.bureauId}</p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseCreateModal} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-gray-900 hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700">
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </span>
                ) : (
                  'Create'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Super Admin Modal */}
      <UpdateSuperAdmin
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedAdmin(null);
          setError("");
        }}
        onSubmit={handleUpdateSuperAdmin}
        superAdmin={selectedAdmin}
        submitting={submitting}
        error={error}
      />

      {/* Delete Super Admin Modal */}
      <DeleteSuperAdmin
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedAdmin(null);
          setError("");
        }}
        onConfirm={handleDeleteSuperAdmin}
        superAdmin={selectedAdmin}
        submitting={submitting}
        error={error}
      />
    </div>
  );
}