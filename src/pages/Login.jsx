import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Shield, Building2, Users, Activity, Eye, EyeOff, AlertCircle, Sun, Moon } from "lucide-react";
import { authApi } from "@/services/Api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(null);
  const [remainingLockoutSeconds, setRemainingLockoutSeconds] = useState(0);
  const [isLightMode, setIsLightMode] = useState(() => {
    const savedMode = localStorage.getItem('loginTheme');
    return savedMode === 'light' || (!savedMode && window.matchMedia('(prefers-color-scheme: light)').matches);
  });

  const loginStore = useAuthStore();
  const navigate = useNavigate();

  // Load failed attempts from localStorage
  useEffect(() => {
    const storedAttempts = localStorage.getItem('login_failed_attempts');
    const storedLockout = localStorage.getItem('login_lockout_until');
    
    if (storedAttempts) {
      setFailedAttempts(parseInt(storedAttempts));
    }
    
    if (storedLockout) {
      const lockoutUntil = new Date(storedLockout);
      if (lockoutUntil > new Date()) {
        setLockoutTime(lockoutUntil);
      } else {
        localStorage.removeItem('login_lockout_until');
        localStorage.removeItem('login_failed_attempts');
        setFailedAttempts(0);
      }
    }
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const remaining = Math.max(0, Math.floor((lockoutTime - now) / 1000));
        setRemainingLockoutSeconds(remaining);
        
        if (remaining <= 0) {
          setLockoutTime(null);
          setFailedAttempts(0);
          localStorage.removeItem('login_lockout_until');
          localStorage.removeItem('login_failed_attempts');
          clearInterval(interval);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [lockoutTime]);

  useEffect(() => {
    setMounted(true);
    
    if (loginStore.access_token) {
      navigate('/dashboard');
    }
  }, [loginStore.access_token, navigate]);

  useEffect(() => {
    localStorage.setItem('loginTheme', isLightMode ? 'light' : 'dark');
  }, [isLightMode]);

  const toggleTheme = () => {
    setIsLightMode(!isLightMode);
  };

  const formatLockoutTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins} minute${mins > 1 ? 's' : ''}${secs > 0 ? ` ${secs} second${secs > 1 ? 's' : ''}` : ''}`;
    }
    return `${secs} second${secs > 1 ? 's' : ''}`;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (lockoutTime && lockoutTime > new Date()) {
      const remaining = formatLockoutTime(remainingLockoutSeconds);
      setError(`Too many failed attempts. Please try again in ${remaining}.`);
      toast.error(`Account temporarily locked. Try again in ${remaining}.`);
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const data = await authApi.signInWithEmail(email, password);
      console.log("Login response:", data);
      
      localStorage.removeItem('login_failed_attempts');
      localStorage.removeItem('login_lockout_until');
      setFailedAttempts(0);
      setLockoutTime(null);
      
      loginStore.login({
        user: data.user,
        access_token: data.token,
        refresh_token: null,
      });
      
      toast.success("Login successful! Welcome back.");
      navigate('/dashboard');
    } catch (err) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      localStorage.setItem('login_failed_attempts', newAttempts.toString());
      
      if (newAttempts >= 5) {
        const lockoutUntil = new Date(Date.now() + 5 * 60 * 1000);
        setLockoutTime(lockoutUntil);
        localStorage.setItem('login_lockout_until', lockoutUntil.toISOString());
        setError(`Account locked for 5 minutes due to 5 failed login attempts.`);
        toast.error("Account temporarily locked due to multiple failed attempts.");
      } else {
        const remainingAttempts = 5 - newAttempts;
        setError(`${err.message || "Login failed"}. ${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining.`);
        toast.error(`Invalid credentials. ${remainingAttempts} attempts remaining.`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const lightModeStyles = {
    bgGradient: "from-gray-50 to-gray-100",
    cardBg: "bg-white/95",
    cardBorder: "border-gray-200",
    textPrimary: "text-gray-900",
    textSecondary: "text-gray-600",
    textMuted: "text-gray-500",
    inputBg: "bg-white",
    inputBorder: "border-gray-300",
    inputText: "text-gray-900",
    iconColor: "text-gray-400",
    featureBg: "bg-white/80",
    featureBorder: "border-gray-200",
    featureText: "text-gray-700",
    featureDesc: "text-gray-500",
    badgeText: "text-gray-500",
    overlay: "bg-gray-100"
  };

  const darkModeStyles = {
    bgGradient: "from-black/70 via-black/50 to-black/70",
    cardBg: "bg-white/10",
    cardBorder: "border-white/20",
    textPrimary: "text-white",
    textSecondary: "text-gray-300",
    textMuted: "text-gray-400",
    inputBg: "bg-white/10",
    inputBorder: "border-white/20",
    inputText: "text-white",
    iconColor: "text-gray-400",
    featureBg: "bg-white/10",
    featureBorder: "border-white/20",
    featureText: "text-white",
    featureDesc: "text-gray-300",
    badgeText: "text-gray-400",
    overlay: "bg-black/30"
  };

  const styles = isLightMode ? lightModeStyles : darkModeStyles;

  return (
    <div className={`min-h-screen w-full flex relative overflow-hidden bg-gradient-to-br ${styles.bgGradient}`}>
      {/* Background for light mode - simple gradient */}
      {isLightMode && (
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-gray-50/50"></div>
        </div>
      )}

      {/* Video Background for dark mode */}
      {!isLightMode && (
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1573167507387-6e4b0e5f0d5a?q=80&w=2070&auto=format&fit=crop"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-clouds-of-sunset-over-the-city-36077-large.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70"></div>
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
      )}

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className={`fixed top-4 right-4 z-20 p-2 rounded-full transition-all duration-300 ${
          isLightMode 
            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-md' 
            : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
        }`}
      >
        {isLightMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </button>

      {/* Animated Stats Overlay - Left Side */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 items-center justify-center p-12">
        <div className="max-w-md">
          {/* Animated Logo */}
          <div className="mb-12 animate-fade-in">
            <div className={`relative ${!isLightMode && 'animate-pulse'}`}>
              {!isLightMode && (
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-75"></div>
              )}
              <div className={`relative w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-2xl`}>
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className={`text-5xl font-bold mb-4 mt-6 tracking-tight animate-slide-up ${styles.textPrimary}`}>
              Civic Admin
            </h1>
            <p className={`text-lg leading-relaxed animate-slide-up animation-delay-100 ${styles.textSecondary}`}>
              Secure Government Administration Portal
            </p>
          </div>
          
          {/* Feature Cards */}
          <div className="space-y-4 mb-8">
            <div className={`backdrop-blur-md rounded-xl p-4 border animate-slide-up animation-delay-200 hover:shadow-lg transition-all duration-300 ${styles.featureBg} ${styles.featureBorder}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users className={`w-5 h-5 ${isLightMode ? 'text-blue-600' : 'text-blue-400'}`} />
                </div>
                <div>
                  <p className={`font-semibold ${styles.featureText}`}>Citizen Management</p>
                  <p className={`text-sm ${styles.featureDesc}`}>Comprehensive citizen records and profiles</p>
                </div>
              </div>
            </div>

            <div className={`backdrop-blur-md rounded-xl p-4 border animate-slide-up animation-delay-300 hover:shadow-lg transition-all duration-300 ${styles.featureBg} ${styles.featureBorder}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Building2 className={`w-5 h-5 ${isLightMode ? 'text-green-600' : 'text-green-400'}`} />
                </div>
                <div>
                  <p className={`font-semibold ${styles.featureText}`}>Multi-Bureau Support</p>
                  <p className={`text-sm ${styles.featureDesc}`}>Manage multiple government agencies</p>
                </div>
              </div>
            </div>

            <div className={`backdrop-blur-md rounded-xl p-4 border animate-slide-up animation-delay-400 hover:shadow-lg transition-all duration-300 ${styles.featureBg} ${styles.featureBorder}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Activity className={`w-5 h-5 ${isLightMode ? 'text-purple-600' : 'text-purple-400'}`} />
                </div>
                <div>
                  <p className={`font-semibold ${styles.featureText}`}>Real-time Analytics</p>
                  <p className={`text-sm ${styles.featureDesc}`}>Live insights and performance metrics</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badge */}
          <div className={`flex items-center gap-4 text-sm animate-fade-in animation-delay-500 ${styles.badgeText}`}>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Secure SSL</span>
            </div>
            <div className={`w-1 h-1 rounded-full ${isLightMode ? 'bg-gray-400' : 'bg-gray-500'}`}></div>
            <div className="flex items-center gap-2">
              <span>End-to-End Encrypted</span>
            </div>
            <div className={`w-1 h-1 rounded-full ${isLightMode ? 'bg-gray-400' : 'bg-gray-500'}`}></div>
            <div className="flex items-center gap-2">
              <span>24/7 Enterprise Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 relative z-10 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Glass Card Container */}
          <div className={`backdrop-blur-xl rounded-2xl border shadow-2xl p-8 animate-slide-up ${styles.cardBg} ${styles.cardBorder}`}>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="lg:hidden flex justify-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
              <h2 className={`text-2xl font-bold mb-2 ${styles.textPrimary}`}>
                Welcome Back
              </h2>
              <p className={`text-sm ${styles.textSecondary}`}>
                Sign in to access your government dashboard
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-500/20 border border-red-500/30 rounded-lg backdrop-blur-sm animate-shake">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-300" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Lockout Warning */}
            {lockoutTime && lockoutTime > new Date() && (
              <div className="mb-6 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-300" />
                  <p className="text-yellow-200 text-sm">
                    Account temporarily locked. Try again in {formatLockoutTime(remainingLockoutSeconds)}.
                  </p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className={`text-sm font-medium ${styles.textSecondary}`}>
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${styles.iconColor} group-focus-within:text-blue-400 transition-colors`} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-9 h-11 rounded-lg text-sm backdrop-blur-sm transition-all duration-300 ${styles.inputBg} ${styles.inputBorder} ${styles.inputText} placeholder:${styles.textMuted} focus:border-blue-500 focus:ring-0`}
                    required
                    disabled={lockoutTime && lockoutTime > new Date()}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className={`text-sm font-medium ${styles.textSecondary}`}>
                  Password
                </Label>
                <div className="relative group">
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${styles.iconColor} group-focus-within:text-blue-400 transition-colors`} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-9 pr-10 h-11 rounded-lg text-sm backdrop-blur-sm transition-all duration-300 ${styles.inputBg} ${styles.inputBorder} ${styles.inputText} placeholder:${styles.textMuted} focus:border-blue-500 focus:ring-0`}
                    required
                    disabled={lockoutTime && lockoutTime > new Date()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${styles.iconColor} hover:${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <Link 
                  to="/forget-password" 
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || (lockoutTime && lockoutTime > new Date())}
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Signing in...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 text-center">
              <p className={`text-xs ${styles.textMuted}`}>
                This is a secure government system. Unauthorized access is prohibited.
              </p>
            </div>
          </div>

          {/* Version Info */}
          <div className="text-center mt-6">
            <p className={`text-xs ${styles.textMuted}`}>Secure Government Portal v2.0 | © 2024</p>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        
        .animation-delay-100 {
          animation-delay: 0.1s;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        
        .animation-delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
}