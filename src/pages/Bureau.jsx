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
  Building2,
  Mail,
  Phone,
  MapPin,
  MoreVertical,
  X
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
import { useAuthStore } from "@/store/authStore";
import { pollsApi } from "@/services/Api";
import UpdateBureauModal from "@/components/UpdateBureauModal";
import DeleteBureauModal from "@/components/DeleteBureauModal";
import ImageUpload from "@/components/ImageUpload";

// Validation schema for creating bureau
const createBureauSchema = yup.object({
  name: yup
    .string()
    .required("Bureau name is required")
    .min(3, "Bureau name must be at least 3 characters")
    .max(100, "Bureau name must be less than 100 characters"),
  description: yup.string().max(500, "Description must be less than 500 characters"),
  contact_email: yup.string().email("Invalid email format"),
  phone: yup.string().matches(/^[\+\d\s\-\(\)]+$/, "Invalid phone number format"),
  address: yup.string().max(200, "Address must be less than 200 characters"),
});

export default function Bureau() {
  const { access_token } = useAuthStore();
  const [bureaus, setBureaus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBureau, setSelectedBureau] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  const bureausPerPage = 6;

  // Form state for creating bureau
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contact_email: "",
    phone: "",
    address: "",
    icon_url: ""
  });

  // Validation functions
  const validateField = async (field, value) => {
    try {
      await createBureauSchema.validateAt(field, { [field]: value });
      setFieldErrors(prev => ({ ...prev, [field]: "" }));
      return true;
    } catch (err) {
      setFieldErrors(prev => ({ ...prev, [field]: err.message }));
      return false;
    }
  };

  const validateForm = async () => {
    try {
      await createBureauSchema.validate(formData, { abortEarly: false });
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

  // Fetch bureaus on component mount
  useEffect(() => {
    fetchBureaus();
  }, []);

  const fetchBureaus = async () => {
    setLoading(true);
    setFetchError("");
    
    try {
      const response = await pollsApi.getBureaus(access_token);
      
      if (response.success) {
        setBureaus(response.data);
      } else {
        setFetchError("Failed to load bureaus");
        toast.error("Failed to load bureaus");
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to fetch bureaus";
      setFetchError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Filter bureaus based on search
  const filteredBureaus = bureaus.filter(bureau => 
    bureau.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bureau.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bureau.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bureau.phone?.includes(searchTerm) ||
    bureau.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastBureau = currentPage * bureausPerPage;
  const indexOfFirstBureau = indexOfLastBureau - bureausPerPage;
  const currentBureaus = filteredBureaus.slice(indexOfFirstBureau, indexOfLastBureau);
  const totalPages = Math.ceil(filteredBureaus.length / bureausPerPage);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touchedFields[name]) {
      validateField(name, value);
    }
  };

  const handleImageUpload = (url) => {
    setFormData(prev => ({ ...prev, icon_url: url }));
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, icon_url: "" }));
  };

  const handleCreateBureau = async (e) => {
    e.preventDefault();
    
    const allFields = ["name", "description", "contact_email", "phone", "address"];
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
    
    const toastId = toast.loading("Creating bureau...");

    try {
      const response = await pollsApi.createBureau(formData, access_token);

      if (response.success) {
        toast.success("Bureau created successfully!", { id: toastId });
        setFormData({
          name: "",
          description: "",
          contact_email: "",
          phone: "",
          address: "",
          icon_url: ""
        });
        setFieldErrors({});
        setTouchedFields({});
        await fetchBureaus();

        setTimeout(() => {
          setShowCreateModal(false);
          setSuccess("");
        }, 1500);
      } else {
        const errorMsg = response.error || "Failed to create bureau";
        toast.error(errorMsg, { id: toastId });
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to create bureau";
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
      contact_email: "",
      phone: "",
      address: "",
      icon_url: ""
    });
  };

  const handleEditClick = (bureau) => {
    setSelectedBureau(bureau);
    setShowUpdateModal(true);
    setError("");
  };

  const handleUpdateBureau = async (updatedData) => {
    setSubmitting(true);
    setError("");
    
    const toastId = toast.loading("Updating bureau...");

    try {
      const response = await pollsApi.updateBureau(selectedBureau.id, updatedData, access_token);

      if (response.success) {
        toast.success("Bureau updated successfully!", { id: toastId });
        await fetchBureaus();
        setTimeout(() => {
          setShowUpdateModal(false);
          setSelectedBureau(null);
          setSuccess("");
        }, 1500);
      } else {
        const errorMsg = response.error || "Failed to update bureau";
        toast.error(errorMsg, { id: toastId });
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to update bureau";
      toast.error(errorMsg, { id: toastId });
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (bureau) => {
    setSelectedBureau(bureau);
    setShowDeleteModal(true);
    setError("");
  };

  const handleConfirmDelete = async () => {
    setSubmitting(true);
    setError("");
    
    const toastId = toast.loading("Deleting bureau...");

    try {
      const response = await pollsApi.deleteBureau(selectedBureau.id, access_token);

      if (response.success) {
        toast.success("Bureau deleted successfully!", { id: toastId });
        await fetchBureaus();
        setTimeout(() => {
          setShowDeleteModal(false);
          setSelectedBureau(null);
          setSuccess("");
        }, 1500);
      } else {
        const errorMsg = response.error || "Failed to delete bureau";
        toast.error(errorMsg, { id: toastId });
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to delete bureau";
      toast.error(errorMsg, { id: toastId });
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400 dark:text-gray-500" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading bureaus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Sticky Header with Search and Create Button */}
      <div className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-900 pb-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="Search bureaus by name, email, phone, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
            />
          </div>
          
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gray-900 hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Bureau
          </Button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg dark:bg-red-900/20 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-lg dark:bg-green-900/20 dark:border-green-800">
            <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
          </div>
        )}

        {fetchError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg dark:bg-red-900/20 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400 text-sm">{fetchError}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchBureaus}
              className="mt-2 dark:border-gray-600 dark:text-gray-300"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Bureaus Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentBureaus.length > 0 ? (
            currentBureaus.map((bureau) => (
              <Card key={bureau.id} className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {/* Bureau Icon */}
                      {bureau.icon_url ? (
                        <img 
                          src={bureau.icon_url} 
                          alt={bureau.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/30">
                          <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg dark:text-white">{bureau.name}</CardTitle>
                        {bureau.description && (
                          <CardDescription className="text-sm mt-1 line-clamp-2 dark:text-gray-400">
                            {bureau.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    
                    {/* Admin Actions Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 dark:text-gray-400">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
                        <DropdownMenuItem onClick={() => handleEditClick(bureau)} className="dark:text-gray-300 dark:hover:bg-gray-700">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Bureau
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(bureau)}
                          className="text-red-600 focus:text-red-600 dark:text-red-400 dark:hover:bg-gray-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Bureau
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Contact Email */}
                  {bureau.contact_email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <a href={`mailto:${bureau.contact_email}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                        {bureau.contact_email}
                      </a>
                    </div>
                  )}
                  
                  {/* Phone */}
                  {bureau.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <a href={`tel:${bureau.phone}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                        {bureau.phone}
                      </a>
                    </div>
                  )}
                  
                  {/* Address */}
                  {bureau.address && (
                    <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                      <span>{bureau.address}</span>
                    </div>
                  )}
                  
                  {/* Created Date */}
                  <div className="pt-2 text-xs text-gray-400 border-t dark:border-gray-700 dark:text-gray-500">
                    Created: {new Date(bureau.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
              <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-lg font-medium">No bureaus found</p>
              <p className="text-sm mt-1">Click "Create Bureau" to add your first bureau</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 pb-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {indexOfFirstBureau + 1} to {Math.min(indexOfLastBureau, filteredBureaus.length)} of {filteredBureaus.length} bureaus
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
      </div>

      {/* Create Bureau Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader className="relative">
            <DialogTitle className="dark:text-white">Create New Bureau</DialogTitle>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleCloseCreateModal}
              className="absolute right-0 top-0 h-8 w-8 dark:text-gray-400 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <form onSubmit={handleCreateBureau}>
            <div className="space-y-4 py-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg dark:bg-red-900/20 dark:border-red-800">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Icon Upload */}
              <div className="space-y-2">
                <Label className="dark:text-gray-300">Bureau Icon (Optional)</Label>
                <ImageUpload
                  onImageUploaded={handleImageUpload}
                  currentImageUrl={formData.icon_url}
                  onRemove={handleRemoveImage}
                  bucket="icons"
                />
              </div>

              {/* Name Field - Required */}
              <div className="space-y-2">
                <Label htmlFor="name" className="dark:text-gray-300">Bureau Name *</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Ministry of Health"
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur('name')}
                    className={`pl-9 ${showError('name') ? 'border-red-500' : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white'}`}
                    required
                  />
                </div>
                {showError('name') && (
                  <p className="text-xs text-red-500">{fieldErrors.name}</p>
                )}
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the purpose of this bureau..."
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

              {/* Contact Email Field */}
              <div className="space-y-2">
                <Label htmlFor="contact_email" className="dark:text-gray-300">Contact Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="contact_email"
                    name="contact_email"
                    type="email"
                    placeholder="info@bureau.gov.et"
                    value={formData.contact_email}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur('contact_email')}
                    className={`pl-9 ${showError('contact_email') ? 'border-red-500' : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white'}`}
                  />
                </div>
                {showError('contact_email') && (
                  <p className="text-xs text-red-500">{fieldErrors.contact_email}</p>
                )}
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="dark:text-gray-300">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+251-11-123-4567"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur('phone')}
                    className={`pl-9 ${showError('phone') ? 'border-red-500' : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white'}`}
                  />
                </div>
                {showError('phone') && (
                  <p className="text-xs text-red-500">{fieldErrors.phone}</p>
                )}
              </div>

              {/* Address Field */}
              <div className="space-y-2">
                <Label htmlFor="address" className="dark:text-gray-300">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="address"
                    name="address"
                    placeholder="Addis Ababa, Ethiopia"
                    value={formData.address}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur('address')}
                    className={`pl-9 ${showError('address') ? 'border-red-500' : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white'}`}
                  />
                </div>
                {showError('address') && (
                  <p className="text-xs text-red-500">{fieldErrors.address}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseCreateModal} className="dark:border-gray-600 dark:text-gray-300">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitting}
                className="bg-gray-900 hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </span>
                ) : (
                  'Create Bureau'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Bureau Modal */}
      <UpdateBureauModal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedBureau(null);
          setError("");
        }}
        onSubmit={handleUpdateBureau}
        bureau={selectedBureau}
        submitting={submitting}
        error={error}
      />

      {/* Delete Bureau Modal */}
      <DeleteBureauModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedBureau(null);
          setError("");
        }}
        onConfirm={handleConfirmDelete}
        bureau={selectedBureau}
        submitting={submitting}
        error={error}
      />
    </div>
  );
}