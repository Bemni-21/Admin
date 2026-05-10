import { useState, useEffect } from "react";
import * as yup from "yup";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Loader2, X } from "lucide-react";

// Validation schema for updating forum
const updateForumSchema = yup.object({
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

export default function UpdateForum({
  isOpen,
  onClose,
  onSubmit,
  forum,
  submitting,
  error: propError
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "folder",
    category: "general",
    is_restricted: false,
    allowed_roles: [],
    allowed_regions: [],
    allowed_work_types: [],
    status: "active"
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [error, setError] = useState("");

  // Initialize form with forum data when forum changes
  useEffect(() => {
    if (forum) {
      setFormData({
        name: forum.name || "",
        description: forum.description || "",
        icon: forum.icon || "folder",
        category: forum.category || "general",
        is_restricted: forum.is_restricted || false,
        allowed_roles: forum.allowed_roles || [],
        allowed_regions: forum.allowed_regions || [],
        allowed_work_types: forum.allowed_work_types || [],
        status: forum.status || "active"
      });
      setFieldErrors({});
      setTouchedFields({});
      setError("");
    }
  }, [forum]);

  // Validation functions
  const validateField = async (field, value) => {
    try {
      await updateForumSchema.validateAt(field, { [field]: value });
      setFieldErrors(prev => ({ ...prev, [field]: "" }));
      return true;
    } catch (err) {
      setFieldErrors(prev => ({ ...prev, [field]: err.message }));
      return false;
    }
  };

  const validateForm = async () => {
    try {
      await updateForumSchema.validate(formData, { abortEarly: false });
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

  const handleSubmit = async (e) => {
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
    
    onSubmit(formData);
  };

  const handleClose = () => {
    setFieldErrors({});
    setTouchedFields({});
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader className="relative">
          <DialogTitle className="dark:text-white">Update Forum</DialogTitle>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleClose}
            className="absolute right-0 top-0 h-8 w-8 dark:text-gray-400 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {(error || propError) && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg dark:bg-red-900/20 dark:border-red-800">
                <p className="text-red-600 dark:text-red-400 text-sm">{error || propError}</p>
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

              {/* Status Field */}
              <div className="col-span-2 space-y-2">
                <Label htmlFor="status" className="dark:text-gray-300">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                    <SelectItem value="active" className="dark:text-gray-300">Active</SelectItem>
                    <SelectItem value="inactive" className="dark:text-gray-300">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} className="dark:border-gray-600 dark:text-gray-300">
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
                  Updating...
                </span>
              ) : (
                'Update Forum'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}