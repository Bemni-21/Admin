import { useState, useEffect } from "react";
import * as yup from "yup";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  BarChart3,
  Users,
  Calendar,
  Target,
  CheckCircle,
  AlertCircle,
  Trash2,
  Edit,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/authStore";
import { pollsApi } from "@/services/Api";
import UpdatePollModal from "@/components/UpdatePollModal";
import DeletePollModal from "@/components/DeletePollModal";

// Validation schema for creating poll
const createPollSchema = yup.object({
  title: yup
    .string()
    .required("Poll title is required")
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be less than 200 characters"),
  description: yup.string().max(1000, "Description must be less than 1000 characters"),
  start_date: yup
    .string()
    .required("Start date is required")
    .test("start-date", "Start date cannot be in the past", (value) => {
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

export default function Polls() {
  const { access_token } = useAuthStore();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [pollResults, setPollResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  
  // Edit/Delete states
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPollForEdit, setSelectedPollForEdit] = useState(null);
  const [updateSubmitting, setUpdateSubmitting] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const pollsPerPage = 6;

  // Form state for creating poll
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    options: [
      { label: "", color: "#3B82F6" },
      { label: "", color: "#EF4444" }
    ],
    target_criteria: {
      regions: [],
      genders: [],
      work_types: []
    },
    start_date: "",
    end_date: "",
    status: "draft"
  });

  // Validation functions
  const validateField = async (field, value) => {
    try {
      await createPollSchema.validateAt(field, { [field]: value });
      setFieldErrors(prev => ({ ...prev, [field]: "" }));
      return true;
    } catch (err) {
      setFieldErrors(prev => ({ ...prev, [field]: err.message }));
      return false;
    }
  };

  const validateOptionsField = async () => {
    try {
      await createPollSchema.validateAt('options', { options: formData.options });
      setFieldErrors(prev => ({ ...prev, options: "" }));
      return true;
    } catch (err) {
      setFieldErrors(prev => ({ ...prev, options: err.message }));
      return false;
    }
  };

  const validateForm = async () => {
    try {
      await createPollSchema.validate(formData, { abortEarly: false });
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

  // Fetch polls on component mount
  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    setLoading(true);
    setFetchError("");

    try {
      const response = await pollsApi.getPolls(access_token);

      if (response.success) {
        setPolls(response.data);
      } else {
        setFetchError("Failed to load polls");
        toast.error("Failed to load polls");
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to fetch polls";
      setFetchError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchPollResults = async (pollId) => {
    setSelectedPoll(pollId);
    try {
      const response = await pollsApi.getPollResults(pollId, access_token);
      if (response.success) {
        setPollResults(response.data);
        setShowResultsModal(true);
      } else {
        toast.error(response.error || "Failed to fetch results");
      }
    } catch (err) {
      toast.error(err.message || "Failed to fetch results");
    }
  };

  // Filter polls based on search and tab
  const filteredPolls = polls.filter(poll => {
    const matchesSearch = poll.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         poll.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "active") return matchesSearch && poll.status === "active";
    if (activeTab === "draft") return matchesSearch && poll.status === "draft";
    if (activeTab === "closed") return matchesSearch && poll.status === "closed";
    
    return matchesSearch;
  });

  // Pagination
  const indexOfLastPoll = currentPage * pollsPerPage;
  const indexOfFirstPoll = indexOfLastPoll - pollsPerPage;
  const currentPolls = filteredPolls.slice(indexOfFirstPoll, indexOfLastPoll);
  const totalPages = Math.ceil(filteredPolls.length / pollsPerPage);

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
      toast.error("Maximum 10 options allowed");
      return;
    }
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { label: "", color: "#6B7280" }]
    }));
  };

  const removeOption = (index) => {
    if (formData.options.length <= 2) {
      toast.error("Poll must have at least 2 options");
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

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    
    const allFields = ["title", "description", "start_date", "end_date", "options"];
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
    
    const toastId = toast.loading("Creating poll...");

    try {
      const response = await pollsApi.createPoll(formData, access_token);

      if (response.success) {
        toast.success("Poll created successfully!", { id: toastId });
        setFormData({
          title: "",
          description: "",
          options: [
            { label: "", color: "#3B82F6" },
            { label: "", color: "#EF4444" }
          ],
          target_criteria: {
            regions: [],
            genders: [],
            work_types: []
          },
          start_date: "",
          end_date: "",
          status: "draft"
        });

        await fetchPolls();

        setTimeout(() => {
          setShowCreateModal(false);
          setSuccess("");
          setFieldErrors({});
          setTouchedFields({});
        }, 1500);
      } else {
        const errorMsg = response.error || "Failed to create poll";
        toast.error(errorMsg, { id: toastId });
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to create poll";
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
      title: "",
      description: "",
      options: [
        { label: "", color: "#3B82F6" },
        { label: "", color: "#EF4444" }
      ],
      target_criteria: {
        regions: [],
        genders: [],
        work_types: []
      },
      start_date: "",
      end_date: "",
      status: "draft"
    });
  };

  const handleCloseResultsModal = () => {
    setShowResultsModal(false);
    setSelectedPoll(null);
    setPollResults(null);
  };

  const handleEditClick = (poll) => {
    setSelectedPollForEdit(poll);
    setShowUpdateModal(true);
    setUpdateError("");
  };

  const handleUpdatePoll = async (updatedData) => {
    setUpdateSubmitting(true);
    setUpdateError("");
    
    const toastId = toast.loading("Updating poll...");

    try {
      const response = await pollsApi.updatePoll(selectedPollForEdit.id, updatedData, access_token);

      if (response.success) {
        toast.success("Poll updated successfully!", { id: toastId });
        setSuccess("Poll updated successfully!");
        await fetchPolls();
        setTimeout(() => {
          setShowUpdateModal(false);
          setSelectedPollForEdit(null);
          setSuccess("");
        }, 1500);
      } else {
        const errorMsg = response.error || "Failed to update poll";
        toast.error(errorMsg, { id: toastId });
        setUpdateError(errorMsg);
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to update poll";
      toast.error(errorMsg, { id: toastId });
      setUpdateError(errorMsg);
    } finally {
      setUpdateSubmitting(false);
    }
  };

  const handleDeleteClick = (poll) => {
    setSelectedPollForEdit(poll);
    setShowDeleteModal(true);
    setDeleteError("");
  };

  const handleConfirmDelete = async () => {
    setDeleteSubmitting(true);
    setDeleteError("");
    
    const toastId = toast.loading("Deleting poll...");

    try {
      const response = await pollsApi.deletePoll(selectedPollForEdit.id, access_token);

      if (response.success) {
        toast.success("Poll deleted successfully!", { id: toastId });
        setSuccess("Poll deleted successfully!");
        await fetchPolls();
        setTimeout(() => {
          setShowDeleteModal(false);
          setSelectedPollForEdit(null);
          setSuccess("");
        }, 1500);
      } else {
        const errorMsg = response.error || "Failed to delete poll";
        toast.error(errorMsg, { id: toastId });
        setDeleteError(errorMsg);
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to delete poll";
      toast.error(errorMsg, { id: toastId });
      setDeleteError(errorMsg);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Draft</Badge>;
      case 'closed':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Closed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400 dark:text-gray-500" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading polls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder="Search polls..."
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
          Create Poll
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="dark:bg-gray-800">
          <TabsTrigger value="all" className="dark:data-[state=active]:bg-gray-700 dark:text-gray-300">All Polls</TabsTrigger>
          <TabsTrigger value="active" className="dark:data-[state=active]:bg-gray-700 dark:text-gray-300">Active</TabsTrigger>
          <TabsTrigger value="draft" className="dark:data-[state=active]:bg-gray-700 dark:text-gray-300">Draft</TabsTrigger>
          <TabsTrigger value="closed" className="dark:data-[state=active]:bg-gray-700 dark:text-gray-300">Closed</TabsTrigger>
        </TabsList>
      </Tabs>

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
            onClick={fetchPolls}
            className="mt-2 dark:border-gray-600 dark:text-gray-300"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Polls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentPolls.length > 0 ? (
          currentPolls.map((poll) => (
            <Card key={poll.id} className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg dark:text-white">{poll.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(poll.status)}
                    
                    {/* Admin Actions Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 dark:text-gray-400">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
                        <DropdownMenuItem onClick={() => handleEditClick(poll)} className="dark:text-gray-300 dark:hover:bg-gray-700">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Poll
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(poll)}
                          className="text-red-600 focus:text-red-600 dark:text-red-400 dark:hover:bg-gray-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Poll
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <CardDescription className="line-clamp-2 mt-1 dark:text-gray-400">
                  {poll.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Dates */}
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(poll.start_date).toLocaleDateString()} - {new Date(poll.end_date).toLocaleDateString()}
                  </span>
                </div>

                {/* Targeting Info */}
                {poll.is_targeted && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Target className="h-3 w-3" />
                    <span>Targeted Poll</span>
                  </div>
                )}

                {/* Vote Count */}
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Users className="h-3 w-3" />
                  <span>{poll.vote_count || 0} votes</span>
                </div>

                {/* Preview of options */}
                <div className="space-y-1 mt-2">
                  {poll.options.slice(0, 3).map((option, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: option.color }}
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-400">{option.label}</span>
                    </div>
                  ))}
                  {poll.options.length > 3 && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      +{poll.options.length - 3} more options
                    </span>
                  )}
                </div>

                {poll.has_voted && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 mt-2 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {poll.vote_count} votes
                  </Badge>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4 dark:border-gray-700">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchPollResults(poll.id)}
                  className="w-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Results
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            No polls found
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {indexOfFirstPoll + 1} to {Math.min(indexOfLastPoll, filteredPolls.length)} of {filteredPolls.length} polls
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

      {/* Create Poll Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader className="relative">
            <DialogTitle className="dark:text-white">Create New Poll</DialogTitle>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleCloseCreateModal}
              className="absolute right-0 top-0 h-8 w-8 dark:text-gray-400 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <form onSubmit={handleCreatePoll} className="space-y-6">
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
                  className={showError('title') ? 'border-red-500' : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white'}
                  required
                />
                {showError('title') && (
                  <p className="text-xs text-red-500">{fieldErrors.title}</p>
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
                  className={showError('description') ? 'border-red-500' : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white'}
                />
                {showError('description') && (
                  <p className="text-xs text-red-500">{fieldErrors.description}</p>
                )}
              </div>
            </div>

            {/* Poll Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium dark:text-white">Poll Options</h3>
                <Button type="button" variant="outline" size="sm" onClick={addOption} className="dark:border-gray-600 dark:text-gray-300">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Option
                </Button>
              </div>

              {showError('options') && (
                <p className="text-xs text-red-500">{fieldErrors.options}</p>
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
                          <SelectItem key={color.value} value={color.value} className="dark:text-gray-300">
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
                      className="text-red-600 hover:text-red-700 dark:text-red-400"
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
                    className={showError('start_date') ? 'border-red-500' : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white'}
                    required
                  />
                  {showError('start_date') && (
                    <p className="text-xs text-red-500">{fieldErrors.start_date}</p>
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
                    className={showError('end_date') ? 'border-red-500' : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white'}
                    required
                  />
                  {showError('end_date') && (
                    <p className="text-xs text-red-500">{fieldErrors.end_date}</p>
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
                  <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto p-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700">
                    {REGION_OPTIONS.map(region => (
                      <label key={region.value} className="flex items-center gap-2 text-sm dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={formData.target_criteria.regions.includes(region.value)}
                          onChange={() => handleTargetChange('regions', region.value)}
                          className="rounded dark:bg-gray-600"
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
                          checked={formData.target_criteria.genders.includes(gender)}
                          onChange={() => handleTargetChange('genders', gender)}
                          className="rounded dark:bg-gray-600"
                        />
                        {gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="dark:text-gray-300">Work Types</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto p-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700">
                    {WORK_TYPE_OPTIONS.map(work => (
                      <label key={work.value} className="flex items-center gap-2 text-sm dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={formData.target_criteria.work_types.includes(work.value)}
                          onChange={() => handleTargetChange('work_types', work.value)}
                          className="rounded dark:bg-gray-600"
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
              <Label htmlFor="status" className="dark:text-gray-300">Initial Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectItem value="draft" className="dark:text-gray-300">Draft</SelectItem>
                  <SelectItem value="active" className="dark:text-gray-300">Active</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Draft polls are not visible to citizens
              </p>
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
                  'Create Poll'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Results Modal */}
      <Dialog open={showResultsModal} onOpenChange={setShowResultsModal}>
        <DialogContent className="max-w-2xl dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader className="relative">
            <DialogTitle className="dark:text-white">Poll Results</DialogTitle>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleCloseResultsModal}
              className="absolute right-0 top-0 h-8 w-8 dark:text-gray-400 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <div className="py-4">
            {pollResults && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-lg dark:text-white">{pollResults.poll_id}</h3>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {pollResults.total_votes} total votes
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {pollResults.options.map((option) => (
                    <div key={option.index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2 dark:text-gray-300">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: option.color }} />
                          {option.label}
                        </span>
                        <span className="font-medium dark:text-gray-300">
                          {option.count} votes ({option.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div
                          className="h-2.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${option.percentage}%`,
                            backgroundColor: option.color
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Poll status: <Badge className={
                    pollResults.poll_status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    pollResults.poll_status === 'closed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }>{pollResults.poll_status}</Badge>
                  {pollResults.voting_open ? ' • Voting is open' : ' • Voting is closed'}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseResultsModal} className="dark:border-gray-600 dark:text-gray-300">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Poll Modal */}
      <UpdatePollModal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedPollForEdit(null);
          setUpdateError("");
        }}
        onSubmit={handleUpdatePoll}
        poll={selectedPollForEdit}
        submitting={updateSubmitting}
        error={updateError}
      />

      {/* Delete Poll Modal */}
      <DeletePollModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedPollForEdit(null);
          setDeleteError("");
        }}
        onConfirm={handleConfirmDelete}
        poll={selectedPollForEdit}
        submitting={deleteSubmitting}
        error={deleteError}
      />
    </div>
  );
}
