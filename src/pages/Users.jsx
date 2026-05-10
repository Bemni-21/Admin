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
  AlertCircle,
  Trash,
  CheckSquare,
  Square,
  MoreVertical,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/services/Api";
import UserModal from "@/components/UserModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import BulkDeleteModal from "@/components/BulkDeleteModal";

// Validation schema for create user
const createUserSchema = yup.object({
  fin: yup
    .string()
    .required("FIN number is required")
    .matches(/^\d+$/, "FIN must contain only numbers")
    .test("fin-length", "FIN must be exactly 12 digits", (value) => {
      if (!value) return true;
      return value.length === 12;
    }),
  name: yup
    .string()
    .required("Full name is required")
    .min(2, "Name must be at least 2 characters"),
  phone: yup
    .string()
    .required("Phone number is required")
    .test("ethiopian-phone", "Invalid Ethiopian phone number", (value) => {
      if (!value) return true;
      const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
      const patterns = [
        /^09\d{8}$/,
        /^\+2519\d{8}$/,
        /^2519\d{8}$/,
        /^9\d{8}$/
      ];
      return patterns.some(pattern => pattern.test(cleanPhone));
    }),
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .matches(/[A-Z]/, "Password must contain an uppercase letter")
    .matches(/[a-z]/, "Password must contain a lowercase letter")
    .matches(/[0-9]/, "Password must contain a number"),
  dob: yup
    .string()
    .required("Date of birth is required")
    .test("age", "User must be at least 18 years old", (value) => {
      if (!value) return true;
      const birthDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (birthDate > today) return false;
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 18;
    }),
  gender: yup.string().required("Gender is required"),
  role: yup.string().required("Role is required"),
});

