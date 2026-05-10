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
  User, 
  Mail, 
  Lock, 
  Shield, 
  Phone, 
  Calendar, 
  Fingerprint, 
  VenusAndMars,
  Loader2 
} from "lucide-react";

export default function UserModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  formData, 
  setFormData,
  submitting,
  error,
  success,
  mode = "add",
  fieldErrors = {},
  touchedFields = {},
  handleFieldChange,
  handleFieldBlur
}) {
  if (!isOpen) return null;

  const onFieldChange = (field, value) => {
    if (handleFieldChange) {
      handleFieldChange(field, value, mode);
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const onFieldBlur = (field) => {
    if (handleFieldBlur) {
      handleFieldBlur(field, mode);
    }
  };

  // Helper to show error only if field has been touched and has error
  const showError = (field) => {
    return touchedFields[field] && fieldErrors[field];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl my-8 dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4 dark:border-gray-700">
          <CardTitle className="text-xl font-bold dark:text-white">
            {mode === "add" ? "Add New Citizen" : "Update Citizen"}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            type="button"
            className="h-8 w-8 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-6 pt-6">
            {/* Global Error Message (only for form submission errors) */}
            {error && !success && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}
            
            {/* Success Message */}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
                <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* FIN Field */}
              <div className="space-y-2">
                <Label htmlFor="fin" className="text-gray-700 dark:text-gray-300 font-medium">
                  FIN Number <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Fingerprint className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="fin"
                    name="fin"
                    placeholder="123456789012"
                    value={formData.fin || ''}
                    onChange={(e) => onFieldChange('fin', e.target.value)}
                    onBlur={() => onFieldBlur('fin')}
                    className={`pl-9 ${showError('fin') ? 'border-red-500 focus:border-red-500' : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white'} ${mode === "edit" ? 'bg-gray-50 dark:bg-gray-600' : ''}`}
                    required={mode === "add"}
                    readOnly={mode === "edit"}
                    disabled={mode === "edit"}
                  />
                </div>
                {showError('fin') && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.fin}</p>
                )}
                {!showError('fin') && mode === "add" && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">Enter 12-digit FIN number (numbers only)</p>
                )}
              </div>

              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 dark:text-gray-300 font-medium">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="name"
                    name="name"
                    placeholder="Abebe Kebede"
                    value={formData.name || ''}
                    onChange={(e) => onFieldChange('name', e.target.value)}
                    onBlur={() => onFieldBlur('name')}
                    className={`pl-9 ${showError('name') ? 'border-red-500 focus:border-red-500' : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white'}`}
                    required
                  />
                </div>
                {showError('name') && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>
                )}
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300 font-medium">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="0912345678 or +251912345678"
                    value={formData.phone || ''}
                    onChange={(e) => onFieldChange('phone', e.target.value)}
                    onBlur={() => onFieldBlur('phone')}
                    className={`pl-9 ${showError('phone') ? 'border-red-500 focus:border-red-500' : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white'}`}
                    required
                  />
                </div>
                {showError('phone') && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>
                )}
                {!showError('phone') && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">Format: 0912345678 or +251912345678</p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="abebe@example.com"
                    value={formData.email || ''}
                    onChange={(e) => onFieldChange('email', e.target.value)}
                    onBlur={() => onFieldBlur('email')}
                    className={`pl-9 ${showError('email') ? 'border-red-500 focus:border-red-500' : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white'}`}
                    required
                  />
                </div>
                {showError('email') && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password Field - Only show in add mode */}
              {mode === "add" && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password || ''}
                      onChange={(e) => onFieldChange('password', e.target.value)}
                      onBlur={() => onFieldBlur('password')}
                      className={`pl-9 ${showError('password') ? 'border-red-500 focus:border-red-500' : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white'}`}
                      required
                    />
                  </div>
                  {showError('password') && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
                  )}
                  {!showError('password') && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">Min 6 chars, 1 uppercase, 1 lowercase, 1 number</p>
                  )}
                </div>
              )}

              {/* Date of Birth Field */}
              <div className="space-y-2">
                <Label htmlFor="dob" className="text-gray-700 dark:text-gray-300 font-medium">
                  Date of Birth <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="dob"
                    name="dob"
                    type="date"
                    value={formData.dob || ''}
                    onChange={(e) => onFieldChange('dob', e.target.value)}
                    onBlur={() => onFieldBlur('dob')}
                    className={`pl-9 ${showError('dob') ? 'border-red-500 focus:border-red-500' : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white'}`}
                    required
                  />
                </div>
                {showError('dob') && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.dob}</p>
                )}
              </div>

              {/* Gender Field */}
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-gray-700 dark:text-gray-300 font-medium">
                  Gender <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <VenusAndMars className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender || 'male'}
                    onChange={(e) => onFieldChange('gender', e.target.value)}
                    onBlur={() => onFieldBlur('gender')}
                    className={`w-full pl-9 h-11 bg-white border ${showError('gender') ? 'border-red-500' : 'border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white'} rounded-lg text-sm focus:border-gray-400 focus:outline-none`}
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                {showError('gender') && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.gender}</p>
                )}
              </div>

              {/* Role Field */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-gray-700 dark:text-gray-300 font-medium">
                  Role <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <select
                    id="role"
                    name="role"
                    value={formData.role || 'citizen'}
                    onChange={(e) => onFieldChange('role', e.target.value)}
                    onBlur={() => onFieldBlur('role')}
                    className={`w-full pl-9 h-11 bg-white border ${showError('role') ? 'border-red-500' : 'border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white'} rounded-lg text-sm focus:border-gray-400 focus:outline-none`}
                    required
                  >
                    <option value="citizen">Citizen</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                {showError('role') && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.role}</p>
                )}
              </div>
            </div>

            {/* Additional Info Display for Edit Mode */}
            {mode === "edit" && (formData.status || formData.last_login || formData.created_at) && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-700/50 dark:border-gray-600">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Account Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {formData.status && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Status:</span>
                      <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        formData.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                        formData.status === 'inactive' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {formData.status}
                      </span>
                    </div>
                  )}
                  {formData.last_login && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Last Login:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{formData.last_login}</span>
                    </div>
                  )}
                  {formData.created_at && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Created:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{formData.created_at}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-end gap-3 border-t pt-4 mt-2 dark:border-gray-700">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="px-4 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitting}
              className="bg-gray-900 hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700 px-6"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {mode === "add" ? "Creating..." : "Updating..."}
                </span>
              ) : (
                mode === "add" ? 'Create Citizen' : 'Update Citizen'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}