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
import { Loader2, X } from "lucide-react";

// Validation schema for updating announcement
const updateAnnouncementSchema = yup.object({
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

export default function UpdateAnnouncementModal({
  isOpen,
  onClose,
  onSubmit,
  announcement,
  submitting,
  error: propError
}) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    target_role: "all"
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title || "",
        content: announcement.content || "",
        target_role: announcement.target_role || "all"
      });
      setFieldErrors({});
      setTouchedFields({});
      setError("");
    }
  }, [announcement]);

  // Validation functions
  const validateField = async (field, value) => {
    try {
      await updateAnnouncementSchema.validateAt(field, { [field]: value });
      setFieldErrors(prev => ({ ...prev, [field]: "" }));
      return true;
    } catch (err) {
      setFieldErrors(prev => ({ ...prev, [field]: err.message }));
      return false;
    }
  };

  const validateForm = async () => {
    try {
      await updateAnnouncementSchema.validate(formData, { abortEarly: false });
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
    const allFields = ["title", "content"];
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

  const roleOptions = [
    { value: "all", label: "All Users" },
    { value: "citizen", label: "Citizens" },
    { value: "admin", label: "Admins" },
    { value: "super_admin", label: "Super Admins" },
    { value: "moderator", label: "Moderators" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader className="relative">
          <DialogTitle className="dark:text-white">Update Announcement</DialogTitle>
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
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg dark:bg-red-900/20 dark:border-red-800">
                <p className="text-red-600 dark:text-red-400 text-sm">{error || propError}</p>
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
                className={`${showError('title') ? 'border-red-500' : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white'}`}
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
                className={`${showError('content') ? 'border-red-500' : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white'}`}
                required
              />
              {showError('content') && (
                <p className="text-xs text-red-500">{fieldErrors.content}</p>
              )}
            </div>

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
                {roleOptions.map(option => (
                  <option key={option.value} value={option.value} className="dark:text-gray-300">
                    {option.label}
                  </option>
                ))}
              </select>
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
                'Update Announcement'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}