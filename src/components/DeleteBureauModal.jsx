import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, Building2, X } from "lucide-react";

export default function DeleteBureauModal({
  isOpen,
  onClose,
  onConfirm,
  bureau,
  submitting,
  error
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="relative">
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Delete Bureau
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
            Are you sure you want to delete this bureau? This action cannot be undone.
          </p>

          {bureau && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-gray-600" />
                <h4 className="font-medium text-gray-900">{bureau.name}</h4>
              </div>
              {bureau.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {bureau.description}
                </p>
              )}
              {bureau.contact_email && (
                <p className="text-xs text-gray-400 mt-2">
                  Email: {bureau.contact_email}
                </p>
              )}
            </div>
          )}

          <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
            <p className="text-xs text-amber-700">
              <span className="font-medium">Warning:</span> Deleting this bureau will remove all associated data.
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
              'Delete Bureau'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}