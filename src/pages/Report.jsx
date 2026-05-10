import { useState, useEffect } from "react";
import {
  Flag,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Search,
  Eye,
  User,
  Calendar,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Shield,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Loader2,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/services/Api";

export default function Report() {
  const { access_token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await authApi.getReports(access_token);
      
      console.log("API Response:", response);
      
      let reportsData = [];
      
      if (response.success && response.data) {
        if (response.data.reports && Array.isArray(response.data.reports)) {
          reportsData = response.data.reports;
        }
        else if (Array.isArray(response.data)) {
          reportsData = response.data;
        }
      } 
      else if (Array.isArray(response)) {
        reportsData = response;
      }
      else if (response.reports && Array.isArray(response.reports)) {
        reportsData = response.reports;
      }
      
      console.log("Extracted reports:", reportsData);
      setReports(reportsData);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!resolutionNote.trim()) {
      alert("Please add resolution notes");
      return;
    }

    setSubmitting(true);
    try {
      const response = await authApi.resolveReport(
        selectedReport.id,
        { resolution: resolutionNote },
        access_token
      );
      
      if (response.success) {
        await fetchReports();
        setShowResolveDialog(false);
        setResolutionNote("");
        setSelectedReport(null);
      }
    } catch (error) {
      console.error("Failed to resolve report:", error);
      alert(error.message || "Failed to resolve report");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    setSubmitting(true);
    try {
      const response = await authApi.rejectReport(
        selectedReport.id,
        { reason: rejectReason },
        access_token
      );
      
      if (response.success) {
        await fetchReports();
        setShowRejectDialog(false);
        setRejectReason("");
        setSelectedReport(null);
      }
    } catch (error) {
      console.error("Failed to reject report:", error);
      alert(error.message || "Failed to reject report");
    } finally {
      setSubmitting(false);
    }
  };

  const openResolveDialog = (report) => {
    setSelectedReport(report);
    setResolutionNote("");
    setShowResolveDialog(true);
  };

  const openRejectDialog = (report) => {
    setSelectedReport(report);
    setRejectReason("");
    setShowRejectDialog(true);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
      case 'pending':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Open</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Resolved</Badge>;
      case 'rejected':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Rejected</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">In Progress</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">{status || 'Unknown'}</Badge>;
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'spam':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'harassment':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'inappropriate':
        return <ThumbsDown className="h-4 w-4 text-purple-500" />;
      case 'bug':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Flag className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type?.toLowerCase()) {
      case 'spam':
        return 'Spam';
      case 'harassment':
        return 'Harassment';
      case 'inappropriate':
        return 'Inappropriate Content';
      case 'bug':
        return 'Bug Report';
      default:
        return type || 'Other';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const filteredReports = Array.isArray(reports) ? reports.filter(report => {
    const matchesSearch = searchTerm === "" || 
      report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reporter_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.item_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  }) : [];

  const stats = {
    total: Array.isArray(reports) ? reports.length : 0,
    open: Array.isArray(reports) ? reports.filter(r => r.status === "pending" || r.status === "open").length : 0,
    resolved: Array.isArray(reports) ? reports.filter(r => r.status === "resolved").length : 0,
    rejected: Array.isArray(reports) ? reports.filter(r => r.status === "rejected").length : 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header - No title, only refresh button */}
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={fetchReports}
          className="gap-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Total Reports</p>
                <p className="text-xl md:text-2xl font-bold mt-1 text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="p-2 rounded-full bg-blue-500">
                <Flag className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Open</p>
                <p className="text-xl md:text-2xl font-bold mt-1 text-red-600">{stats.open}</p>
              </div>
              <div className="p-2 rounded-full bg-red-500">
                <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Resolved</p>
                <p className="text-xl md:text-2xl font-bold mt-1 text-green-600">{stats.resolved}</p>
              </div>
              <div className="p-2 rounded-full bg-green-500">
                <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Rejected</p>
                <p className="text-xl md:text-2xl font-bold mt-1 text-gray-600 dark:text-gray-400">{stats.rejected}</p>
              </div>
              <div className="p-2 rounded-full bg-gray-500">
                <XCircle className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar Only - No Filters */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-3 md:p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by description, reporter, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Reports List - Responsive Cards */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl dark:text-white">
            <Flag className="h-5 w-5" />
            User Reports
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            Review and manage reports from users
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <Flag className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No reports found</p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow dark:border-gray-700"
                >
                  {/* Header - Responsive */}
                  <div 
                    className="p-3 md:p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    onClick={() => toggleExpand(report.id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            {getTypeIcon(report.reason)}
                            <span className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                              {getTypeLabel(report.reason)}
                            </span>
                          </div>
                          {getStatusBadge(report.status)}
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base mb-1">
                          {report.item_title || "Reported Content"}
                        </h3>
                        
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {report.description}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-2 text-xs text-gray-400 dark:text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{report.reporter_name || "Anonymous"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(report.created_at)}</span>
                          </div>
                          {report.item_type && (
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              <span>{report.item_type}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 self-end sm:self-start">
                        {report.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openResolveDialog(report);
                              }}
                              className="gap-1 bg-green-600 hover:bg-green-700 text-xs md:text-sm"
                            >
                              <Check className="h-3 w-3" />
                              <span className="hidden sm:inline">Resolve</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openRejectDialog(report);
                              }}
                              className="gap-1 text-xs md:text-sm dark:border-gray-600 dark:text-gray-300"
                            >
                              <X className="h-3 w-3" />
                              <span className="hidden sm:inline">Reject</span>
                            </Button>
                          </div>
                        )}
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 dark:text-gray-400">
                          {expandedId === report.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content - Responsive */}
                  {expandedId === report.id && (
                    <div className="p-3 md:p-4 border-t bg-gray-50 dark:bg-gray-800/50">
                      <div className="space-y-4">
                        {/* Full Description */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Full Description
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                            {report.description}
                          </p>
                        </div>

                        {/* Reporter Info - Responsive Grid */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Reporter Information
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">
                                {report.reporter_name || "Anonymous"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">
                                ID: {report.user_id?.slice(0, 8)}...
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Reported Item Info */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Reported Item
                          </h4>
                          <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border dark:border-gray-700">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Type:</span> {report.item_type}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              <span className="font-medium">ID:</span> {report.item_id?.slice(0, 8)}...
                            </p>
                            {report.item_title && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <span className="font-medium">Title:</span> {report.item_title}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Resolution Info */}
                        {report.resolution && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Resolution Notes
                            </h4>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                              <p className="text-sm text-green-700 dark:text-green-400">
                                {report.resolution}
                              </p>
                              {report.resolved_at && (
                                <p className="text-xs text-green-600 dark:text-green-500 mt-2">
                                  Resolved on {new Date(report.resolved_at).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Metadata - Responsive */}
                        <div className="flex flex-wrap gap-3 md:gap-4 pt-2 text-xs text-gray-400 border-t dark:border-gray-700">
                          <div>
                            <span className="font-medium">Report ID:</span> {report.id?.slice(0, 8)}...
                          </div>
                          <div>
                            <span className="font-medium">Submitted:</span> {new Date(report.created_at).toLocaleString()}
                          </div>
                          {report.resolved_at && (
                            <div>
                              <span className="font-medium">Resolved:</span> {new Date(report.resolved_at).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resolve Dialog - Responsive */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent className="sm:max-w-lg w-[95%] rounded-lg dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg dark:text-white">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Resolve Report
            </DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              {selectedReport?.item_title || "Report"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-400">
                <span className="font-medium">Report from:</span> {selectedReport?.reporter_name || "Anonymous"}
              </p>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                {selectedReport?.description}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resolution" className="dark:text-gray-300">Resolution Notes</Label>
              <Textarea
                id="resolution"
                placeholder="Describe how this report was resolved..."
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                rows={4}
                className="resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowResolveDialog(false)} className="w-full sm:w-auto dark:border-gray-600 dark:text-gray-300">
              Cancel
            </Button>
            <Button onClick={handleResolve} disabled={submitting} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Resolving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Resolve Report
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog - Responsive */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-lg w-[95%] rounded-lg dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg dark:text-white">
              <XCircle className="h-5 w-5 text-red-600" />
              Reject Report
            </DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              {selectedReport?.item_title || "Report"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                <span className="font-medium">Report from:</span> {selectedReport?.reporter_name || "Anonymous"}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                {selectedReport?.description}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rejectionReason" className="dark:text-gray-300">Rejection Reason</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Why is this report being rejected?"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} className="w-full sm:w-auto dark:border-gray-600 dark:text-gray-300">
              Cancel
            </Button>
            <Button onClick={handleReject} disabled={submitting} variant="destructive" className="w-full sm:w-auto">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Reject Report
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}