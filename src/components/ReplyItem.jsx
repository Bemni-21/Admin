import { useState } from "react";
import { User, Clock, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export default function ReplyItem({ reply, onDelete, canModify }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return new Date(dateString).toLocaleDateString();
    }
  };

  const handleDelete = async () => {
    setDeleteSubmitting(true);
    setDeleteError("");
    
    try {
      await onDelete(reply.id);
      setShowDeleteModal(false);
    } catch (err) {
      setDeleteError(err.message || "Failed to delete reply");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <>
      <div className="py-4 border-b last:border-b-0">
        <div className="flex gap-3">
          {/* Avatar */}
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
              {reply.user_name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          {/* Reply Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{reply.user_name || "Unknown User"}</span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(reply.created_at)}
                </span>
                {reply.status !== 'active' && (
                  <Badge variant="outline" className="text-xs bg-gray-100">
                    {reply.status}
                  </Badge>
                )}
              </div>

              {/* Delete button - only if user can modify */}
              {canModify && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-400 hover:text-red-600"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>

            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {reply.content}
            </p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Delete Reply
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-red-600 text-sm">{deleteError}</p>
              </div>
            )}

            <p className="text-sm text-gray-600">
              Are you sure you want to delete this reply?
            </p>

            <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-700 line-clamp-2">
                {reply.content}
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
              type="button" 
              disabled={deleteSubmitting}
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              {deleteSubmitting ? (
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
    </>
  );
}