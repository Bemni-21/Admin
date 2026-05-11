import { useState, useEffect } from "react";
import * as yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
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
import { Loader2, Plus, Trash2, X } from "lucide-react";

// Validation schema for update poll
// Validation schema for update poll
const updatePollSchema = yup.object({
  title: yup
    .string()
    .required("Poll title is required")
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be less than 200 characters"),
  description: yup.string().max(1000, "Description must be less than 1000 characters"),
  start_date: yup
    .string()
    .required("Start date is required")
    .test("start-date-not-past", "Start date cannot be in the past", (value) => {
      if (!value) return true;
      return new Date(value) >= new Date();
    }),
  end_date: yup
    .string()
    .required("End date is required")
    .test("end-date", "End date must be after start date", (value, context) => {
      if (!value || !context.parent.start_date) return true;
      return new Date(value) > new Date(context.parent.start_date);
    })
    .test("end-date-not-past", "End date cannot be in the past", (value) => {
      if (!value) return true;
      return new Date(value) >= new Date();
    }),
  options: yup
    .array()
    .min(2, "Poll must have at least 2 options")
    .max(10, "Poll cannot have more than 10 options")
    .test("options-labels", "All options must have labels", (value) => {
      if (!value) return true;
      return value.every(opt => opt.label && opt.label.trim().length > 0);
    }),
});
// Color options for poll options
const COLOR_OPTIONS = [
  { value: "#3B82F6", label: "Blue" },
  { value: "#EF4444", label: "Red" },
  { value: "#10B981", label: "Green" },
  { value: "#F59E0B", label: "Orange" },
  { value: "#8B5CF6", label: "Purple" },
  { value: "#EC4899", label: "Pink" },
  { value: "#6B7280", label: "Gray" },
  { value: "#14B8A6", label: "Teal" }
];

// Region options
const REGION_OPTIONS = [
  { value: "addis_ababa", label: "Addis Ababa" },
  { value: "afar", label: "Afar" },
  { value: "amhara", label: "Amhara" },
  { value: "benishangul_gumuz", label: "Benishangul-Gumuz" },
  { value: "dire_dawa", label: "Dire Dawa" },
  { value: "gambela", label: "Gambela" },
  { value: "harari", label: "Harari" },
  { value: "oromia", label: "Oromia" },
  { value: "sidama", label: "Sidama" },
  { value: "somali", label: "Somali" },
  { value: "south_ethiopia", label: "South Ethiopia" },
  { value: "tigray", label: "Tigray" }
];

// Work type options
const WORK_TYPE_OPTIONS = [
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "agriculture", label: "Agriculture" },
  { value: "transportation", label: "Transportation" },
  { value: "technology", label: "Technology" },
  { value: "finance", label: "Finance" },
  { value: "government", label: "Government" },
  { value: "retail", label: "Retail" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "construction", label: "Construction" },
  { value: "other", label: "Other" }
];

