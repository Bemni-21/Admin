import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { 
  X, 
  AlertTriangle, 
  Loader2,
  Users,
  CheckCircle
} from "lucide-react";

export default function BulkDeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  selectedCount,
  selectedUsers,
  submitting,
  error 
}) {
  const [reason, setReason] = useState("");
  const [confirmText, setConfirmText] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(reason);
  };

  const isConfirmValid = confirmText === "BULK DELETE";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Bulk Delete Users ({selectedCount})
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Selected Users Summary */}
            {selectedUsers && selectedUsers.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-amber-600" />
                  <h3 className="font-medium text-gray-900">Selected Users</h3>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {selectedUsers.map((user, index) => (
                    <div key={user.id || index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-amber-600" />
                        <span className="text-gray-700">{user.name}</span>
                      </div>
                      <span className="text-gray-500 text-xs font-mono">{user.fin}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warning Message */}
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-sm text-red-700">
                <span className="font-medium">Warning:</span> You are about to delete {selectedCount} users. 
                This action will soft delete these users. Their data will be preserved but they will lose access to the system.
              </p>
            </div>

            {/* Deletion Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-gray-700">
                Reason for Bulk Deletion <span className="text-red-500">*</span>
              </Label>
              <Input
                id="reason"
                placeholder="e.g., Bulk cleanup of inactive accounts, Department cleanup, etc."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">
                Provide a reason for this bulk deletion
              </p>
            </div>

            {/* Confirmation Text */}
            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-gray-700">
                Type <span className="font-mono font-bold">BULK DELETE</span> to confirm
              </Label>
              <Input
                id="confirm"
                placeholder="BULK DELETE"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className={confirmText === "BULK DELETE" ? "border-green-500" : ""}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitting || !reason.trim() || !isConfirmValid}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting {selectedCount} users...
                </span>
              ) : (
                `Delete ${selectedCount} Users`
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}