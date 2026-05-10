import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  UserCog,
  Users,
  Shield,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  CheckCircle,
  XCircle,
  Building2,
  Briefcase,
  RefreshCw
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
  DialogFooter,
  DialogClose
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

export default function Agency() {
  const { access_token, user } = useAuthStore();
  const [staff, setStaff] = useState([]);
  const [bureaus, setBureaus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateAgencyHeadModal, setShowCreateAgencyHeadModal] = useState(false);
  const [showCreateStaffModal, setShowCreateStaffModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const staffPerPage = 6;

  // Form state for creating agency head
  const [agencyHeadForm, setAgencyHeadForm] = useState({
    email: "",
    password: "",
    name: "",
    bureauId: ""
  });

  // Form state for creating staff
  const [staffForm, setStaffForm] = useState({
    email: "",
    password: "",
    name: ""
  });

  // Form state for updating staff
  const [updateForm, setUpdateForm] = useState({
    name: "",
    role: ""
  });

  // Form state for status change
  const [statusForm, setStatusForm] = useState({
    status: ""
  });

  // Fetch staff and bureaus on component mount
  useEffect(() => {
    fetchStaff();
    fetchBureaus();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    setFetchError("");
    
    try {
      const response = await agencyApi.getStaff(access_token);
      
      if (response.success) {
        setStaff(response.data);
      } else {
        setFetchError("Failed to load staff");
      }
    } catch (err) {
      setFetchError(err.message || "Failed to fetch staff");
    } finally {
      setLoading(false);
    }
  };

  const fetchBureaus = async () => {
    try {
      const response = await pollsApi.getBureaus(access_token);
      if (response.success) {
        setBureaus(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch bureaus:", err);
    }
  };

  // Filter staff based on search and tab
  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "super_admin") return matchesSearch && member.role === "super_admin";
    if (activeTab === "admin") return matchesSearch && member.role === "admin";
    if (activeTab === "active") return matchesSearch && member.status === "active";
    if (activeTab === "inactive") return matchesSearch && member.status === "inactive";
    
    return matchesSearch;
  });

  // Pagination
  const indexOfLastStaff = currentPage * staffPerPage;
  const indexOfFirstStaff = indexOfLastStaff - staffPerPage;
  const currentStaff = filteredStaff.slice(indexOfFirstStaff, indexOfLastStaff);
  const totalPages = Math.ceil(filteredStaff.length / staffPerPage);

  // Handle create agency head
  const handleCreateAgencyHead = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    if (!agencyHeadForm.bureauId) {
      setError("Please select a bureau");
      setSubmitting(false);
      return;
    }

    try {
      const response = await agencyApi.createAgencyHead(agencyHeadForm, access_token);

      if (response.success) {
        setSuccess("Agency Head created successfully!");
        setAgencyHeadForm({
          email: "",
          password: "",
          name: "",
          bureauId: ""
        });
        await fetchStaff();
        setTimeout(() => {
          setShowCreateAgencyHeadModal(false);
          setSuccess("");
        }, 1500);
      } else {
        setError(response.error || "Failed to create agency head");
      }
    } catch (err) {
      setError(err.message || "Failed to create agency head");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle create staff
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await agencyApi.createStaff(staffForm, access_token);

      if (response.success) {
        setSuccess("Staff created successfully!");
        setStaffForm({
          email: "",
          password: "",
          name: ""
        });
        await fetchStaff();
        setTimeout(() => {
          setShowCreateStaffModal(false);
          setSuccess("");
        }, 1500);
      } else {
        setError(response.error || "Failed to create staff");
      }
    } catch (err) {
      setError(err.message || "Failed to create staff");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit staff
  const handleEditClick = (staffMember) => {
    setSelectedStaff(staffMember);
    setUpdateForm({
      name: staffMember.name || "",
      role: staffMember.role || "admin"
    });
    setShowUpdateModal(true);
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await agencyApi.updateStaff(selectedStaff.id, updateForm, access_token);

      if (response.success) {
        setSuccess("Staff updated successfully!");
        await fetchStaff();
        setTimeout(() => {
          setShowUpdateModal(false);
          setSelectedStaff(null);
          setSuccess("");
        }, 1500);
      } else {
        setError(response.error || "Failed to update staff");
      }
    } catch (err) {
      setError(err.message || "Failed to update staff");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle status change
  const handleStatusClick = (staffMember) => {
    setSelectedStaff(staffMember);
    setStatusForm({
      status: staffMember.status === "active" ? "inactive" : "active"
    });
    setShowStatusModal(true);
  };

  const handleUpdateStatus = async () => {
    setSubmitting(true);
    setError("");

    try {
      const response = await agencyApi.updateStaffStatus(
        selectedStaff.id,
        statusForm.status,
        access_token
      );

      if (response.success) {
        setSuccess(`Staff status updated to ${statusForm.status}`);
        await fetchStaff();
        setTimeout(() => {
          setShowStatusModal(false);
          setSelectedStaff(null);
          setSuccess("");
        }, 1500);
      } else {
        setError(response.error || "Failed to update status");
      }
    } catch (err) {
      setError(err.message || "Failed to update status");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete staff
  const handleDeleteClick = (staffMember) => {
    setSelectedStaff(staffMember);
    setShowDeleteModal(true);
  };

  const handleDeleteStaff = async () => {
    setSubmitting(true);
    setError("");

    try {
      const response = await agencyApi.deleteStaff(selectedStaff.id, access_token);

      if (response.success) {
        setSuccess("Staff deleted successfully!");
        await fetchStaff();
        setTimeout(() => {
          setShowDeleteModal(false);
          setSelectedStaff(null);
          setSuccess("");
        }, 1500);
      } else {
        setError(response.error || "Failed to delete staff");
      }
    } catch (err) {
      setError(err.message || "Failed to delete staff");
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch(role?.toLowerCase()) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">Loading staff...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search staff by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowCreateStaffModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Staff
          </Button>
          <Button 
            onClick={() => setShowCreateAgencyHeadModal(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Shield className="w-4 h-4 mr-2" />
            Create Agency Head
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {[
          { value: "all", label: "All Staff", icon: <Users className="h-4 w-4" /> },
          { value: "super_admin", label: "Super Admins", icon: <Shield className="h-4 w-4" /> },
          { value: "admin", label: "Admins", icon: <UserCog className="h-4 w-4" /> },
          { value: "active", label: "Active", icon: <CheckCircle className="h-4 w-4" /> },
          { value: "inactive", label: "Inactive", icon: <XCircle className="h-4 w-4" /> }
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
          <p className="text-green-600 text-sm">{success}</p>
        </div>
      )}

      {fetchError && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-red-600 text-sm">{fetchError}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchStaff}
            className="mt-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      )}

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentStaff.length > 0 ? (
          currentStaff.map((member) => (
            <Card key={member.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gray-200 text-gray-600 text-lg">
                        {member.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getRoleBadgeColor(member.role)}>
                          {member.role?.replace('_', ' ')}
                        </Badge>
                        <Badge className={getStatusBadgeColor(member.status)}>
                          {member.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditClick(member)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusClick(member)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {member.status === 'active' ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteClick(member)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Staff
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Email */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a href={`mailto:${member.email}`} className="hover:text-blue-600">
                    {member.email}
                  </a>
                </div>
                
                {/* Created Date */}
                {member.created_at && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Joined: {new Date(member.created_at).toLocaleDateString()}</span>
                  </div>
                )}
                
                {/* Last Login */}
                {member.last_login_at && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>Last login: {new Date(member.last_login_at).toLocaleString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">No staff found</p>
            <p className="text-sm mt-1">Click "Create Staff" or "Create Agency Head" to add users</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {indexOfFirstStaff + 1} to {Math.min(indexOfLastStaff, filteredStaff.length)} of {filteredStaff.length} staff
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Create Agency Head Modal */}
      <Dialog open={showCreateAgencyHeadModal} onOpenChange={setShowCreateAgencyHeadModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Agency Head</DialogTitle>
            <CardDescription>
              Creates a new super_admin user assigned to a specific bureau
            </CardDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAgencyHead}>
            <div className="space-y-4 py-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="agency_name">Full Name *</Label>
                <Input
                  id="agency_name"
                  name="name"
                  placeholder="Agency Director"
                  value={agencyHeadForm.name}
                  onChange={(e) => setAgencyHeadForm({...agencyHeadForm, name: e.target.value})}
                  required
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="agency_email">Email *</Label>
                <Input
                  id="agency_email"
                  name="email"
                  type="email"
                  placeholder="agency.head@bureau.gov.et"
                  value={agencyHeadForm.email}
                  onChange={(e) => setAgencyHeadForm({...agencyHeadForm, email: e.target.value})}
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="agency_password">Password *</Label>
                <Input
                  id="agency_password"
                  name="password"
                  type="password"
                  placeholder="SecurePassword123"
                  value={agencyHeadForm.password}
                  onChange={(e) => setAgencyHeadForm({...agencyHeadForm, password: e.target.value})}
                  required
                />
              </div>

              {/* Bureau Selection */}
              <div className="space-y-2">
                <Label htmlFor="bureauId">Select Bureau *</Label>
                <select
                  id="bureauId"
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={agencyHeadForm.bureauId}
                  onChange={(e) => setAgencyHeadForm({...agencyHeadForm, bureauId: e.target.value})}
                  required
                >
                  <option value="">Select a bureau...</option>
                  {bureaus.map((bureau) => (
                    <option key={bureau.id} value={bureau.id}>
                      {bureau.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={submitting} className="bg-purple-600 hover:bg-purple-700">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Agency Head'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Staff Modal */}
      <Dialog open={showCreateStaffModal} onOpenChange={setShowCreateStaffModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Staff Member</DialogTitle>
            <CardDescription>
              Creates a new admin user for your agency
            </CardDescription>
          </DialogHeader>

          <form onSubmit={handleCreateStaff}>
            <div className="space-y-4 py-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="staff_name">Full Name *</Label>
                <Input
                  id="staff_name"
                  name="name"
                  placeholder="Officer Name"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({...staffForm, name: e.target.value})}
                  required
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="staff_email">Email *</Label>
                <Input
                  id="staff_email"
                  name="email"
                  type="email"
                  placeholder="officer@agency.gov.et"
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({...staffForm, email: e.target.value})}
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="staff_password">Password *</Label>
                <Input
                  id="staff_password"
                  name="password"
                  type="password"
                  placeholder="SecurePassword123"
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({...staffForm, password: e.target.value})}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Staff'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Staff Modal */}
      <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Update Staff Details</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdateStaff}>
            <div className="space-y-4 py-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="update_name">Full Name</Label>
                <Input
                  id="update_name"
                  name="name"
                  placeholder="Full Name"
                  value={updateForm.name}
                  onChange={(e) => setUpdateForm({...updateForm, name: e.target.value})}
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={updateForm.role}
                  onChange={(e) => setUpdateForm({...updateForm, role: e.target.value})}
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={submitting} className="bg-gray-900 hover:bg-gray-800">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Staff'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Status Change Modal */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Staff Status</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to {statusForm.status === "active" ? "activate" : "deactivate"} 
              <span className="font-medium text-gray-900"> {selectedStaff?.name}</span>?
            </p>
            {selectedStaff?.status === "active" && (
              <p className="text-xs text-amber-600 mt-2">
                Deactivating will prevent this user from accessing the system.
              </p>
            )}
            {selectedStaff?.status === "inactive" && (
              <p className="text-xs text-green-600 mt-2">
                Activating will restore access to this user.
              </p>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              type="button" 
              disabled={submitting}
              className={statusForm.status === "active" ? "bg-green-600 hover:bg-green-700" : "bg-yellow-600 hover:bg-yellow-700"}
              onClick={handleUpdateStatus}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : `Yes, ${statusForm.status === "active" ? "Activate" : "Deactivate"}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Staff Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Staff Member
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <span className="font-medium text-gray-900">{selectedStaff?.name}</span>?
              This action cannot be undone.
            </p>
            {selectedStaff?.email === user?.email && (
              <p className="text-xs text-red-600 mt-2 font-medium">
                Warning: You are trying to delete your own account!
              </p>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              type="button" 
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteStaff}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete Staff'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}