// Validation schema for update user
const updateUserSchema = yup.object({
  name: yup
    .string()
    .required("Full name is required")
    .min(2, "Name must be at least 2 characters"),
  phone: yup
    .string()
    .required("Phone number is required")
    .test("ethiopian-phone", "Invalid Ethiopian phone number", (value) => {
      if (!value) return true;
      const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
      const patterns = [
        /^09\d{8}$/,
        /^\+2519\d{8}$/,
        /^2519\d{8}$/,
        /^9\d{8}$/
      ];
      return patterns.some(pattern => pattern.test(cleanPhone));
    }),
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format"),
  dob: yup
    .string()
    .required("Date of birth is required")
    .test("age", "User must be at least 18 years old", (value) => {
      if (!value) return true;
      const birthDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (birthDate > today) return false;
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 18;
    }),
  gender: yup.string().required("Gender is required"),
});

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    mode: "add",
    userId: null
  });
  const [deleteConfig, setDeleteConfig] = useState({
    isOpen: false,
    userData: null
  });
  const [bulkDeleteConfig, setBulkDeleteConfig] = useState({
    isOpen: false,
    selectedIds: [],
    selectedUsers: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  
  const { access_token } = useAuthStore();
  const usersPerPage = 8;

  // Form state
  const [formData, setFormData] = useState({
    fin: "",
    name: "",
    phone: "",
    password: "",
    email: "",
    dob: "",
    gender: "male",
    role: "citizen",
    status: "",
    last_login: "",
    created_at: ""
  });

  // Mark field as touched when user leaves
  const handleFieldBlur = async (field, mode) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    const value = formData[field];
    await validateField(field, value, mode);
  };

  // Validate a single field
  const validateField = async (field, value, mode) => {
    try {
      const schema = mode === "add" ? createUserSchema : updateUserSchema;
      await schema.validateAt(field, { [field]: value });
      setFieldErrors(prev => ({ ...prev, [field]: "" }));
      return true;
    } catch (err) {
      console.log(`Validation error for ${field}:`, err.message);
      setFieldErrors(prev => ({ ...prev, [field]: err.message }));
      return false;
    }
  };

  // Validate all fields
  const validateForm = async (mode) => {
    try {
      const schema = mode === "add" ? createUserSchema : updateUserSchema;
      await schema.validate(formData, { abortEarly: false });
      setFieldErrors({});
      return true;
    } catch (err) {
      const errors = {};
      err.inner.forEach(error => {
        errors[error.path] = error.message;
        setTouchedFields(prev => ({ ...prev, [error.path]: true }));
      });
      setFieldErrors(errors);
      return false;
    }
  };

  // Format phone number as user types
  const formatPhoneNumber = (value) => {
    if (value.startsWith('+')) {
      const digits = value.replace(/\D/g, '');
      if (digits.startsWith('251') && digits.length <= 12) {
        return '+' + digits;
      }
      return '+' + digits;
    }
    return value.replace(/\D/g, '');
  };

  const handleFieldChange = async (field, value, mode) => {
    let processedValue = value;
    if (field === 'phone') {
      processedValue = formatPhoneNumber(value);
    }
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    
    if (touchedFields[field]) {
      await validateField(field, processedValue, mode);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setFetchError("");
    
    try {
      const response = await authApi.getCitizens(access_token);
      
      if (response.success && response.data?.citizens) {
        const activeUsers = response.data.citizens.filter(citizen => !citizen.deleted_at);
        
        const transformedUsers = activeUsers.map(citizen => ({
          id: citizen.id,
          fin: citizen.fin || citizen.username,
          name: citizen.name,
          email: citizen.email,
          phone: citizen.phone_number,
          dob: citizen.dob,
          gender: citizen.gender,
          role: citizen.role || 'citizen',
          photo_url: citizen.photo_url,
          status: citizen.status,
          last_login: citizen.last_login_at,
          created_at: new Date(citizen.created_at).toLocaleDateString(),
          deleted_at: citizen.deleted_at
        }));
        
        setUsers(transformedUsers);
      } else {
        setFetchError("Failed to load users");
        toast.error("Failed to load users");
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to fetch users";
      setFetchError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single user details for update
  const fetchUserDetails = async (userId) => {
    try {
      const response = await authApi.getCitizenById(userId, access_token);
      
      if (response.success && response.data) {
        const citizen = response.data;
        setFormData({
          fin: citizen.fin || citizen.username,
          name: citizen.name || '',
          phone: citizen.phone_number || '',
          password: '',
          email: citizen.email || '',
          dob: citizen.dob || '',
          gender: citizen.gender || 'male',
          role: citizen.role || 'citizen',
          status: citizen.status || '',
          last_login: citizen.last_login_at ? new Date(citizen.last_login_at).toLocaleString() : 'N/A',
          created_at: citizen.created_at ? new Date(citizen.created_at).toLocaleDateString() : 'N/A'
        });
        setFieldErrors({});
        setTouchedFields({});
      }
    } catch (err) {
      setError(err.message || "Failed to fetch user details");
    }
  };

  // Handle add button click
  const handleAddClick = () => {
    setFormData({
      fin: "",
      name: "",
      phone: "",
      password: "",
      email: "",
      dob: "",
      gender: "male",
      role: "citizen",
      status: "",
      last_login: "",
      created_at: ""
    });
    setFieldErrors({});
    setTouchedFields({});
    setModalConfig({ isOpen: true, mode: "add", userId: null });
  };

  // Handle edit button click
  const handleEditClick = async (userId) => {
    setModalConfig({ isOpen: true, mode: "edit", userId });
    await fetchUserDetails(userId);
  };

  // Handle delete button click
  const handleDeleteClick = (user) => {
    setDeleteConfig({
      isOpen: true,
      userData: {
        id: user.id,
        name: user.name,
        email: user.email,
        fin: user.fin
      }
    });
  };

  // Handle confirm delete
  const handleConfirmDelete = async (reason) => {
    setSubmitting(true);
    setError("");

    try {
      const response = await authApi.deleteCitizen(
        deleteConfig.userData.id, 
        reason, 
        access_token
      );
      
      if (response.success) {
        await fetchUsers();
        setDeleteConfig({ isOpen: false, userData: null });
        toast.success("User deleted successfully");
      } else {
        setError(response.error || "Failed to delete user");
        toast.error(response.error || "Failed to delete user");
      }
      
    } catch (err) {
      setError(err.message || "Failed to delete user");
      toast.error(err.message || "Failed to delete user");
    } finally {
      setSubmitting(false);
    }
  };

  // Bulk Delete Handlers
  const handleSelectAll = () => {
    if (bulkDeleteConfig.selectedIds.length === currentUsers.length) {
      setBulkDeleteConfig({
        ...bulkDeleteConfig,
        selectedIds: [],
        selectedUsers: []
      });
    } else {
      const allIds = currentUsers.map(user => user.id);
      const allUsers = currentUsers.map(user => ({
        id: user.id,
        name: user.name,
        fin: user.fin
      }));
      setBulkDeleteConfig({
        ...bulkDeleteConfig,
        selectedIds: allIds,
        selectedUsers: allUsers
      });
    }
  };

  const handleSelectUser = (user) => {
    const isSelected = bulkDeleteConfig.selectedIds.includes(user.id);
    
    if (isSelected) {
      setBulkDeleteConfig({
        selectedIds: bulkDeleteConfig.selectedIds.filter(id => id !== user.id),
        selectedUsers: bulkDeleteConfig.selectedUsers.filter(u => u.id !== user.id)
      });
    } else {
      setBulkDeleteConfig({
        selectedIds: [...bulkDeleteConfig.selectedIds, user.id],
        selectedUsers: [...bulkDeleteConfig.selectedUsers, {
          id: user.id,
          name: user.name,
          fin: user.fin
        }]
      });
    }
  };

  const handleBulkDeleteClick = () => {
    if (bulkDeleteConfig.selectedIds.length === 0) {
      setError("Please select at least one user to delete");
      toast.error("Please select at least one user to delete");
      return;
    }
    setBulkDeleteConfig({
      ...bulkDeleteConfig,
      isOpen: true
    });
  };

  const handleConfirmBulkDelete = async (reason) => {
    setSubmitting(true);
    setError("");
    
    const toastId = toast.loading("Deleting selected users...");

    try {
      const response = await authApi.bulkDeleteCitizens(
        bulkDeleteConfig.selectedIds,
        reason,
        access_token
      );
      
      if (response.success) {
        toast.success(`${response.data.deletedCount} users deleted successfully!`, { id: toastId });
        await fetchUsers();
        setBulkDeleteConfig({
          isOpen: false,
          selectedIds: [],
          selectedUsers: []
        });
        setSuccess(`${response.data.deletedCount} users deleted successfully!`);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorMsg = response.error || "Failed to delete users";
        toast.error(errorMsg, { id: toastId });
        setError(errorMsg);
      }
      
    } catch (err) {
      const errorMsg = err.message || "Failed to delete users";
      toast.error(errorMsg, { id: toastId });
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseBulkDeleteModal = () => {
    setBulkDeleteConfig({
      ...bulkDeleteConfig,
      isOpen: false
    });
    setError("");
  };

  const { mode } = modalConfig;

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const allFields = mode === "add" 
      ? ["fin", "name", "phone", "email", "password", "dob", "gender", "role"]
      : ["name", "phone", "email", "dob", "gender"];
    
    const newTouched = {};
    allFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouchedFields(prev => ({ ...prev, ...newTouched }));
    
    const isValid = await validateForm(mode);
    if (!isValid) {
      toast.error("Please fix the form errors before submitting");
      return;
    }
    
    setSubmitting(true);
    setError("");
    setSuccess("");
    
    const toastId = toast.loading(mode === "add" ? "Creating user..." : "Updating user...");

    try {
      let response;
      
      if (mode === "add") {
        response = await authApi.createUser(formData, access_token);
      } else {
        const updateData = {
          name: formData.name,
          email: formData.email,
          phone_number: formData.phone,
          dob: formData.dob,
          gender: formData.gender,
        };
        response = await authApi.updateCitizen(modalConfig.userId, updateData, access_token);
      }
      
      if (response.success) {
        toast.success(mode === "add" ? "User created successfully!" : "User updated successfully!", { id: toastId });
        await fetchUsers();
        
        setTimeout(() => {
          setModalConfig({ isOpen: false, mode: "add", userId: null });
          setSuccess("");
          setFieldErrors({});
          setTouchedFields({});
        }, 1500);
      } else {
        const errorMsg = response.error || `Failed to ${mode} user`;
        toast.error(errorMsg, { id: toastId });
        setError(errorMsg);
      }
      
    } catch (err) {
      const errorMsg = err.message || `Failed to ${mode} user`;
      toast.error(errorMsg, { id: toastId });
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setModalConfig({ isOpen: false, mode: "add", userId: null });
    setError("");
    setSuccess("");
    setFieldErrors({});
    setTouchedFields({});
  };

  const handleCloseDeleteModal = () => {
    setDeleteConfig({ isOpen: false, userData: null });
    setError("");
  };

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fin?.includes(searchTerm) ||
    user.phone?.includes(searchTerm)
  );

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const getRoleBadgeColor = (role) => {
    switch(role?.toLowerCase()) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'moderator':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getGenderBadgeColor = (gender) => {
    return gender?.toLowerCase() === 'male' 
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
      : 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
  };

  const getStatusBadgeColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400 dark:text-gray-500" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Action Buttons - Right aligned */}
      <div className="flex justify-end">
        <div className="flex gap-2">
          {bulkDeleteConfig.selectedIds.length > 0 && (
            <Button 
              onClick={handleBulkDeleteClick}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
            >
              <Trash className="w-4 h-4 mr-2" />
              Delete Selected ({bulkDeleteConfig.selectedIds.length})
            </Button>
          )}
          
          <Button 
            onClick={handleAddClick}
            className="bg-gray-900 hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-3 md:p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="Search by name, email, FIN, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-3 md:p-4 bg-green-50 border border-green-100 rounded-lg dark:bg-green-900/20 dark:border-green-800">
          <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
        </div>
      )}

      {fetchError && (
        <div className="p-3 md:p-4 bg-red-50 border border-red-100 rounded-lg dark:bg-red-900/20 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 text-sm">{fetchError}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchUsers}
            className="mt-2 dark:border-gray-600 dark:text-gray-300"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Users Table - Mobile Responsive */}
      <Card className="dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
        <CardContent className="p-0">
          {/* Mobile View - Card Layout */}
          <div className="block md:hidden">
            {currentUsers.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentUsers.map((user) => (
                  <div key={user.id} className="p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          {user.photo_url ? (
                            <AvatarImage src={user.photo_url} />
                          ) : (
                            <AvatarFallback className="bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300 text-xs">
                              {user.name?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
                          <DropdownMenuItem onClick={() => handleEditClick(user.id)} className="dark:text-gray-300 text-sm">
                            <Edit className="h-3.5 w-3.5 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(user)} className="text-red-600 dark:text-red-400 text-sm">
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">FIN</p>
                        <p className="text-gray-900 dark:text-white font-mono">{user.fin}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Phone</p>
                        <p className="text-gray-900 dark:text-white">{user.phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">DOB</p>
                        <p className="text-gray-900 dark:text-white">{user.dob || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Gender</p>
                        <p className="text-gray-900 dark:text-white capitalize">{user.gender}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Role</p>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                          {user.role?.replace('_', ' ') || 'citizen'}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Status</p>
                        {user.status && (
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(user.status)}`}>
                            {user.status}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-400 dark:text-gray-500 pt-1">
                      Created: {user.created_at}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No users found</p>
              </div>
            )}
          </div>

          {/* Desktop View - Table Layout */}
          <div className="hidden md:block overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-12">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleSelectAll}
                          className="h-8 w-8"
                        >
                          {bulkDeleteConfig.selectedIds.length === currentUsers.length && currentUsers.length > 0 ? (
                            <CheckSquare className="h-4 w-4" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </Button>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">FIN</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email/Phone</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">DOB/Gender</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {currentUsers.length > 0 ? (
                      currentUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSelectUser(user)}
                              className="h-8 w-8"
                            >
                              {bulkDeleteConfig.selectedIds.includes(user.id) ? (
                                <CheckSquare className="h-4 w-4 text-red-600 dark:text-red-400" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </Button>
                           </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                {user.photo_url ? (
                                  <AvatarImage src={user.photo_url} />
                                ) : (
                                  <AvatarFallback className="bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300 text-xs">
                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                            </div>
                           </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-mono">{user.fin}</td>
                          <td className="px-4 py-3">
                            <div className="text-sm">
                              <div className="text-gray-900 dark:text-white">{user.email}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{user.phone}</div>
                            </div>
                           </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm">
                              <div className="text-gray-900 dark:text-white">{user.dob || 'N/A'}</div>
                              {user.gender && (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getGenderBadgeColor(user.gender)}`}>
                                  {user.gender}
                                </span>
                              )}
                            </div>
                           </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                              {user.role?.replace('_', ' ') || 'citizen'}
                            </span>
                           </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {user.status && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(user.status)}`}>
                                {user.status}
                              </span>
                            )}
                           </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{user.created_at}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                              onClick={() => handleEditClick(user.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              onClick={() => handleDeleteClick(user)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                           </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Pagination */}
        {totalPages > 1 && (
          <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
            <div className="text-xs text-gray-600 dark:text-gray-400 order-2 sm:order-1">
              Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="flex gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-8 px-3 dark:border-gray-600 dark:text-gray-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-8 px-3 dark:border-gray-600 dark:text-gray-300"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* User Modal (Add/Edit) */}
      <UserModal
        isOpen={modalConfig.isOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        submitting={submitting}
        error={error}
        success={success}
        mode={mode}
        fieldErrors={fieldErrors}
        touchedFields={touchedFields}
        handleFieldChange={handleFieldChange}
        handleFieldBlur={handleFieldBlur}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteConfig.isOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        userData={deleteConfig.userData}
        submitting={submitting}
        error={error}
      />

      {/* Bulk Delete Modal */}
      <BulkDeleteModal
        isOpen={bulkDeleteConfig.isOpen}
        onClose={handleCloseBulkDeleteModal}
        onConfirm={handleConfirmBulkDelete}
        selectedCount={bulkDeleteConfig.selectedIds.length}
        selectedUsers={bulkDeleteConfig.selectedUsers}
        submitting={submitting}
        error={error}
      />
    </div>
  );
}