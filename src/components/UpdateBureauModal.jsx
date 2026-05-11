import { useState, useEffect } from "react";
import * as yup from "yup";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Building2, Mail, Phone, MapPin, X } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

// Validation schema for updating bureau
const updateBureauSchema = yup.object({
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

export default function UpdateBureauModal({
  isOpen,
  onClose,
  onSubmit,
  bureau,
  submitting,
  error: propError
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contact_email: "",
    phone: "",
    address: "",
    icon_url: ""
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [error, setError] = useState("");

  // Initialize form with bureau data when bureau changes
  useEffect(() => {
    if (bureau) {
      setFormData({
        name: bureau.name || "",
        description: bureau.description || "",
        contact_email: bureau.contact_email || "",
        phone: bureau.phone || "",
        address: bureau.address || "",
        icon_url: bureau.icon_url || ""
      });
      setFieldErrors({});
      setTouchedFields({});
      setError("");
    }
  }, [bureau]);

  // Validation functions
  const validateField = async (field, value) => {
    try {
      await updateBureauSchema.validateAt(field, { [field]: value });
      setFieldErrors(prev => ({ ...prev, [field]: "" }));
      return true;
    } catch (err) {
      setFieldErrors(prev => ({ ...prev, [field]: err.message }));
      return false;
    }
  };

  const validateForm = async () => {
    try {
      await updateBureauSchema.validate(formData, { abortEarly: false });
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

  const handleImageUpload = (url) => {
    setFormData(prev => ({ ...prev, icon_url: url }));
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, icon_url: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allFields = ["name", "description", "contact_email", "phone", "address"];
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader className="relative">
          <DialogTitle className="dark:text-white">Update Bureau</DialogTitle>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleClose}
            className="absolute right-0 top-0 h-8 w-8 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4 py-2">
            {(error || propError) && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg dark:bg-red-900/20 dark:border-red-800">
                <p className="text-red-600 dark:text-red-400 text-sm">{error || propError}</p>
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
                'Update Bureau'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
