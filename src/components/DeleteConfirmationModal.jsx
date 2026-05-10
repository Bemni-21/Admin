import { useState } from "react"; // Add this import
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
  User
} from "lucide-react";

export default function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  userData,
  submitting,
  error 
}) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Delete User
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

            {/* User Info */}
            {userData && (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{userData.name}</h3>
                    <p className="text-sm text-gray-500">{userData.email}</p>
                  </div>
                </div>
                <p className="text-sm text-amber-800">
                  FIN: <span className="font-mono">{userData.fin}</span>
                </p>
              </div>
            )}

            {/* Warning Message */}
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-sm text-red-700">
                <span className="font-medium">Warning:</span> This action will soft delete the user. 
                The user will no longer be able to access the system, but their data will be preserved.
              </p>
            </div>

            {/* Deletion Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-gray-700">
                Reason for Deletion <span className="text-red-500">*</span>
              </Label>
              <Input
                id="reason"
                placeholder="e.g., User requested deletion, Fraudulent activity, etc."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">
                Please provide a reason for this deletion
              </p>
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
              disabled={submitting || !reason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </span>
              ) : (
                'Confirm Delete'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}