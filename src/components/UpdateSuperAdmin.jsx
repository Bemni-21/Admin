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
import { Label } from "@/components/ui/label";
import { Loader2, Shield, X } from "lucide-react";

// Validation schema for updating super admin
const updateSuperAdminSchema = yup.object({
  name: yup
    .string()
    .required("Full name is required")
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be less than 100 characters"),
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format"),
});

export default function UpdateSuperAdmin({
  isOpen,
  onClose,
  onSubmit,
  superAdmin,
  submitting,
  error: propError
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: ""
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    if (superAdmin) {
      setFormData({
        name: superAdmin.name || "",
        email: superAdmin.email || ""
      });
      setFieldErrors({});
      setTouchedFields({});
      setError("");
    }
  }, [superAdmin]);

  // Validation functions
  const validateField = async (field, value) => {
    try {
      await updateSuperAdminSchema.validateAt(field, { [field]: value });
      setFieldErrors(prev => ({ ...prev, [field]: "" }));
      return true;
    } catch (err) {
      setFieldErrors(prev => ({ ...prev, [field]: err.message }));
      return false;
    }
  };

  const validateForm = async () => {
    try {
      await updateSuperAdminSchema.validate(formData, { abortEarly: false });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allFields = ["name", "email"];
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
      <DialogContent className="max-w-lg dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader className="relative">
          <DialogTitle className="flex items-center gap-2 dark:text-white">
            <Shield className="h-5 w-5 text-gray-600 dark:text-blue-400" />
            Update Super Admin
          </DialogTitle>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleClose}
            className="absolute right-0 top-0 h-8 w-8 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 py-2">
            {(error || propError) && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{error || propError}</p>
              </div>
            )}

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="dark:text-gray-300">Full Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
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
                placeholder="email@bureau.gov.et"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={() => handleFieldBlur('email')}
                className={showError('email') ? 'border-red-500 dark:border-red-500' : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white'}
                required
              />
              {showError('email') && (
                <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.email}</p>
              )}
            </div>

            {/* Role Info */}
            <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-700 dark:text-gray-300">
                <span className="font-medium">Role:</span> Super Admin (cannot be changed)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
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
                'Update Super Admin'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}