export default function UpdatePollModal({
  isOpen,
  onClose,
  onSubmit,
  poll,
  submitting,
  error: propError
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    options: [],
    target_criteria: {
      regions: [],
      genders: [],
      work_types: []
    },
    start_date: "",
    end_date: "",
    status: "draft"
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [error, setError] = useState("");

  // Initialize form with poll data when poll changes
  useEffect(() => {
    if (poll) {
      setFormData({
        title: poll.title || "",
        description: poll.description || "",
        options: poll.options || [
          { label: "", color: "#3B82F6" },
          { label: "", color: "#EF4444" }
        ],
        target_criteria: poll.target_criteria || {
          regions: [],
          genders: [],
          work_types: []
        },
        start_date: poll.start_date ? poll.start_date.slice(0, 16) : "",
        end_date: poll.end_date ? poll.end_date.slice(0, 16) : "",
        status: poll.status || "draft"
      });
      setFieldErrors({});
      setTouchedFields({});
      setError("");
    }
  }, [poll]);

  // Validation functions
  const validateField = async (field, value) => {
    try {
      await updatePollSchema.validateAt(field, { [field]: value });
      setFieldErrors(prev => ({ ...prev, [field]: "" }));
      return true;
    } catch (err) {
      setFieldErrors(prev => ({ ...prev, [field]: err.message }));
      return false;
    }
  };

  const validateOptionsField = async () => {
    try {
      await updatePollSchema.validateAt('options', { options: formData.options });
      setFieldErrors(prev => ({ ...prev, options: "" }));
      return true;
    } catch (err) {
      setFieldErrors(prev => ({ ...prev, options: err.message }));
      return false;
    }
  };

  const validateForm = async () => {
    try {
      await updatePollSchema.validate(formData, { abortEarly: false });
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

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData(prev => ({ ...prev, options: newOptions }));
    if (touchedFields.options) {
      validateOptionsField();
    }
  };

  const addOption = () => {
    if (formData.options.length >= 10) {
      setError("Maximum 10 options allowed");
      return;
    }
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { label: "", color: "#6B7280" }]
    }));
  };

  const removeOption = (index) => {
    if (formData.options.length <= 2) {
      setError("Poll must have at least 2 options");
      return;
    }
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, options: newOptions }));
    validateOptionsField();
  };

  const handleTargetChange = (category, value) => {
    setFormData(prev => {
      const currentValues = prev.target_criteria[category] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return {
        ...prev,
        target_criteria: {
          ...prev.target_criteria,
          [category]: newValues
        }
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allFields = ["title", "description", "start_date", "end_date", "options"];
    const newTouched = {};
    allFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouchedFields(prev => ({ ...prev, ...newTouched }));
    
    // Validate form
    const isValid = await validateForm();
    if (!isValid) {
      return;
    }
    
    // Validate options
    if (formData.options.some(opt => !opt.label.trim())) {
      setError("All options must have a label");
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader className="relative">
          <DialogTitle className="dark:text-white">Update Poll</DialogTitle>
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
          {(error || propError) && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error || propError}</p>
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium dark:text-white">Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title" className="dark:text-gray-300">Poll Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Should we improve street lighting?"
                value={formData.title}
                onChange={handleInputChange}
                onBlur={() => handleFieldBlur('title')}
                className={showError('title') ? 'border-red-500 dark:border-red-500' : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white'}
                required
              />
              {showError('title') && (
                <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the purpose of this poll..."
                value={formData.description}
                onChange={handleInputChange}
                onBlur={() => handleFieldBlur('description')}
                rows={3}
                className={showError('description') ? 'border-red-500 dark:border-red-500' : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white'}
              />
              {showError('description') && (
                <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.description}</p>
              )}
            </div>
          </div>

          {/* Poll Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium dark:text-white">Poll Options</h3>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addOption}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Option
              </Button>
            </div>

            {showError('options') && (
              <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.options}</p>
            )}

            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option.label}
                      onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                  <Select
                    value={option.color}
                    onValueChange={(value) => handleOptionChange(index, 'color', value)}
                  >
                    <SelectTrigger className="w-32 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      {COLOR_OPTIONS.map(color => (
                        <SelectItem key={color.value} value={color.value} className="dark:text-gray-300 dark:focus:bg-gray-700">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color.value }} />
                            {color.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(index)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    disabled={formData.options.length <= 2}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium dark:text-white">Schedule</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date" className="dark:text-gray-300">Start Date *</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur('start_date')}
                  className={showError('start_date') ? 'border-red-500 dark:border-red-500' : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white'}
                  required
                />
                {showError('start_date') && (
                  <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.start_date}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date" className="dark:text-gray-300">End Date *</Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur('end_date')}
                  className={showError('end_date') ? 'border-red-500 dark:border-red-500' : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white'}
                  required
                />
                {showError('end_date') && (
                  <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.end_date}</p>
                )}
              </div>
            </div>
          </div>

          {/* Targeting */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium dark:text-white">Target Audience</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Leave empty for universal poll (everyone can vote)
            </p>

            <div className="space-y-4">
              <div>
                <Label className="dark:text-gray-300">Regions</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                  {REGION_OPTIONS.map(region => (
                    <label key={region.value} className="flex items-center gap-2 text-sm dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={formData.target_criteria.regions?.includes(region.value)}
                        onChange={() => handleTargetChange('regions', region.value)}
                        className="rounded dark:bg-gray-600 dark:border-gray-500"
                      />
                      {region.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label className="dark:text-gray-300">Genders</Label>
                <div className="flex gap-4 mt-2">
                  {['male', 'female'].map(gender => (
                    <label key={gender} className="flex items-center gap-2 text-sm dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={formData.target_criteria.genders?.includes(gender)}
                        onChange={() => handleTargetChange('genders', gender)}
                        className="rounded dark:bg-gray-600 dark:border-gray-500"
                      />
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label className="dark:text-gray-300">Work Types</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                  {WORK_TYPE_OPTIONS.map(work => (
                    <label key={work.value} className="flex items-center gap-2 text-sm dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={formData.target_criteria.work_types?.includes(work.value)}
                        onChange={() => handleTargetChange('work_types', work.value)}
                        className="rounded dark:bg-gray-600 dark:border-gray-500"
                      />
                      {work.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="dark:text-gray-300">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                <SelectItem value="draft" className="dark:text-gray-300 dark:focus:bg-gray-700">Draft</SelectItem>
                <SelectItem value="active" className="dark:text-gray-300 dark:focus:bg-gray-700">Active</SelectItem>
                <SelectItem value="closed" className="dark:text-gray-300 dark:focus:bg-gray-700">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitting} 
              className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </span>
              ) : (
                'Update Poll'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
