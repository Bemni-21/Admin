import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, Hash, Globe, Lock, Folder, X } from "lucide-react";

export default function DeleteForum({
  isOpen,
  onClose,
  onConfirm,
  forum,
  submitting,
  error
}) {
  const getIconComponent = (iconName) => {
    switch(iconName) {
      case 'globe': return <Globe className="h-4 w-4" />;
      case 'lock': return <Lock className="h-4 w-4" />;
      case 'hash': return <Hash className="h-4 w-4" />;
      default: return <Folder className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="relative">
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Delete Forum
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
            Are you sure you want to delete this forum? This action cannot be undone.
          </p>

          {forum && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {getIconComponent(forum.icon)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{forum.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{forum.category}</p>
                </div>
              </div>
              {forum.description && (
                <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                  {forum.description}
                </p>
              )}
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                <span>Status: {forum.status || 'active'}</span>
                <span>•</span>
                <span>Created: {new Date(forum.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          )}

          <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
            <p className="text-xs text-amber-700">
              <span className="font-medium">Warning:</span> Deleting this forum will remove all posts, replies, and associated data permanently.
            </p>
          </div>
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
              'Delete Forum'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}