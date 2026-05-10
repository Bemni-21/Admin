import { useState, useEffect } from "react";
import {
  Lightbulb,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  RefreshCw,
  Search,
  User,
  Calendar,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  Reply,
  X,
  Loader2,
  Building2 
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
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/services/Api";

export default function Suggestion() {
  const { access_token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const response = await authApi.getSuggestions(access_token);
      
      console.log("API Response:", response);
      
      let suggestionsData = [];
      
      if (response.success && response.data) {
        if (response.data.suggestions && Array.isArray(response.data.suggestions)) {
          suggestionsData = response.data.suggestions;
        }
        else if (Array.isArray(response.data)) {
          suggestionsData = response.data;
        }
      } 
      else if (Array.isArray(response)) {
        suggestionsData = response;
      }
      else if (response.suggestions && Array.isArray(response.suggestions)) {
        suggestionsData = response.suggestions;
      }
      
      console.log("Extracted suggestions:", suggestionsData);
      setSuggestions(suggestionsData);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!responseText.trim()) {
      alert("Please enter a response");
      return;
    }

    setSubmitting(true);
    try {
      const response = await authApi.respondToSuggestion(
        selectedSuggestion.id,
        { response: responseText },
        access_token
      );
      
      if (response.success) {
        await fetchSuggestions();
        setShowResponseDialog(false);
        setResponseText("");
        setSelectedSuggestion(null);
      }
    } catch (error) {
      console.error("Failed to respond:", error);
      alert(error.message || "Failed to send response");
    } finally {
      setSubmitting(false);
    }
  };

  const openResponseDialog = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setResponseText("");
    setShowResponseDialog(true);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'submitted':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>;
      case 'responded':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Responded</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Resolved</Badge>;
      case 'in_review':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">In Review</Badge>;
      case 'implemented':
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Implemented</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">{status || 'Unknown'}</Badge>;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'feature':
        return <Lightbulb className="h-4 w-4" />;
      case 'improvement':
        return <CheckCircle className="h-4 w-4" />;
      case 'bug':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
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

  const filteredSuggestions = Array.isArray(suggestions) ? suggestions.filter(suggestion => {
    const matchesSearch = searchTerm === "" || 
      suggestion.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      suggestion.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      suggestion.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  }) : [];

  const stats = {
    total: Array.isArray(suggestions) ? suggestions.length : 0,
    pending: Array.isArray(suggestions) ? suggestions.filter(s => s.status === "pending" || s.status === "submitted").length : 0,
    responded: Array.isArray(suggestions) ? suggestions.filter(s => s.status === "responded" || s.status === "resolved").length : 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading suggestions...</p>
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
          onClick={fetchSuggestions}
          className="gap-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards - Dark mode compatible */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Suggestions</p>
                <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="p-2 rounded-full bg-blue-500">
                <Lightbulb className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending Response</p>
                <p className="text-2xl font-bold mt-1 text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
              </div>
              <div className="p-2 rounded-full bg-yellow-500">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Responded</p>
                <p className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">{stats.responded}</p>
              </div>
              <div className="p-2 rounded-full bg-green-500">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar Only - No Filters */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by subject, content, or citizen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Suggestions List - Dark mode compatible */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <MessageSquare className="h-5 w-5" />
            Citizen Suggestions
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            Review and respond to suggestions from citizens
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSuggestions.length === 0 ? (
            <div className="text-center py-12">
              <Lightbulb className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No suggestions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow dark:border-gray-700"
                >
                  {/* Header */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    onClick={() => toggleExpand(suggestion.id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            {getCategoryIcon(suggestion.category)}
                            <span className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                              {suggestion.category || "General"}
                            </span>
                          </div>
                          {getStatusBadge(suggestion.status)}
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base mb-1">
                          {suggestion.subject}
                        </h3>
                        
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {suggestion.content}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-2 text-xs text-gray-400 dark:text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{suggestion.user_name || suggestion.user_fin || "Anonymous"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(suggestion.created_at)}</span>
                          </div>
                          {suggestion.bureau_name && (
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              <span>{suggestion.bureau_name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 self-end sm:self-start">
                        {(suggestion.status === "pending" || suggestion.status === "submitted") && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openResponseDialog(suggestion);
                            }}
                            className="gap-1 bg-blue-600 hover:bg-blue-700 text-xs md:text-sm"
                          >
                            <Reply className="h-3 w-3" />
                            <span className="hidden sm:inline">Respond</span>
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 dark:text-gray-400">
                          {expandedId === suggestion.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content - No ID displayed */}
                  {expandedId === suggestion.id && (
                    <div className="p-4 border-t bg-gray-50 dark:bg-gray-800/50">
                      <div className="space-y-4">
                        {/* Full Message */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Full Message
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                            {suggestion.content}
                          </p>
                        </div>

                        {/* User Info */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            User Information
                          </h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">
                                {suggestion.user_name || "N/A"}
                              </span>
                            </div>
                            {suggestion.user_fin && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400">
                                  FIN: {suggestion.user_fin}
                                </span>
                              </div>
                            )}
                            {suggestion.bureau_name && (
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400">
                                  Bureau: {suggestion.bureau_name}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Response Section */}
                        {suggestion.response && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Admin Response
                            </h4>
                            <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border dark:border-gray-700">
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {suggestion.response}
                              </p>
                              {suggestion.responded_at && (
                                <p className="text-xs text-gray-400 mt-2">
                                  Responded on {new Date(suggestion.responded_at).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Metadata - No ID */}
                        <div className="flex flex-wrap gap-4 pt-2 text-xs text-gray-400 border-t dark:border-gray-700">
                          {suggestion.created_at && (
                            <div>
                              <span className="font-medium">Submitted:</span> {new Date(suggestion.created_at).toLocaleString()}
                            </div>
                          )}
                          {suggestion.responded_at && (
                            <div>
                              <span className="font-medium">Responded:</span> {new Date(suggestion.responded_at).toLocaleString()}
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

      {/* Response Dialog - Dark mode compatible */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="sm:max-w-lg w-[95%] rounded-lg dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-white">
              <Reply className="h-5 w-5" />
              Respond to Suggestion
            </DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              {selectedSuggestion?.subject}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">From:</span> {selectedSuggestion?.user_name || selectedSuggestion?.user_fin || "Anonymous"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {selectedSuggestion?.content}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="response" className="dark:text-gray-300">Your Response</Label>
              <Textarea
                id="response"
                placeholder="Type your response here..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={5}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowResponseDialog(false)} className="w-full sm:w-auto dark:border-gray-600 dark:text-gray-300">
              Cancel
            </Button>
            <Button onClick={handleRespond} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Response
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}