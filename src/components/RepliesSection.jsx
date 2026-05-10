import { useState } from "react";
import { MessageSquare, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import ReplyItem from "./ReplyItem";

export default function RepliesSection({
  post,
  replies = [],
  onAddReply,
  onDeleteReply,
  isAddingReply,
  currentUserId,
  isPostLocked
}) {
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      await onAddReply(replyContent);
      setReplyContent("");
      setShowReplyModal(false);
    } catch (err) {
      setError(err.message || "Failed to add reply");
    } finally {
      setSubmitting(false);
    }
  };

  const canAddReply = !isPostLocked;
  const canModifyReply = (reply) => {
    // User can delete if they're the author or admin
    return reply.user_id === currentUserId; // Add admin check if needed
  };

  return (
    <div className="mt-4 pt-4 border-t">
      {/* Replies Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
          </span>
        </div>

        {/* Reply Button */}
        {canAddReply ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReplyModal(true)}
            className="text-gray-600 hover:text-gray-900"
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Reply
          </Button>
        ) : (
          <Badge variant="outline" className="bg-red-50 text-red-600">
            <Lock className="h-3 w-3 mr-1" />
            Locked
          </Badge>
        )}
      </div>

      {/* Replies List */}
      {replies.length > 0 ? (
        <div className="space-y-1">
          {replies.map((reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              onDelete={onDeleteReply}
              canModify={canModifyReply(reply)}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic py-2">
          No replies yet. Be the first to reply!
        </p>
      )}

      {/* Reply Modal */}
      <Dialog open={showReplyModal} onOpenChange={setShowReplyModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Reply to Post</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmitReply}>
            <div className="space-y-4 py-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Original Post Preview */}
              <div className="p-3 bg-gray-50 rounded-lg border">
                <p className="text-xs font-medium text-gray-500 mb-1">Replying to:</p>
                <p className="text-sm text-gray-700 line-clamp-2">{post.title}</p>
              </div>

              {/* Reply Content */}
              <div className="space-y-2">
                <Label htmlFor="reply">Your Reply</Label>
                <Textarea
                  id="reply"
                  placeholder="Write your reply here..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              {/* Guidelines */}
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-xs text-blue-700">
                  Keep your replies respectful and constructive. 
                  Inappropriate content may be removed.
                </p>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={submitting || !replyContent.trim()}
                className="bg-gray-900 hover:bg-gray-800"
              >
                {submitting ? (
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
    </div>
  );
}