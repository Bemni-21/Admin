import { useState, useEffect } from "react";
import * as yup from "yup";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Loader2,
  Plus,
  MessageSquare,
  Eye,
  Pin,
  Lock,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  Share2,
  Flag,
  Edit,
  Trash2,
  X,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/authStore";
import { forumApi } from "@/services/Api";
import UpdatePostModal from "@/components/UpdatePostModal";
import DeletePostModal from "@/components/DeletePostModal";

// Validation schema for creating post
const createPostSchema = yup.object({
  title: yup
    .string()
    .required("Title is required")
    .min(5, "Title must be at least 5 characters")
    .max(255, "Title must be less than 255 characters"),
  content: yup
    .string()
    .required("Content is required")
    .min(10, "Content must be at least 10 characters")
    .max(5000, "Content must be less than 5000 characters"),
});

// Validation schema for reply
const replySchema = yup.object({
  content: yup
    .string()
    .required("Reply content is required")
    .min(2, "Reply must be at least 2 characters")
    .max(2000, "Reply must be less than 2000 characters"),
});

export default function ForumDetailView({ forumId, onBack }) {
  const { access_token, user } = useAuthStore();

  // State for posts
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [limit] = useState(10);

  // Create post modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  
  // Edit/Delete post state
  const [selectedPost, setSelectedPost] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [updateSubmitting, setUpdateSubmitting] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  
  // Reply states
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyingToPost, setReplyingToPost] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [replyFieldErrors, setReplyFieldErrors] = useState({});
  const [replyTouched, setReplyTouched] = useState(false);
  
  // Delete reply states
  const [showDeleteReplyModal, setShowDeleteReplyModal] = useState(false);
  const [selectedReply, setSelectedReply] = useState(null);
  const [deleteReplySubmitting, setDeleteReplySubmitting] = useState(false);
  const [deleteReplyError, setDeleteReplyError] = useState("");
  
  // Loading state for fetching individual posts
  const [fetchingPostDetails, setFetchingPostDetails] = useState({});
  
  // Profanity error details
  const [profanityError, setProfanityError] = useState(null);

  // Create post form data
  const [postForm, setPostForm] = useState({
    title: "",
    content: ""
  });

  // Validation functions for create post
  const validatePostField = async (field, value) => {
    try {
      await createPostSchema.validateAt(field, { [field]: value });
      setFieldErrors(prev => ({ ...prev, [field]: "" }));
      return true;
    } catch (err) {
      setFieldErrors(prev => ({ ...prev, [field]: err.message }));
      return false;
    }
  };

  const validatePostForm = async () => {
    try {
      await createPostSchema.validate(postForm, { abortEarly: false });
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

  const handlePostFieldBlur = async (field) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    await validatePostField(field, postForm[field]);
  };

  const showPostError = (field) => {
    return touchedFields[field] && fieldErrors[field];
  };

  // Validation functions for reply
  const validateReply = async () => {
    try {
      await replySchema.validate({ content: replyContent });
      setReplyFieldErrors({});
      return true;
    } catch (err) {
      setReplyFieldErrors({ content: err.message });
      return false;
    }
  };

  const handleReplyBlur = async () => {
    setReplyTouched(true);
    await validateReply();
  };

  const showReplyError = () => {
    return replyTouched && replyFieldErrors.content;
  };

  // Fetch posts when component mounts or pagination changes
  useEffect(() => {
    if (forumId) {
      fetchPosts();
    }
  }, [forumId, currentPage]);

  const fetchPosts = async () => {
    setLoading(true);
    setFetchError("");

    try {
      const response = await forumApi.getForumPosts(forumId, {
        page: currentPage,
        limit,
        sort: "created_at",
        order: "desc"
      }, access_token);

      if (response.success) {
        setPosts(response.data.posts);
        setTotalPages(response.data.totalPages);
        setTotalPosts(response.data.total);
        
        response.data.posts.forEach(post => {
          fetchPostWithReplies(post.id);
        });
      } else {
        setFetchError("Failed to load posts");
        toast.error("Failed to load posts");
      }
    } catch (err) {
      setFetchError(err.message || "Failed to fetch posts");
      toast.error(err.message || "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  const fetchPostWithReplies = async (postId) => {
    setFetchingPostDetails(prev => ({ ...prev, [postId]: true }));
    
    try {
      const response = await forumApi.getPostWithReplies(postId, access_token);
      
      if (response.success) {
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId ? response.data : post
          )
        );
      }
    } catch (err) {
      console.error(`Failed to fetch post ${postId} with replies:`, err);
    } finally {
      setFetchingPostDetails(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allFields = ["title", "content"];
    const newTouched = {};
    allFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouchedFields(prev => ({ ...prev, ...newTouched }));
    
    // Validate form
    const isValid = await validatePostForm();
    if (!isValid) {
      toast.error("Please fix the form errors before submitting");
      return;
    }
    
    setSubmitting(true);
    setError("");
    setSuccess("");
    setProfanityError(null);
    
    const toastId = toast.loading("Creating post...");

    try {
      const response = await forumApi.createForumPost(forumId, postForm, access_token);
      
      if (response.success) {
        toast.success("Post created successfully!", { id: toastId });
        setPostForm({ title: "", content: "" });
        setFieldErrors({});
        setTouchedFields({});
        await fetchPosts();
        
        setTimeout(() => {
          setShowCreateModal(false);
          setSuccess("");
        }, 1500);
      }
    } catch (err) {
      if (err.code === "PROFANITY_DETECTED") {
        setProfanityError(err);
        toast.error("Content contains inappropriate language", { id: toastId });
        setError("Content contains inappropriate language");
      } else {
        toast.error(err.message || "Failed to create post", { id: toastId });
        setError(err.message || "Failed to create post");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (post) => {
    setSelectedPost(post);
    setShowUpdateModal(true);
    setUpdateError("");
  };

  const handleUpdatePost = async (updatedData) => {
    setUpdateSubmitting(true);
    setUpdateError("");
    
    const toastId = toast.loading("Updating post...");

    try {
      const response = await forumApi.updatePost(selectedPost.id, updatedData, access_token);
      
      if (response.success) {
        toast.success("Post updated successfully!", { id: toastId });
        await fetchPosts();
        setShowUpdateModal(false);
        setSelectedPost(null);
      } else {
        toast.error(response.error || "Failed to update post", { id: toastId });
        setUpdateError(response.error || "Failed to update post");
      }
    } catch (err) {
      toast.error(err.message || "Failed to update post", { id: toastId });
      setUpdateError(err.message || "Failed to update post");
    } finally {
      setUpdateSubmitting(false);
    }
  };

  const handleDeleteClick = (post) => {
    setSelectedPost(post);
    setShowDeleteModal(true);
    setDeleteError("");
  };

  const handleConfirmDelete = async () => {
    setDeleteSubmitting(true);
    setDeleteError("");
    
    const toastId = toast.loading("Deleting post...");

    try {
      const response = await forumApi.deletePost(selectedPost.id, access_token);
      
      if (response.success) {
        toast.success("Post deleted successfully!", { id: toastId });
        await fetchPosts();
        setShowDeleteModal(false);
        setSelectedPost(null);
      } else {
        toast.error(response.error || "Failed to delete post", { id: toastId });
        setDeleteError(response.error || "Failed to delete post");
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete post", { id: toastId });
      setDeleteError(err.message || "Failed to delete post");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const handleReplyClick = (post) => {
    setReplyingToPost(post);
    setReplyContent("");
    setReplyError("");
    setReplyFieldErrors({});
    setReplyTouched(false);
    setProfanityError(null);
    setShowReplyModal(true);
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    
    // Validate reply
    setReplyTouched(true);
    const isValid = await validateReply();
    if (!isValid) {
      toast.error("Please fix the form errors before submitting");
      return;
    }
    
    setReplySubmitting(true);
    setReplyError("");
    setProfanityError(null);
    
    const toastId = toast.loading("Posting reply...");

    try {
      const response = await forumApi.createReply(replyingToPost.id, replyContent, access_token);
      
      if (response.success) {
        toast.success("Reply posted successfully!", { id: toastId });
        await fetchPostWithReplies(replyingToPost.id);
        setShowReplyModal(false);
        setReplyingToPost(null);
        setReplyContent("");
        setReplyFieldErrors({});
        setReplyTouched(false);
      }
    } catch (err) {
      if (err.code === "PROFANITY_DETECTED") {
        setProfanityError(err);
        toast.error("Content contains inappropriate language", { id: toastId });
        setReplyError("Content contains inappropriate language");
      } else if (err.code === "LOCKED") {
        toast.error("This post is locked and cannot be replied to", { id: toastId });
        setReplyError("This post is locked and cannot be replied to");
      } else {
        toast.error(err.message || "Failed to add reply", { id: toastId });
        setReplyError(err.message || "Failed to add reply");
      }
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleDeleteReplyClick = (reply, postId) => {
    setSelectedReply({ ...reply, postId });
    setDeleteReplyError("");
    setShowDeleteReplyModal(true);
  };

  const handleConfirmDeleteReply = async () => {
    setDeleteReplySubmitting(true);
    setDeleteReplyError("");
    
    const toastId = toast.loading("Deleting reply...");

    try {
      const response = await forumApi.deleteReply(selectedReply.id, access_token);
      
      if (response.success) {
        toast.success("Reply deleted successfully!", { id: toastId });
        await fetchPostWithReplies(selectedReply.postId);
        setShowDeleteReplyModal(false);
        setSelectedReply(null);
      } else {
        toast.error(response.error || "Failed to delete reply", { id: toastId });
        setDeleteReplyError(response.error || "Failed to delete reply");
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete reply", { id: toastId });
      setDeleteReplyError(err.message || "Failed to delete reply");
    } finally {
      setDeleteReplySubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPostForm(prev => ({ ...prev, [name]: value }));
    if (touchedFields[name]) {
      validatePostField(name, value);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'locked':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const canModifyPost = (post) => {
    return user?.id === post.user_id || user?.role === 'admin' || user?.role === 'super_admin';
  };

  const canDeleteReply = (reply) => {
    return user?.id === reply.user_id || user?.role === 'admin' || user?.role === 'super_admin';
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setError("");
    setSuccess("");
    setFieldErrors({});
    setTouchedFields({});
    setProfanityError(null);
    setPostForm({ title: "", content: "" });
  };

  const handleCloseReplyModal = () => {
    setShowReplyModal(false);
    setReplyingToPost(null);
    setReplyContent("");
    setReplyError("");
    setReplyFieldErrors({});
    setReplyTouched(false);
    setProfanityError(null);
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400 dark:text-gray-500" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button and create button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold dark:text-white">Forum Posts</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {totalPosts} {totalPosts === 1 ? 'post' : 'total posts'}
            </p>
          </div>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-gray-900 hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Showing posts info */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {posts.length} of {totalPosts} posts
      </div>

      {/* Error Message */}
      {fetchError && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg dark:bg-red-900/20 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 text-sm">{fetchError}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchPosts}
            className="mt-2 dark:border-gray-600 dark:text-gray-300"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <CardTitle className="text-lg dark:text-white">{post.title}</CardTitle>
                      {post.is_pinned && (
                        <Badge variant="outline" className="bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400">
                          <Pin className="h-3 w-3 mr-1" />
                          Pinned
                        </Badge>
                      )}
                      {post.is_locked && (
                        <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20 dark:text-red-400">
                          <Lock className="h-3 w-3 mr-1" />
                          Locked
                        </Badge>
                      )}
                      <Badge className={getStatusBadgeColor(post.status)}>
                        {post.status}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-4 text-xs dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {post.user_name || "Unknown User"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(post.created_at)}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {canModifyPost(post) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
                          <DropdownMenuItem onClick={() => handleEditClick(post)} className="dark:text-gray-300">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(post)} className="text-red-600 dark:text-red-400">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {post.content}
                </p>
              </CardContent>

              {/* Replies Section */}
              {post.replies && post.replies.length > 0 ? (
                <div className="px-6 pb-2">
                  <div className="bg-gray-50 rounded-lg p-4 dark:bg-gray-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        {post.replies.length} {post.replies.length === 1 ? 'Reply' : 'Replies'}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReplyClick(post)}
                        disabled={post.is_locked}
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {post.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-gray-200 text-gray-600 text-xs dark:bg-gray-600 dark:text-gray-300">
                              {reply.user_name?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium dark:text-gray-300">{reply.user_name || "Unknown User"}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(reply.created_at)}</span>
                              </div>
                              {canDeleteReply(reply) && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                  onClick={() => handleDeleteReplyClick(reply, post.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-6 pb-2">
                  {fetchingPostDetails[post.id] ? (
                    <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Loading replies...
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400 dark:text-gray-500 italic">No replies yet</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReplyClick(post)}
                        disabled={post.is_locked}
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <CardFooter className="border-t pt-4 dark:border-gray-700">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {post.view_count || 0} views
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {post.reply_count || 0} replies
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="dark:text-gray-400">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Like
                    </Button>
                    <Button variant="ghost" size="sm" className="dark:text-gray-400">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 dark:text-red-400">
                      <Flag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))
        ) : (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="py-12 text-center text-gray-500 dark:text-gray-400">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-lg font-medium">No posts yet</p>
              <p className="text-sm mt-1">Be the first to start a discussion!</p>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="mt-4 bg-gray-900 hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Post
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
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

      {/* Create Post Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader className="relative">
            <DialogTitle className="dark:text-white">Create New Post</DialogTitle>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleCloseCreateModal}
              className="absolute right-0 top-0 h-8 w-8 dark:text-gray-400 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <form onSubmit={handleCreatePost}>
            <div className="space-y-4 py-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg dark:bg-red-900/20 dark:border-red-800">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                  {profanityError && profanityError.matchedWords && (
                    <div className="mt-2 text-sm">
                      <p className="font-medium text-red-700 dark:text-red-300">Detected inappropriate words:</p>
                      <ul className="list-disc list-inside mt-1">
                        {profanityError.matchedWords.map((item, idx) => (
                          <li key={idx} className="text-red-600 dark:text-red-400">
                            "{item.word}" (severity: {item.severity})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {success && (
                <div className="p-3 bg-green-50 border border-green-100 rounded-lg dark:bg-green-900/20 dark:border-green-800">
                  <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
                </div>
              )}

              {/* Title Field */}
              <div className="space-y-2">
                <Label htmlFor="title" className="dark:text-gray-300">Post Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter a descriptive title"
                  value={postForm.title}
                  onChange={handleInputChange}
                  onBlur={() => handlePostFieldBlur('title')}
                  maxLength={255}
                  className={showPostError('title') ? 'border-red-500' : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white'}
                  required
                />
                {showPostError('title') && (
                  <p className="text-xs text-red-500">{fieldErrors.title}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                  {postForm.title.length}/255
                </p>
              </div>

              {/* Content Field */}
              <div className="space-y-2">
                <Label htmlFor="content" className="dark:text-gray-300">Post Content *</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Write your post content here..."
                  value={postForm.content}
                  onChange={handleInputChange}
                  onBlur={() => handlePostFieldBlur('content')}
                  rows={8}
                  className={showPostError('content') ? 'border-red-500' : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white'}
                  required
                />
                {showPostError('content') && (
                  <p className="text-xs text-red-500">{fieldErrors.content}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  HTML is not allowed and will be escaped for security
                </p>
              </div>

              {/* Guidelines */}
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Posting Guidelines:</h4>
                <ul className="text-xs text-blue-700 dark:text-blue-400 list-disc list-inside space-y-1">
                  <li>Be respectful and constructive in your discussions</li>
                  <li>Stay on topic and avoid spam</li>
                  <li>Inappropriate language will be filtered</li>
                  <li>Posts violating guidelines may be removed</li>
                </ul>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseCreateModal} className="dark:border-gray-600 dark:text-gray-300">
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
                    Posting...
                  </span>
                ) : (
                  'Create Post'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reply Modal */}
      <Dialog open={showReplyModal} onOpenChange={setShowReplyModal}>
        <DialogContent className="max-w-lg dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader className="relative">
            <DialogTitle className="dark:text-white">Reply to Post</DialogTitle>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleCloseReplyModal}
              className="absolute right-0 top-0 h-8 w-8 dark:text-gray-400 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <form onSubmit={handleSubmitReply}>
            <div className="space-y-4 py-4">
              {replyError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg dark:bg-red-900/20 dark:border-red-800">
                  <p className="text-red-600 dark:text-red-400 text-sm">{replyError}</p>
                  {profanityError && profanityError.matchedWords && (
                    <div className="mt-2 text-sm">
                      <p className="font-medium text-red-700 dark:text-red-300">Detected inappropriate words:</p>
                      <ul className="list-disc list-inside mt-1">
                        {profanityError.matchedWords.map((item, idx) => (
                          <li key={idx} className="text-red-600 dark:text-red-400">
                            "{item.word}" (severity: {item.severity})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Original Post Preview */}
              {replyingToPost && (
                <div className="p-3 bg-gray-50 rounded-lg border dark:bg-gray-700/50 dark:border-gray-600">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Replying to:</p>
                  <p className="text-sm font-medium dark:text-white">{replyingToPost.title}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{replyingToPost.content}</p>
                </div>
              )}

              {/* Reply Content */}
              <div className="space-y-2">
                <Label htmlFor="reply" className="dark:text-gray-300">Your Reply</Label>
                <Textarea
                  id="reply"
                  placeholder="Write your reply here..."
                  value={replyContent}
                  onChange={(e) => {
                    setReplyContent(e.target.value);
                    if (replyTouched) validateReply();
                  }}
                  onBlur={handleReplyBlur}
                  rows={4}
                  className={showReplyError() ? 'border-red-500' : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white'}
                  required
                />
                {showReplyError() && (
                  <p className="text-xs text-red-500">{replyFieldErrors.content}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                  {replyContent.length} characters
                </p>
              </div>

              {/* Guidelines */}
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  Keep your replies respectful and constructive. 
                  Inappropriate content may be removed.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseReplyModal} className="dark:border-gray-600 dark:text-gray-300">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={replySubmitting || !replyContent.trim()}
                className="bg-gray-900 hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {replySubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Posting...
                  </span>
                ) : (
                  'Post Reply'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Reply Modal */}
      <Dialog open={showDeleteReplyModal} onOpenChange={setShowDeleteReplyModal}>
        <DialogContent className="max-w-md dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader className="relative">
            <DialogTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Reply
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowDeleteReplyModal(false)}
              className="absolute right-0 top-0 h-8 w-8 dark:text-gray-400 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <div className="py-4">
            {deleteReplyError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg dark:bg-red-900/20 dark:border-red-800">
                <p className="text-red-600 dark:text-red-400 text-sm">{deleteReplyError}</p>
              </div>
            )}

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this reply?
            </p>

            {selectedReply && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border dark:bg-gray-700/50 dark:border-gray-600">
                <p className="text-sm text-gray-700 dark:text-gray-300">{selectedReply.content}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowDeleteReplyModal(false)} className="dark:border-gray-600 dark:text-gray-300">
              Cancel
            </Button>
            <Button 
              type="button" 
              disabled={deleteReplySubmitting}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
              onClick={handleConfirmDeleteReply}
            >
              {deleteReplySubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </span>
              ) : (
                'Delete Reply'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Post Modal */}
      <UpdatePostModal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedPost(null);
          setUpdateError("");
        }}
        onSubmit={handleUpdatePost}
        post={selectedPost}
        submitting={updateSubmitting}
        error={updateError}
      />

      {/* Delete Post Modal */}
      <DeletePostModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedPost(null);
          setDeleteError("");
        }}
        onConfirm={handleConfirmDelete}
        post={selectedPost}
        submitting={deleteSubmitting}
        error={deleteError}
      />
    </div>
  );
}