import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, X } from "lucide-react";

export default function DeleteAnnouncementModal({
  isOpen,
  onClose,
  onConfirm,
  announcement,
  submitting,
  error
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="relative">
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Delete Announcement
          </DialogTitle>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="absolute right-0 top-0 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="py-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <p className="text-sm text-gray-600">
            Are you sure you want to delete this announcement? This action cannot be undone.
          </p>

          {announcement && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-medium text-gray-900">{announcement.title}</h4>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {announcement.content}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Target: {announcement.target_role || 'All Users'}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            disabled={submitting}
            className="bg-red-600 hover:bg-red-700"
            onClick={onConfirm}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </span>
            ) : (
              'Delete Announcement'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}