import { useState, useEffect } from "react";
import * as yup from "yup";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, AlertTriangle, X } from "lucide-react";

// Validation schema for updating post
const updatePostSchema = yup.object({
  title: yup
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(255, "Title must be less than 255 characters"),
  content: yup
    .string()
    .min(10, "Content must be at least 10 characters")
    .max(5000, "Content must be less than 5000 characters"),
});

export default function UpdatePostModal({
  isOpen,
  onClose,
  onSubmit,
  post,
  submitting,
  error: propError
}) {
  const [formData, setFormData] = useState({
    title: "",
    content: ""
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [error, setError] = useState("");

  // Reset form when post changes
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || "",
        content: post.content || ""
      });
      setFieldErrors({});
      setTouchedFields({});
      setError("");
    }
  }, [post]);

  // Validation functions
  const validateField = async (field, value) => {
    try {
      await updatePostSchema.validateAt(field, { [field]: value });
      setFieldErrors(prev => ({ ...prev, [field]: "" }));
      return true;
    } catch (err) {
      setFieldErrors(prev => ({ ...prev, [field]: err.message }));
      return false;
    }
  };

  const validateForm = async () => {
    try {
      await updatePostSchema.validate(formData, { abortEarly: false });
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
    
    // Only send fields that have changed
    const updatedData = {};
    if (formData.title !== post?.title) updatedData.title = formData.title;
    if (formData.content !== post?.content) updatedData.content = formData.content;
    
    // Check if any fields were changed
    if (Object.keys(updatedData).length === 0) {
      toast.error("No changes made to update");
      return;
    }
    
    onSubmit(updatedData);
  };

  const hasChanges = formData.title !== post?.title || formData.content !== post?.content;

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
          <DialogTitle className="dark:text-white">Update Post</DialogTitle>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleClose}
            className="absolute right-0 top-0 h-8 w-8 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
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

            {/* Title Field */}
            <div className="space-y-2">
              <Label htmlFor="title" className="dark:text-gray-300">Post Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter a descriptive title"
                value={formData.title}
                onChange={handleInputChange}
                onBlur={() => handleFieldBlur('title')}
                maxLength={255}
                className={showError('title') ? 'border-red-500' : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white'}
              />
              {showError('title') && (
                <p className="text-xs text-red-500">{fieldErrors.title}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                {formData.title.length}/255
              </p>
            </div>

            {/* Content Field */}
            <div className="space-y-2">
              <Label htmlFor="content" className="dark:text-gray-300">Post Content</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Write your post content here..."
                value={formData.content}
                onChange={handleInputChange}
                onBlur={() => handleFieldBlur('content')}
                rows={8}
                className={showError('content') ? 'border-red-500' : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white'}
              />
              {showError('content') && (
                <p className="text-xs text-red-500">{fieldErrors.content}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                HTML is not allowed and will be escaped for security
              </p>
            </div>

            {/* Note about updates */}
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <span className="font-medium">Note:</span> Only the post author or admin can update this post.
                At least one field must be changed to update.
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
              disabled={submitting || !hasChanges}
              className="bg-gray-900 hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </span>
              ) : (
                'Update Post'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}