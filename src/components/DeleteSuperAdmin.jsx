import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, Shield, X } from "lucide-react";

export default function DeleteSuperAdmin({
  isOpen,
  onClose,
  onConfirm,
  superAdmin,
  submitting,
  error
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="relative">
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Delete Super Admin
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
            Are you sure you want to delete <span className="font-medium text-gray-900">{superAdmin?.name}</span>?
            This action cannot be undone.
          </p>

          {superAdmin && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-gray-900">{superAdmin.name}</span>
              </div>
              <p className="text-sm text-gray-500">{superAdmin.email}</p>
              <p className="text-xs text-gray-400 mt-2">
                Bureau: {superAdmin.bureau_name}
              </p>
            </div>
          )}

          <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
            <p className="text-xs text-amber-700">
              <span className="font-medium">Warning:</span> This will soft-delete the super admin.
              They will no longer have access to the system.
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
              'Delete Super Admin'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}