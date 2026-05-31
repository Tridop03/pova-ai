import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Upload, 
  Maximize, 
  Sparkles, 
  CheckSquare, 
  ArrowRight, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Facebook,
  MessageCircle,
  Camera,
  X,
  User,
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  Check,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Download,
  Zap,
  Trophy,
  Flame,
  Music,
  VolumeX,
  Square,
  Eye,
  EyeOff,
  LogOut,
  LayoutDashboard,
  Package,
  Users,
  Inbox,
  MessageSquare,
  Activity,
  History,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  Image as ImageIcon,
  AlertTriangle
} from 'lucide-react';

// --- Types ---
type View = 'landing' | 'upload' | 'result' | 'submission_success' | 'login' | 'signup' | 'game' | 'admin';

type UploadStep = {
  id: string;
  label: string;
  image: string | null;
  status: 'idle' | 'uploading' | 'complete' | 'failed';
  progress: number;
};

// --- Components ---

const Toast = ({ message, onClose }: { message: string, onClose: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50, x: '-50%' }}
    animate={{ opacity: 1, y: 0, x: '-50%' }}
    exit={{ opacity: 0, y: 20, x: '-50%' }}
    className="fixed bottom-8 left-1/2 z-50 bg-brand-dark text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10"
  >
    <div className="w-8 h-8 bg-brand-purple rounded-full flex items-center justify-center">
      <User size={16} />
    </div>
    <span className="text-sm font-medium">{message}</span>
    <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
      <X size={16} />
    </button>
  </motion.div>
);

const AuthModal = ({ type, setView, onClose, onVerified }: { 
  type: 'login' | 'signup', 
  setView: (v: string) => void, 
  onClose: () => void, 
  onVerified?: (userData: any) => void 
}) => {
  const [step, setStep] = useState<'form' | 'verify' | 'success' | 'forgot_email' | 'forgot_verify' | 'reset_password' | 'reset_success'>('form');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const codeInputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: any;
    if ((step === 'verify' || step === 'forgot_verify') && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (type === 'signup') {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('All fields are required');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('passwords does not match,please check sign up');
        return;
      }
      // Transition to verification
      setStep('verify');
    } else {
      if (!formData.email || !formData.password) {
        setError('All fields are required');
        return;
      }
      
      // Admin check
      if (formData.email === 'admin@gmail.com' && formData.password === 'admin123') {
        onVerified?.({
          email: formData.email,
          name: 'Admin',
          role: 'admin'
        });
        onClose();
        return;
      }

      // Simulate login success
      onVerified?.({
        email: formData.email,
        name: 'User'
      });
      onClose();
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    if (value && index < 5) {
      codeInputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      codeInputs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = () => {
    setTimer(30);
    setError('');
    // In a real app, this would trigger the backend to send another email
    // For now, we'll just reset the timer
  };

  const handleVerifyCode = () => {
    setIsVerifying(true);
    setError('');
    
    // Simulate verification
    setTimeout(() => {
      const code = verificationCode.join('');
      if (code === '123456') { // Mock correct code
        if (step === 'forgot_verify') {
          setStep('reset_password');
        } else {
          setStep('success');
        }
      } else {
        setError('Incorrect code. Please try again.');
        setVerificationCode(['', '', '', '', '', '']);
        codeInputs.current[0]?.focus();
      }
      setIsVerifying(false);
    }, 1500);
  };

  const handleForgotEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setError('Email is required');
      return;
    }
    setTimer(30);
    setVerificationCode(['', '', '', '', '', '']);
    setStep('forgot_verify');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setStep('reset_success');
  };

  const renderForm = () => (
    <>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">
          {type === 'signup' ? 'Create free account to see result' : 'Welcome back'}
        </h2>
        <p className="text-gray-500 text-sm">
          {type === 'signup' 
            ? 'Sign up in seconds to reveal your product verification result.' 
            : 'Sign in to access your verification history.'}
        </p>
      </div>

      <button className="w-full flex items-center justify-center gap-3 border border-gray-200 py-3.5 rounded-2xl font-medium hover:bg-gray-50 transition-all mb-6">
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
        Continue with Google
      </button>

      <div className="relative flex items-center justify-center mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-100"></div>
        </div>
        <span className="relative px-4 bg-white text-gray-400 text-xs uppercase tracking-widest">Or</span>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {type === 'signup' && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 ml-1">Name</label>
            <input 
              type="text" 
              placeholder="Enter name" 
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all"
            />
          </div>
        )}
        
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 ml-1">Email address</label>
          <input 
            type="email" 
            placeholder="Enter email address" 
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Enter password" 
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all pr-12"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="flex justify-end">
            <button 
              type="button"
              onClick={() => setStep('forgot_email')}
              className="text-xs font-bold text-brand-purple hover:underline"
            >
              Forgot password?
            </button>
          </div>
        </div>

        {type === 'signup' && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 ml-1">Confirm password</label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="Enter password" 
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all pr-12"
              />
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-xs font-medium text-center"
          >
            {error}
          </motion.div>
        )}

        <button 
          type="submit"
          className="w-full bg-brand-purple text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-purple/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          Continue <ArrowRight size={20} />
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-500">
        {type === 'login' ? (
          <>Don't have an account? <button onClick={() => setView('signup')} className="text-brand-purple font-bold hover:underline ml-1">Sign up ›</button></>
        ) : (
          <>Already have an account? <button onClick={() => setView('login')} className="text-brand-purple font-bold hover:underline ml-1">Login ›</button></>
        )}
      </div>
    </>
  );

  const renderVerify = (isForgot: boolean = false) => (
    <div className="text-center">
      <button 
        onClick={() => setStep(isForgot ? 'forgot_email' : 'form')}
        className="absolute top-6 left-6 text-gray-400 hover:text-brand-dark transition-colors"
      >
        <ArrowRight className="rotate-180" size={24} />
      </button>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">
          {isForgot ? 'Reset password' : 'Verify your email'}
        </h2>
        <p className="text-gray-500 text-sm">
          {isForgot 
            ? 'Enter the 6-digit code we sent to reset your password.'
            : 'Enter the 6-digit code we sent to your email.'}
        </p>
      </div>

      <div className="flex justify-between gap-2 mb-4">
        {verificationCode.map((digit, i) => (
          <input
            key={i}
            ref={el => codeInputs.current[i] = el}
            type="text"
            inputMode="numeric"
            value={digit}
            onChange={(e) => handleCodeChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`w-12 h-14 text-center text-xl font-bold bg-gray-50 border rounded-2xl focus:outline-none focus:ring-2 transition-all ${
              error ? 'border-red-500 focus:ring-red-200' : 'border-gray-100 focus:ring-brand-purple/20'
            }`}
          />
        ))}
      </div>

      {error && (
        <p className="text-red-500 text-xs font-medium mb-6">{error}</p>
      )}

      <p className="text-gray-500 text-xs mb-8">
        Didn't receive the code? Click re-send in <span className="font-bold">{timer}s</span>{' '}
        <button 
          disabled={timer > 0}
          onClick={handleResendCode}
          className={`font-bold transition-colors ${timer > 0 ? 'text-gray-300 cursor-not-allowed' : 'text-brand-purple hover:underline'}`}
        >
          Resend code ›
        </button>
      </p>

      <button 
        onClick={handleVerifyCode}
        disabled={isVerifying || verificationCode.some(d => !d)}
        className="w-full bg-brand-purple text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-purple/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isVerifying ? <Loader2 className="animate-spin" size={20} /> : 'Verify'} <ArrowRight size={20} />
      </button>
    </div>
  );

  const renderForgotEmail = () => (
    <div className="text-center">
      <button 
        onClick={() => setStep('form')}
        className="absolute top-6 left-6 text-gray-400 hover:text-brand-dark transition-colors"
      >
        <ArrowRight className="rotate-180" size={24} />
      </button>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Forgot password?</h2>
        <p className="text-gray-500 text-sm">
          Please enter your email below, we will send a 6-digit code to your email
        </p>
      </div>

      <form onSubmit={handleForgotEmailSubmit} className="space-y-6 text-left">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 ml-1">Email address</label>
          <input 
            type="email" 
            placeholder="Enter email address" 
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all"
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-brand-purple text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-purple/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          Send code <ArrowRight size={20} />
        </button>
      </form>
    </div>
  );

  const renderResetPassword = () => (
    <div className="text-center">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Reset password</h2>
        <p className="text-gray-500 text-sm">
          Please enter a new password
        </p>
      </div>

      <form onSubmit={handleResetPassword} className="space-y-5 text-left">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 ml-1">New password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Enter password" 
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all pr-12"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 ml-1">Confirm new password</label>
          <div className="relative">
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              placeholder="Enter password" 
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all pr-12"
            />
            <button 
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-xs font-medium text-center">{error}</p>
        )}

        <button 
          type="submit"
          className="w-full bg-brand-purple text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-purple/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          Reset <ArrowRight size={20} />
        </button>
      </form>
    </div>
  );

  const renderResetSuccess = () => (
    <div className="text-center py-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
        <Check size={32} />
      </div>
      <h2 className="text-2xl font-bold mb-2">Password reset successful!</h2>
      <p className="text-gray-500 text-sm mb-10 leading-relaxed">
        Your new password is now set.
      </p>
      <button 
        onClick={() => {
          setStep('form');
          setView('login');
        }}
        className="w-full bg-brand-purple text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-purple/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
      >
        Go to login <ArrowRight size={20} />
      </button>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center py-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
        <Check size={32} />
      </div>
      <h2 className="text-2xl font-bold mb-2">Email verified!</h2>
      <p className="text-gray-500 text-sm mb-10 leading-relaxed">
        Your email has been confirmed. You can now continue to view your verification result.
      </p>
      <button 
        onClick={() => {
          onClose();
          onVerified?.({
            email: formData.email,
            name: formData.name || 'User'
          });
        }}
        className="w-full bg-brand-purple text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-purple/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
      >
        Reveal result <ArrowRight size={20} />
      </button>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-brand-dark/40 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[32px] w-full max-w-md p-10 relative shadow-2xl"
      >
        {step !== 'success' && step !== 'reset_success' && (
          <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-brand-dark transition-colors">
            <X size={24} />
          </button>
        )}

        {step === 'form' && renderForm()}
        {step === 'verify' && renderVerify()}
        {step === 'success' && renderSuccess()}
        {step === 'forgot_email' && renderForgotEmail()}
        {step === 'forgot_verify' && renderVerify(true)}
        {step === 'reset_password' && renderResetPassword()}
        {step === 'reset_success' && renderResetSuccess()}
      </motion.div>
    </motion.div>
  );
};

const VerdictPrompt = ({ onAuth }: { onAuth: () => void }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-brand-dark/40 backdrop-blur-sm"
  >
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white rounded-[32px] w-full max-w-md p-10 text-center shadow-2xl"
    >
      <div className="w-16 h-16 bg-brand-purple/10 rounded-full mx-auto mb-6 flex items-center justify-center text-brand-purple">
        <AlertCircle size={32} />
      </div>
      <h2 className="text-2xl font-bold mb-4">Almost there!</h2>
      <p className="text-gray-500 text-sm mb-8 leading-relaxed">
        Sign in or create an account to see your verification result, get a detailed authenticity report, and access your history anytime.
      </p>
      
      <div className="space-y-3">
        <button 
          onClick={onAuth}
          className="w-full bg-brand-purple text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-purple/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Sign in to see results
        </button>
      </div>
    </motion.div>
  </motion.div>
);

const VerdictResult = ({ result, onClose }: { result: VerificationResult, onClose: () => void }) => {
  const isNotFound = result.status === 'not_found';
  const isHigh = result.score >= 85 && !isNotFound;
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-brand-dark/40 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[32px] w-full max-w-md p-10 text-center shadow-2xl relative overflow-y-auto max-h-[90vh]"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-brand-dark">
          <X size={24} />
        </button>
        
        <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${isHigh ? 'bg-green-100 text-green-600' : (isNotFound ? 'bg-gray-100 text-gray-400' : 'bg-red-100 text-red-600')}`}>
          {isHigh ? <CheckSquare size={40} /> : (isNotFound ? <AlertCircle size={40} /> : <ThumbsDown size={40} />)}
        </div>
        <h2 className="text-3xl font-bold mb-2">
          {isNotFound ? 'Not Found' : (isHigh ? "It's Original!" : "Potential Fake")}
        </h2>
        <p className="text-gray-500 text-sm mb-8">
          {isNotFound 
            ? "We couldn't find a matching product in our database."
            : `Our AI analysis confirms this product with ${result.score}% confidence.`
          }
        </p>
        
        <div className="bg-gray-50 rounded-2xl p-6 text-left mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Analysis Report</span>
            <span className={`text-xs font-bold px-2 py-1 rounded ${isHigh ? 'text-green-600 bg-green-50' : (isNotFound ? 'text-gray-400 bg-gray-100' : 'text-red-600 bg-red-50')}`}>
              {isNotFound ? 'Unverified' : (isHigh ? 'Verified' : 'Warning')}
            </span>
          </div>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2 text-gray-600">
              <div className={`w-1.5 h-1.5 rounded-full ${isHigh ? 'bg-green-500' : (isNotFound ? 'bg-gray-300' : 'bg-red-500')}`} />
              {isNotFound ? 'No database match' : 'Packaging dimensions match'}
            </li>
            <li className="flex items-center gap-2 text-gray-600">
              <div className={`w-1.5 h-1.5 rounded-full ${isHigh ? 'bg-green-500' : (isNotFound ? 'bg-gray-300' : 'bg-red-500')}`} />
              {isNotFound ? 'Inconclusive markers' : 'Hologram pattern verified'}
            </li>
          </ul>
        </div>

        <div className="pt-6 border-t border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-sm">Recent Comments</h4>
            <MessageCircle size={16} className="text-gray-400" />
          </div>
          <div className="space-y-4 text-left">
            <div className="bg-gray-50 p-4 rounded-2xl">
              <p className="text-xs text-gray-600 leading-relaxed">
                "Very accurate result. I checked with the manufacturer and they confirmed."
              </p>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 block">Amina B. • 2h ago</span>
            </div>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-brand-purple text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-purple/20"
        >
          Done
        </button>
      </motion.div>
    </motion.div>
  );
};

const AccountDrawer = ({ user, onClose, onLogout }: { user: any, onClose: () => void, onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState<'Profile' | 'Security' | 'Activity' | 'Reward'>('Profile');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const tabs = ['Profile', 'Security', 'Activity', 'Reward'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex justify-end bg-brand-dark/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="bg-white w-full max-w-md h-full shadow-2xl relative overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Account</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={24} className="text-gray-400" />
            </button>
          </div>

          {!showChangePassword ? (
            <>
              <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === tab
                        ? 'bg-brand-purple/10 text-brand-purple'
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                {activeTab === 'Profile' && (
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700 ml-1">Name</label>
                      <div className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-5 text-sm text-gray-900">
                        {user.name || 'User name'}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700 ml-1">Email address</label>
                      <div className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-5 text-sm text-gray-900">
                        {user.email || 'User email address'}
                      </div>
                    </div>
                    <button
                      onClick={onLogout}
                      className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-brand-dark transition-colors pt-4"
                    >
                      <LogOut size={18} /> Log Out
                    </button>
                  </div>
                )}

                {activeTab === 'Security' && (
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
                      <div className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-5 text-sm text-gray-900 tracking-widest">
                        ••••••••
                      </div>
                    </div>
                    <button
                      onClick={() => setShowChangePassword(true)}
                      className="flex items-center justify-end w-full gap-1 text-sm font-medium text-brand-purple hover:underline"
                    >
                      Change password <ArrowRight size={16} />
                    </button>
                  </div>
                )}

                {activeTab === 'Activity' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <span className="text-sm text-gray-500">Products verified</span>
                      <span className="text-sm font-bold">54</span>
                    </div>
                  </div>
                )}

                {activeTab === 'Reward' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <span className="text-sm text-gray-500">Rank</span>
                      <span className="text-sm font-bold">#34 of 5,812 players</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <span className="text-sm text-gray-500">Point</span>
                      <span className="text-sm font-bold">24pts</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <span className="text-sm text-gray-500">Streak</span>
                      <span className="text-sm font-bold">4-days</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <button onClick={() => setShowChangePassword(false)} className="text-gray-400 hover:text-brand-dark">
                  <ArrowRight className="rotate-180" size={24} />
                </button>
                <h3 className="text-xl font-bold">Change password</h3>
              </div>

              {passwordStatus === 'success' ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-brand-purple/10 rounded-full flex items-center justify-center text-brand-purple mx-auto mb-6">
                    <Check size={32} />
                  </div>
                  <h4 className="text-xl font-bold mb-2">Password change successful!</h4>
                  <p className="text-gray-500 text-sm">Your new password is now set.</p>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  if (formData.get('current') === 'wrong') {
                    setPasswordStatus('error');
                  } else {
                    setPasswordStatus('success');
                  }
                }}>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 ml-1">Current password</label>
                    <div className="relative">
                      <input
                        name="current"
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all pr-12"
                        required
                      />
                      <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    </div>
                    {passwordStatus === 'error' && (
                      <p className="text-red-500 text-xs font-medium ml-1">The password you entered is invalid.</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 ml-1">New password</label>
                    <div className="relative">
                      <input
                        name="new"
                        type="password"
                        placeholder="Enter password"
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all pr-12"
                        required
                      />
                      <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 ml-1">Confirm new password</label>
                    <div className="relative">
                      <input
                        name="confirm"
                        type="password"
                        placeholder="Enter password"
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all pr-12"
                        required
                      />
                      <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-purple text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-purple/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                  >
                    Change password <ArrowRight size={20} />
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const Navbar = ({ user, onLogin, onTryFree, onPlayGame, onOpenAccount }: { 
  user: any, 
  onLogin: () => void, 
  onTryFree: () => void, 
  onPlayGame: () => void,
  onOpenAccount: () => void
}) => (
  <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-brand-purple rounded-full" />
    </div>
    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
      <button onClick={onPlayGame} className="hover:text-brand-purple transition-colors">Play game</button>
      <a href="#" className="hover:text-brand-purple transition-colors">Contact</a>
      {!user && (
        <button onClick={onLogin} className="hover:text-brand-purple transition-colors">Sign in</button>
      )}
    </div>
    {user ? (
      <button 
        onClick={onOpenAccount}
        className="flex items-center gap-2 text-brand-dark font-bold hover:text-brand-purple transition-colors"
      >
        <div className="w-10 h-10 bg-brand-purple/10 rounded-full flex items-center justify-center text-brand-purple">
          <User size={20} />
        </div>
        <span className="hidden sm:inline">{user.name}</span>
      </button>
    ) : (
      <button 
        onClick={onTryFree}
        className="px-6 py-2 border border-brand-purple text-brand-purple rounded-full text-sm font-medium hover:bg-brand-purple hover:text-white transition-all flex items-center gap-2"
      >
        Try it for free <ArrowRight size={16} />
      </button>
    )}
  </nav>
);

const Hero = ({ onUpload }: { onUpload: () => void }) => (
  <section className="pt-16 pb-24 px-6 text-center max-w-4xl mx-auto">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100 mb-8"
    >
      <span className="text-sm">🇳🇬</span>
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nigeria's #1 originality checker</span>
    </motion.div>
    
    <motion.h1 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]"
    >
      You just bought it? <br />
      Now check if it's <span className="text-brand-purple font-serif italic relative">original
        <motion.div 
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 12 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="absolute -top-6 -right-16 border-2 border-brand-purple text-brand-purple text-[10px] font-black px-2 py-1 rounded-sm leading-none tracking-tighter"
        >
          QUALITY<br/>ORIGINAL<br/>QUALITY
        </motion.div>
      </span>
    </motion.h1>

    <motion.button 
      onClick={onUpload}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="bg-brand-purple text-white px-8 py-4 rounded-full font-semibold flex items-center gap-3 mx-auto shadow-lg shadow-brand-purple/20"
    >
      <Upload size={20} />
      Upload image
    </motion.button>
  </section>
);

const HowItWorks = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const steps = [
    {
      title: "Snap & upload",
      desc: "Capture all sides of the product and submit it for review.",
      icon: <Maximize size={32} className="text-gray-300" />,
      img: "https://picsum.photos/seed/scan1/800/1000"
    },
    {
      title: "Smart AI analysis",
      desc: "Our AI analyzes packaging design, labels, NAFDAC data and other identifiers against verified records.",
      icon: <Sparkles size={32} className="text-gray-300" />,
      img: "https://picsum.photos/seed/scan2/800/1000"
    },
    {
      title: "Instant clarity",
      desc: "Know immediately if it's authentic or potentially fake.",
      icon: <CheckSquare size={32} className="text-gray-300" />,
      img: "https://picsum.photos/seed/scan3/800/1000"
    }
  ];

  return (
    <section className="bg-brand-purple py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-white text-4xl md:text-5xl font-bold text-center mb-16">
          How it works in <br /> 3 simple steps
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <motion.div 
              key={idx}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="bg-white rounded-3xl p-8 h-[400px] flex flex-col justify-between relative overflow-hidden group cursor-pointer"
            >
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-full border border-brand-purple/20 flex items-center justify-center text-brand-purple font-bold mb-6">
                  {idx + 1}
                </div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">
                  {step.desc}
                </p>
              </div>
              
              <div className="flex justify-end relative z-10">
                {step.icon}
              </div>

              {/* Hover Image Overlay */}
              <AnimatePresence>
                {hoveredIndex === idx && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20"
                  >
                    <img 
                      src={step.img} 
                      alt={step.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-8 text-center">
                       {idx === 0 && (
                         <div className="border-2 border-white/50 w-32 h-48 rounded-lg flex items-center justify-center">
                            <Camera className="text-white" size={40} />
                         </div>
                       )}
                       {idx === 1 && (
                         <div className="space-y-4 w-full">
                            <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                               <motion.div 
                                 initial={{ x: '-100%' }}
                                 animate={{ x: '100%' }}
                                 transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                                 className="h-full bg-white w-1/3"
                               />
                            </div>
                            <div className="text-white font-mono text-[10px] opacity-70">ANALYZING_NAFDAC_RECORDS...</div>
                         </div>
                       )}
                       {idx === 2 && (
                         <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                               <CheckSquare className="text-white" />
                            </div>
                            <div className="text-white font-bold">99% ORIGINAL</div>
                         </div>
                       )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Stats = () => (
  <section className="py-24 px-6 max-w-7xl mx-auto">
    <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
      <span className="text-brand-purple font-serif italic">The numbers</span> of <br /> everyday life
    </h2>
    
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div className="bg-gray-50 rounded-3xl p-10 relative overflow-hidden">
        <h3 className="text-3xl font-bold mb-4">₦100 billion+</h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          Counterfeit and substandard products seized and destroyed across Nigeria in by NAFDAC & SON.
        </p>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-purple/5 rounded-full blur-3xl" />
      </div>
      
      <div className="bg-gray-50 rounded-3xl p-10 relative overflow-hidden">
        <h3 className="text-3xl font-bold mb-4">4,000+</h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          Illegal drug outlets sealed nationwide during enforcement drives.
        </p>
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <div className="w-24 h-24 border-t-2 border-r-2 border-brand-purple rotate-45" />
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-3xl p-10 relative overflow-hidden md:col-span-2 lg:col-span-1">
        <h3 className="text-3xl font-bold mb-4">20+</h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          States targeted in coordinated anti-counterfeit operations.
        </p>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-brand-purple/5 to-transparent" />
      </div>
    </div>
  </section>
);

const Testimonials = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const testimonials = [
    {
      name: "Amara, 23",
      text: "“I bought a popular skincare serum online and something felt off. I searched it here and saw the packaging differences immediately. It turned out to be fake. This platform saved my skin.”",
      img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Abdul, 42",
      text: "“I always worry about fake medicines for my kids. Being able to check the product before using it gives me peace of mind. Every parent in Nigeria needs this.”",
      img: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Tunde, 29",
      text: "“I bought a phone charger that looked original but kept overheating. After checking here, I realized it wasn't authentic. Now I verify before I buy anything tech.”",
      img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    <section className="py-24 px-6 bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          How we are keeping <br /> <span className="text-brand-purple font-serif italic">Nigerians safe</span>
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div 
              key={idx}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="bg-white rounded-3xl p-10 h-[320px] flex flex-col justify-between relative overflow-hidden group cursor-pointer border border-gray-100"
            >
              <div className="relative z-10">
                <MessageCircle size={24} className="text-gray-300 mb-6" />
                <p className="text-gray-600 text-sm leading-relaxed italic">
                  {t.text}
                </p>
              </div>
              
              <div className="relative z-10">
                <p className="font-bold text-gray-400 text-xs">{t.name}</p>
              </div>

              {/* Hover Image Overlay */}
              <AnimatePresence>
                {hoveredIndex === idx && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20"
                  >
                    <img 
                      src={t.img} 
                      alt={t.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                       <p className="text-white font-bold text-lg mb-1">{t.name}</p>
                       <p className="text-white/70 text-xs line-clamp-2">{t.text}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="bg-brand-purple py-20 px-6 text-white">
    <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
      <div className="col-span-2">
        <div className="w-12 h-12 bg-white rounded-full mb-8" />
      </div>
      
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-6">Quick Links</h4>
        <ul className="space-y-4 text-sm font-medium">
          <li><a href="#" className="hover:text-white/70 transition-colors">Play game</a></li>
          <li><a href="#" className="hover:text-white/70 transition-colors">Contact</a></li>
          <li><a href="#" className="hover:text-white/70 transition-colors">Terms</a></li>
          <li><a href="#" className="hover:text-white/70 transition-colors">Privacy policy</a></li>
        </ul>
      </div>
      
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-6">Socials</h4>
        <ul className="space-y-4 text-sm font-medium">
          <li><a href="#" className="hover:text-white/70 transition-colors flex items-center gap-2"><Twitter size={14} /> Twitter</a></li>
          <li><a href="#" className="hover:text-white/70 transition-colors flex items-center gap-2"><Linkedin size={14} /> Linkedin</a></li>
          <li><a href="#" className="hover:text-white/70 transition-colors flex items-center gap-2"><Instagram size={14} /> Tiktok</a></li>
          <li><a href="#" className="hover:text-white/70 transition-colors flex items-center gap-2"><Facebook size={14} /> Facebook</a></li>
        </ul>
      </div>
    </div>
  </footer>
);

// --- Components ---

const UploadPage = ({ onVerify, onBack }: { onVerify: () => void, onBack: () => void }) => {
  const [onlyTwoSides, setOnlyTwoSides] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [steps, setSteps] = useState<UploadStep[]>([
    { id: 'front', label: 'Front view', image: null, status: 'idle', progress: 0 },
    { id: 'back', label: 'Back view', image: null, status: 'idle', progress: 0 },
    { id: 'left', label: 'Left view', image: null, status: 'idle', progress: 0 },
    { id: 'right', label: 'Right view', image: null, status: 'idle', progress: 0 },
  ]);

  const activeSteps = onlyTwoSides 
    ? steps.filter(s => s.id === 'front' || s.id === 'back')
    : steps;

  const currentStep = activeSteps[currentStepIdx] || activeSteps[0];

  const handleUpload = (stepId: string) => {
    // Update status to uploading
    setSteps(prev => prev.map(s => s.id === stepId ? { ...s, status: 'uploading', progress: 0 } : s));

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Mark as complete
        setSteps(prev => prev.map(s => s.id === stepId ? { 
          ...s, 
          status: 'complete', 
          progress: 100, 
          image: 'https://images.unsplash.com/photo-1626544823126-666c5517033a?auto=format&fit=crop&w=800&q=80' // Placeholder product image
        } : s));

        // Automatic next: find the next idle step
        setTimeout(() => {
          setCurrentStepIdx(prev => {
            // Try to find the next idle step after current
            const nextIdleAfter = activeSteps.findIndex((s, i) => i > prev && s.status === 'idle');
            if (nextIdleAfter !== -1) return nextIdleAfter;
            
            // If none after, try to find any idle step from the beginning
            const anyIdle = activeSteps.findIndex(s => s.status === 'idle');
            if (anyIdle !== -1) return anyIdle;
            
            // If all done or no idle steps, stay on current
            return prev;
          });
        }, 2000);
      } else {
        setSteps(prev => prev.map(s => s.id === stepId ? { ...s, progress } : s));
      }
    }, 400);
  };

  const handleDelete = (stepId: string) => {
    setSteps(prev => prev.map(s => s.id === stepId ? { ...s, status: 'idle', progress: 0, image: null } : s));
  };

  const allDone = activeSteps.every(s => s.status === 'complete');

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Upload your product</h1>
          <p className="text-gray-500">Upload clear photos of your product for a reliable analysis.</p>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-12 items-start">
          {/* Sidebar */}
          <div className="space-y-4">
            {activeSteps.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setCurrentStepIdx(idx)}
                className={`w-full p-6 rounded-3xl text-left transition-all flex items-center justify-between border-2 ${
                  currentStepIdx === idx 
                    ? 'border-brand-purple bg-white shadow-lg' 
                    : 'border-transparent bg-gray-50 text-gray-400'
                }`}
              >
                <span className={`font-bold ${currentStepIdx === idx ? 'text-brand-dark' : ''}`}>
                  {step.label}
                </span>
                {step.status === 'complete' && (
                  <CheckSquare size={20} className="text-brand-purple" />
                )}
              </button>
            ))}
          </div>

          {/* Main Upload Area */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                  <Maximize size={18} className="text-gray-400" />
                </div>
                <span className="font-bold text-lg">{currentStep.label}</span>
              </div>
              
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={onlyTwoSides}
                    onChange={(e) => {
                      setOnlyTwoSides(e.target.checked);
                      setCurrentStepIdx(0);
                    }}
                  />
                  <div className={`w-5 h-5 border-2 rounded transition-all ${onlyTwoSides ? 'bg-brand-purple border-brand-purple' : 'border-gray-300 group-hover:border-brand-purple'}`}>
                    {onlyTwoSides && <CheckSquare size={14} className="text-white" />}
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-500">My product only has 2 sides</span>
              </label>
            </div>

            <div className="relative aspect-[16/9] md:aspect-auto md:h-[500px] border-2 border-dashed border-gray-200 rounded-[40px] flex items-center justify-center overflow-hidden bg-gray-50">
              <AnimatePresence mode="wait">
                {currentStep.status === 'idle' && (
                  <motion.button
                    key="idle"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => handleUpload(currentStep.id)}
                    className="bg-brand-purple/5 text-brand-purple px-10 py-6 rounded-3xl flex flex-col items-center gap-3 hover:bg-brand-purple/10 transition-all"
                  >
                    <Upload size={24} />
                    <span className="font-bold">Click to upload</span>
                  </motion.button>
                )}

                {currentStep.status === 'uploading' && (
                  <motion.div
                    key="uploading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full max-w-sm px-8"
                  >
                    <div className="flex justify-between items-end mb-4">
                      <span className="text-sm font-bold text-gray-400">Loading...</span>
                      <span className="text-sm font-bold text-gray-400">{Math.round(currentStep.progress)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-brand-dark"
                        initial={{ width: 0 }}
                        animate={{ width: `${currentStep.progress}%` }}
                      />
                    </div>
                  </motion.div>
                )}

                {currentStep.status === 'complete' && currentStep.image && (
                  <motion.div
                    key="complete"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full relative group"
                  >
                    <img 
                      src={currentStep.image} 
                      alt="Uploaded" 
                      className="w-full h-full object-contain p-8"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-8 right-8 flex gap-4">
                      <button 
                        onClick={() => handleDelete(currentStep.id)}
                        className="w-12 h-12 bg-white shadow-xl rounded-2xl flex items-center justify-center text-red-500 hover:bg-red-50 transition-all"
                      >
                        <X size={24} />
                      </button>
                    </div>
                    
                    {/* Success Overlay */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-sm px-8">
                       <div className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100">
                          <div className="flex justify-between items-end mb-4">
                            <span className="text-sm font-bold text-gray-400">Complete</span>
                            <span className="text-sm font-bold text-gray-400">100%</span>
                          </div>
                          <div className="h-2 bg-brand-purple rounded-full" />
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {allDone && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={onVerify}
                className="w-full bg-brand-purple text-white py-6 rounded-[32px] font-bold text-xl flex items-center justify-center gap-3 shadow-2xl shadow-brand-purple/30 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                Verify now <ArrowRight size={24} />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Types ---
type VerificationResult = {
  score: number;
  confidence: 'High' | 'Low' | 'None';
  status: 'found' | 'not_found';
  id: string;
  date: string;
  images: string[];
};

// --- Components ---

const AnalysisModal = ({ progress, stage }: { progress: number, stage: string }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[60] flex items-center justify-center bg-brand-dark/60 backdrop-blur-md p-6"
  >
    <div className="bg-white rounded-[40px] p-12 text-center max-w-md w-full shadow-2xl">
      <h3 className="text-2xl font-bold mb-2">{stage}</h3>
      <p className="text-gray-500 text-sm mb-8">Just a moment, this usually takes 5–10 seconds.</p>
      
      <div className="w-full">
        <div className="flex justify-between items-end mb-4">
          <span className="text-sm font-bold text-gray-400">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-brand-dark"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  </motion.div>
);

const SubmissionSuccessPage = ({ onReset, onPlayGame }: { onReset: () => void, onPlayGame: () => void }) => (
  <div className="min-h-screen bg-gray-50/30 py-24 px-6">
    <div className="max-w-3xl mx-auto space-y-12">
      {/* Success Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[40px] p-12 text-center shadow-sm border border-gray-100"
      >
        <h2 className="text-3xl font-bold mb-4">Thank you for your submission.</h2>
        <p className="text-gray-500 text-sm max-w-md mx-auto mb-10 leading-relaxed">
          Our team will verify the official product version, and you'll be notified via email once it's added to our database.
        </p>
        
        <button 
          onClick={onReset}
          className="w-full bg-brand-purple text-white py-5 rounded-3xl font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-brand-purple/20"
        >
          Verify another product <ArrowRight size={20} />
        </button>
      </motion.div>

      {/* Game Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-brand-purple rounded-[40px] p-12 text-center text-white relative overflow-hidden group cursor-pointer"
        onClick={onPlayGame}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/20">
            <Sparkles size={32} />
          </div>
          <h3 className="text-4xl font-bold mb-4">Spot the original</h3>
          <p className="text-white/70 mb-10 max-w-sm">
            Think you can tell the real from the fake? Prove it and earn points.
          </p>
          
          <button className="bg-white text-brand-purple px-12 py-4 rounded-full font-bold flex items-center gap-3 hover:bg-gray-100 transition-all">
            Play now <ArrowRight size={20} />
          </button>
        </div>
      </motion.div>
    </div>
  </div>
);

const LeaderboardDrawer = ({ onClose, currentRank, totalPlayers }: { onClose: () => void, currentRank: number, totalPlayers: number }) => {
  const topSpotters = [
    { rank: 1, name: "Sarah Jenkins", points: 1250, color: "bg-brand-purple/10", iconColor: "text-brand-purple" },
    { rank: 2, name: "Michael Chen", points: 1100, color: "bg-pink-50", iconColor: "text-pink-500" },
    { rank: 3, name: "Elena Rodriguez", points: 950, color: "bg-green-50", iconColor: "text-green-500" },
    { rank: 4, name: "David Kim", points: 820 },
    { rank: 5, name: "Aisha Bello", points: 750 },
    { rank: 6, name: "James Wilson", points: 680 },
    { rank: 7, name: "Yuki Tanaka", points: 610 },
    { rank: 8, name: "Olivia Brown", points: 540 },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
      >
        <div className="p-8 flex items-center justify-between border-b border-gray-50">
          <h2 className="text-2xl font-bold font-serif italic">Leaderboard</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        <div className="p-8 flex-1 overflow-y-auto">
          {/* Current User Rank */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg">Name Of Account Owner</h3>
              <p className="text-gray-500 text-sm font-medium">#{currentRank} of {totalPlayers.toLocaleString()} players</p>
            </div>
          </div>

          <h4 className="font-bold text-lg mb-6">Top spotters</h4>
          
          <div className="space-y-3">
            {topSpotters.map((spotter) => (
              <div 
                key={spotter.rank}
                className={`flex items-center justify-between p-4 rounded-2xl transition-all ${spotter.color || 'bg-gray-50/50 hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 flex justify-center">
                    {spotter.rank <= 3 ? (
                      <Trophy size={20} className={spotter.iconColor} />
                    ) : (
                      <span className="font-bold text-gray-400">#{spotter.rank}</span>
                    )}
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <span className="font-bold text-gray-700">{spotter.name}</span>
                </div>
                <span className="text-sm font-bold text-gray-400">{spotter.points} Pts</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const StreakModal = ({ streak, onClose }: { streak: number, onClose: () => void }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm"
  >
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white rounded-[40px] p-10 max-w-md w-full text-center relative overflow-hidden shadow-2xl"
    >
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-brand-purple/5 to-transparent -z-10" />
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-purple/5 rounded-full blur-2xl" />
      
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X size={20} />
      </button>

      <div className="flex flex-col items-center">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🔥</span>
          <h2 className="text-3xl font-bold">{streak}-day streak!</h2>
        </div>
        
        <p className="text-gray-500 mb-10 leading-relaxed">
          You've correctly spotted originals for {streak} days straight. Keep the streak alive and climb the leaderboard.
        </p>

        {/* Streak Tracker */}
        <div className="flex items-center justify-between w-full mb-10 px-2">
          {[2, 3, 4, 5, 6, 7].map((day) => (
            <div key={day} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                day <= streak 
                  ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/20' 
                  : 'bg-gray-50 text-gray-300 border border-gray-100'
              }`}>
                {day <= streak ? <Check size={18} /> : <span className="text-xs font-bold">{day}</span>}
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Day {day}</span>
            </div>
          ))}
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-brand-purple text-white py-5 rounded-3xl font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-brand-purple/20"
        >
          Keep playing <ArrowRight size={20} />
        </button>
      </div>
    </motion.div>
  </motion.div>
);

const GamePage = ({ onBack }: { onBack: () => void }) => {
  const [points, setPoints] = useState(12);
  const [streak, setStreak] = useState(6);
  const [rank, setRank] = useState(34);
  const [totalPlayers, setTotalPlayers] = useState(5812);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [gameState, setGameState] = useState<'playing' | 'correct' | 'wrong'>('playing');
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<{ id: number, img: string, isOriginal: boolean }[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const generateGameImages = async () => {
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Generate Original
      const originalResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ text: 'A high quality professional studio photograph of a premium medicine product box, authentic packaging, clear labels, NAFDAC number, hologram seal, white background, centered, filling the frame' }],
        config: { imageConfig: { aspectRatio: "1:1" } }
      });

      // Generate Fake
      const fakeResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ text: 'A high quality professional studio photograph of a counterfeit medicine product box, slightly blurry labels, missing hologram, generic packaging, white background, centered, filling the frame' }],
        config: { imageConfig: { aspectRatio: "1:1" } }
      });

      const originalImg = originalResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
      const fakeImg = fakeResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;

      if (originalImg && fakeImg) {
        const newProducts = [
          { id: 1, img: `data:image/png;base64,${originalImg}`, isOriginal: true },
          { id: 2, img: `data:image/png;base64,${fakeImg}`, isOriginal: false }
        ].sort(() => Math.random() - 0.5); // Shuffle
        setProducts(newProducts);
      } else {
        // Fallback if generation fails
        setProducts([
          { id: 1, img: "https://images.unsplash.com/photo-1563636619-e9108b9355bb?auto=format&fit=crop&w=800&q=80", isOriginal: true },
          { id: 2, img: "https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?auto=format&fit=crop&w=800&q=80", isOriginal: false },
        ]);
      }
    } catch (error) {
      console.error("Error generating game images:", error);
      setProducts([
        { id: 1, img: "https://images.unsplash.com/photo-1563636619-e9108b9355bb?auto=format&fit=crop&w=800&q=80", isOriginal: true },
        { id: 2, img: "https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?auto=format&fit=crop&w=800&q=80", isOriginal: false },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateGameImages();
    
    // Initialize audio
    const audio = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
    audio.loop = true;
    audioRef.current = audio;

    const playAudio = () => {
      audio.play().catch(err => {
        console.log("Autoplay blocked, waiting for interaction", err);
      });
    };

    playAudio();

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
      setIsMuted(!isMuted);
    }
  };

  const handleCheck = () => {
    if (selectedId === null) return;
    
    const selectedProduct = products.find(p => p.id === selectedId);
    
    if (selectedProduct && selectedProduct.isOriginal) {
      setGameState('correct');
      setPoints(prev => prev + 10);
      setTimeout(() => setShowStreakModal(true), 500);
    } else {
      setGameState('wrong');
    }
  };

  const handleNext = () => {
    setGameState('playing');
    setSelectedId(null);
    generateGameImages();
  };

  const handleTryAgain = () => {
    setGameState('playing');
    setSelectedId(null);
    generateGameImages();
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Game Header Stats - Only show in playing or correct state */}
      {gameState !== 'wrong' && (
        <div className="max-w-7xl mx-auto px-6 py-8 border-b border-gray-100 flex items-center justify-between text-sm font-medium text-gray-500">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-brand-purple" />
            <span>{points} points</span>
          </div>
          <div className="h-8 w-px bg-gray-100 hidden md:block" />
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-brand-purple" />
            <span>#{rank} of {totalPlayers.toLocaleString()} players</span>
            <button 
              onClick={() => setShowLeaderboard(true)}
              className="text-brand-purple ml-2 flex items-center gap-1 hover:underline"
            >
              Leaderboard <ArrowRight size={14} />
            </button>
          </div>
          <div className="h-8 w-px bg-gray-100 hidden md:block" />
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-brand-purple" />
            <span>{streak} days streak</span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 pt-16 text-center">
        {gameState === 'playing' && (
          <>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-serif italic">Spot the original</h1>
            <p className="text-gray-500 mb-16">One of these products is authentic. Tap the one you think is original.</p>
          </>
        )}

        {gameState === 'correct' && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-serif italic">Yes! <br /> You spotted the original.</h1>
            <p className="text-gray-500 mb-16 max-w-lg mx-auto">Good eye. You correctly identified the authentic product. Keep going to climb the leaderboard.</p>
          </motion.div>
        )}

        {gameState === 'wrong' && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-serif italic">Oh no! <br /> That is not the original.</h1>
            <p className="text-gray-500 mb-16 max-w-lg mx-auto">Review the differences below to see what revealed the fake.</p>
          </motion.div>
        )}

        {/* Comparison Labels for Wrong State */}
        {gameState === 'wrong' && (
          <div className="grid md:grid-cols-2 gap-8 mb-4">
            <div className="text-red-500 font-bold text-xl">Fake</div>
            <div className="text-brand-purple font-bold text-xl">Original</div>
          </div>
        )}

        <div className={`grid md:grid-cols-[1fr_auto] gap-12 items-center mb-12 ${gameState === 'wrong' ? 'md:grid-cols-2' : ''}`}>
          <div className={`grid gap-8 ${gameState === 'wrong' ? 'grid-cols-2 col-span-2' : 'grid-cols-1'}`}>
            {gameState === 'playing' && (
              <div className="grid md:grid-cols-2 gap-8">
                {isLoading ? (
                  [1, 2].map(i => (
                    <div key={i} className="bg-gray-50 rounded-[40px] p-12 aspect-square flex flex-col items-center justify-center gap-4 animate-pulse">
                      <Loader2 className="animate-spin text-brand-purple" size={32} />
                      <span className="text-sm font-bold text-gray-400">Generating boxes...</span>
                    </div>
                  ))
                ) : (
                  products.map((p) => (
                    <motion.div
                      key={p.id}
                      onClick={() => setSelectedId(p.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`bg-gray-50 rounded-[40px] p-4 aspect-square relative cursor-pointer group border-2 transition-all ${
                        selectedId === p.id ? 'border-brand-purple' : 'border-transparent'
                      }`}
                    >
                      <div className={`absolute top-6 right-6 w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all z-10 ${
                        selectedId === p.id ? 'bg-brand-purple border-brand-purple' : 'border-gray-200 group-hover:border-brand-purple'
                      }`}>
                        {selectedId === p.id ? (
                          <Check size={20} className="text-white" />
                        ) : (
                          <Square size={20} className="text-transparent group-hover:text-brand-purple/20" />
                        )}
                      </div>
                      <img 
                        src={p.img} 
                        alt="Product" 
                        className="w-full h-full object-cover rounded-[32px]"
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {gameState === 'correct' && (
              <div className="flex flex-col md:flex-row items-center gap-12 text-left">
                <div className="bg-brand-purple/5 rounded-[40px] p-4 aspect-square relative border-2 border-brand-purple w-full max-w-sm">
                  <div className="absolute top-6 right-6 w-8 h-8 rounded-lg bg-brand-purple flex items-center justify-center z-10">
                    <Check size={20} className="text-white" />
                  </div>
                  <img 
                    src={products.find(p => p.isOriginal)?.img} 
                    alt="Original Product" 
                    className="w-full h-full object-cover rounded-[32px]"
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">🎊</span>
                    <span className="text-3xl font-bold">+10 points earned!</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-gray-500 font-medium">
                      <Zap size={20} className="text-brand-purple" />
                      <span>{points} points</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-500 font-medium">
                      <Trophy size={20} className="text-brand-purple" />
                      <span>#{rank} of {totalPlayers.toLocaleString()} players</span>
                      <button 
                        onClick={() => setShowLeaderboard(true)}
                        className="text-brand-purple ml-1 hover:underline text-sm"
                      >
                        Leaderboard ›
                      </button>
                    </div>
                    <div className="flex items-center gap-3 text-gray-500 font-medium">
                      <Flame size={20} className="text-brand-purple" />
                      <span>{streak} days streak</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {gameState === 'wrong' && (
              <>
                {/* Comparison View */}
                <div className="bg-red-50 rounded-[40px] p-4 aspect-square relative border-2 border-red-500">
                  <div className="absolute top-6 right-6 w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center z-10">
                    <X size={20} className="text-white" />
                  </div>
                  <img 
                    src={products.find(p => !p.isOriginal)?.img} 
                    alt="Fake Product" 
                    className="w-full h-full object-cover rounded-[32px] opacity-80"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="bg-brand-purple/5 rounded-[40px] p-4 aspect-square relative border-2 border-brand-purple">
                  <div className="absolute top-6 right-6 w-8 h-8 rounded-lg bg-brand-purple flex items-center justify-center z-10">
                    <Check size={20} className="text-white" />
                  </div>
                  <img 
                    src={products.find(p => p.isOriginal)?.img} 
                    alt="Original Product" 
                    className="w-full h-full object-cover rounded-[32px]"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Key Differences */}
                <div className="col-span-2 bg-gray-50/50 rounded-[32px] p-8 text-left">
                  <h3 className="font-bold text-lg mb-6">Key differences</h3>
                  <ul className="space-y-4">
                    {[
                      "Logo placement differs from official packaging",
                      "Text alignment and spacing are inconsistent",
                      "Manufacturer details do not match verified records"
                    ].map((diff, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                        <Check size={16} className="text-brand-purple mt-0.5 shrink-0" />
                        {diff}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>

        <AnimatePresence>
          {gameState === 'playing' && selectedId && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={handleCheck}
              className="w-full bg-brand-purple text-white py-5 rounded-3xl font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-brand-purple/20"
            >
              Am I right? <ArrowRight size={20} />
            </motion.button>
          )}

          {gameState === 'correct' && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleNext}
              className="w-full bg-brand-purple text-white py-5 rounded-3xl font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-brand-purple/20"
            >
              Next round <ArrowRight size={20} />
            </motion.button>
          )}

          {gameState === 'wrong' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row gap-4"
            >
              <button
                onClick={handleTryAgain}
                className="flex-1 bg-brand-purple/5 text-brand-purple py-5 rounded-3xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-brand-purple/10 transition-all"
              >
                Try again <ArrowRight size={20} />
              </button>
              <button
                onClick={handleNext}
                className="flex-1 bg-brand-purple text-white py-5 rounded-3xl font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-brand-purple/20"
              >
                Next round <ArrowRight size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Music Toggle */}
        <button 
          onClick={toggleMute}
          className="fixed bottom-12 right-12 w-14 h-14 bg-brand-purple/10 text-brand-purple rounded-full flex items-center justify-center hover:bg-brand-purple/20 transition-all shadow-lg backdrop-blur-md border border-brand-purple/20"
        >
          {isMuted ? <VolumeX size={24} /> : <Music size={24} />}
        </button>

        {/* Streak Modal */}
        <AnimatePresence>
          {showStreakModal && (
            <StreakModal 
              streak={streak} 
              onClose={() => setShowStreakModal(false)} 
            />
          )}
        </AnimatePresence>

        {/* Leaderboard Drawer */}
        <AnimatePresence>
          {showLeaderboard && (
            <LeaderboardDrawer 
              onClose={() => setShowLeaderboard(false)} 
              currentRank={rank}
              totalPlayers={totalPlayers}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ResultPage = ({ result, onBack, onSubmitReview }: { result: VerificationResult, onBack: () => void, onSubmitReview: () => void }) => {
  const [comments, setComments] = useState<{id: string, user: string, text: string, date: string}[]>([
    { id: '1', user: 'Chima O.', text: 'This matches the packaging I saw in the pharmacy perfectly. Very helpful!', date: '2 hours ago' },
    { id: '2', user: 'Amina B.', text: 'I was worried about the batch number, but this confirmed it for me.', date: '5 hours ago' }
  ]);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const comment = {
      id: Date.now().toString(),
      user: 'You',
      text: newComment,
      date: 'Just now'
    };
    
    setComments([comment, ...comments]);
    setNewComment('');
  };

  const isNotFound = result.status === 'not_found';
  const isHigh = result.score >= 85 && !isNotFound;
  const colorClass = isNotFound ? 'text-gray-600 bg-gray-50' : (isHigh ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50');
  const ringColor = isNotFound ? '#9CA3AF' : (isHigh ? '#10B981' : '#EF4444');

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="max-w-7xl mx-auto px-6 pt-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {isNotFound ? 'Product not found' : 'AI verification result'}
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            {isNotFound 
              ? "We couldn't find a matching product in our verified database. This could be a new product or a potential counterfeit."
              : "Your upload was verified against current and past approved packaging, NAFDAC records and other key authenticity markers."
            }
          </p>
        </div>

        <div className="grid lg:grid-cols-[400px_1fr] gap-16 items-start">
          {/* Left: Image Preview */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-[40px] p-8 aspect-square flex items-center justify-center relative overflow-hidden">
              <img 
                src={result.images[0]} 
                alt="Product" 
                className="w-full h-full object-contain rounded-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-gray-400' : 'bg-gray-200'}`} />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="space-y-12">
            {/* Score Circle */}
            <div className="flex flex-col items-center lg:items-start">
              <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    fill="none"
                    stroke="#F3F4F6"
                    strokeWidth="12"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="88"
                    fill="none"
                    stroke={ringColor}
                    strokeWidth="12"
                    strokeDasharray={552.92}
                    initial={{ strokeDashoffset: 552.92 }}
                    animate={{ strokeDashoffset: 552.92 - (552.92 * result.score) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className={`absolute inset-0 flex flex-col items-center justify-center rounded-full ${colorClass.split(' ')[1]}`}>
                  <span className={`text-5xl font-bold ${colorClass.split(' ')[0]}`}>{result.score}%</span>
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider mt-1">Originality<br/>score</span>
                </div>
              </div>

              <div className="text-center lg:text-left">
                <h3 className="text-xl font-bold mb-2">
                  {isNotFound ? 'Confidence level: None' : `Confidence level: ${result.confidence}`}
                </h3>
                <p className="text-gray-500 text-sm max-w-md">
                  {isNotFound 
                    ? "Our AI could not find any matching product records. This product is not currently in our verified database."
                    : (isHigh 
                      ? "Scores of 85% and above indicate a strong match therefore this product matches verified authenticity records."
                      : "Scores below 85% indicate a weak match therefore this product does not match verified authenticity records."
                    )
                  }
                </p>
              </div>
            </div>

            {/* Summary Section */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold">Verification summary</h3>
              
              <div className="bg-gray-50 rounded-[40px] p-10 space-y-10">
                {isNotFound ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <AlertCircle size={48} className="text-gray-300 mb-4" />
                    <h4 className="font-bold text-lg mb-2">No database match</h4>
                    <p className="text-gray-500 text-sm max-w-sm">
                      We've cross-referenced your images with over 50,000 verified product records and couldn't find a definitive match for this packaging.
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <h4 className="font-bold mb-6">What was verified</h4>
                      <ul className="grid md:grid-cols-2 gap-4">
                        {[
                          "Packaging layout matches verified records",
                          "Logo placement and typography consistent",
                          "NAFDAC number format valid",
                          "Manufacturer details align with database",
                          "Security seal detected and correctly positioned",
                          "Batch and expiry formatting consistent"
                        ].map((item, i) => (
                          <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                            <Check size={16} className="text-brand-purple" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {!isHigh && (
                      <div>
                        <h4 className="font-bold mb-6">Differences detected</h4>
                        <ul className="grid md:grid-cols-2 gap-4">
                          {[
                            "Color tone variation (may vary by batch)",
                            "Spacing difference in text alignment",
                            "Small packaging dimension variation",
                            "Hologram reflection angle slightly different",
                            "Print sharpness variation within acceptable range",
                            "Batch code placement slightly shifted"
                          ].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                              <Check size={16} className="text-red-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Meaning Section */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">What this means for you</h3>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isHigh ? 'text-green-600' : (isNotFound ? 'text-gray-400' : 'text-red-600')}`}>
                  {isHigh ? <ThumbsUp size={24} /> : (isNotFound ? <AlertCircle size={24} /> : <ThumbsDown size={24} />)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed pt-2">
                  {isNotFound
                    ? "Exercise extreme caution. This product is unverified. We recommend checking with the manufacturer directly or purchasing from an authorized distributor."
                    : (isHigh 
                      ? "You can proceed with confidence, always purchase from trusted vendors and retain receipts for traceability."
                      : "Do not proceed without further verification. Confirm further with trusted authority/vendor before use."
                    )
                  }
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4 pt-4">
              {isNotFound ? (
                <button 
                  onClick={onSubmitReview}
                  className="w-full md:w-auto px-12 py-4 bg-brand-purple text-white rounded-full font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-brand-purple/20"
                >
                  Submit for manual review
                </button>
              ) : (
                <>
                  <button className="flex items-center gap-2 px-8 py-4 font-bold text-gray-600 hover:text-brand-dark transition-colors">
                    <Share2 size={20} /> Share
                  </button>
                  <button className="flex items-center gap-2 px-10 py-4 bg-brand-purple/5 text-brand-purple rounded-full font-bold hover:bg-brand-purple/10 transition-all">
                    <Download size={20} /> Download result
                  </button>
                </>
              )}
            </div>

            {/* Footer Info */}
            <div className="pt-8 border-t border-gray-100 space-y-4">
              <div className="flex flex-wrap gap-x-8 gap-y-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <span>Verification Id: {result.id}</span>
                <span>Date checked: {result.date}</span>
              </div>
              <p className="text-[10px] text-gray-400">
                Company Name can make mistakes. Check info with relevant authorities.
              </p>
            </div>

            {/* Comments Section */}
            <div className="pt-12 border-t border-gray-100 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Community feedback</h3>
                <span className="text-sm font-medium text-gray-400">{comments.length} comments</span>
              </div>

              <form onSubmit={handleAddComment} className="relative">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Leave a comment or feedback about this product..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-6 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all min-h-[120px] resize-none"
                />
                <button 
                  type="submit"
                  disabled={!newComment.trim()}
                  className="absolute bottom-4 right-4 bg-brand-purple text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-brand-purple/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  Post
                </button>
              </form>

              <div className="space-y-6">
                {comments.map((comment) => (
                  <motion.div 
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple font-bold text-xs shrink-0">
                      {comment.user[0]}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{comment.user}</span>
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{comment.date}</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {comment.text}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Admin Components ---

const ProductForm = ({ 
  product, 
  onSave, 
  onCancel 
}: { 
  product?: any, 
  onSave: (p: any) => void, 
  onCancel: () => void 
}) => {
  const [formData, setFormData] = useState(product || {
    name: '',
    category: 'Drug',
    nafdacNumber: '',
    manufacturer: { name: '', address: '' },
    description: '',
    status: 'Verified',
    images: { front: null, back: null, left: null, right: null, seal: null, hologram: null },
    fakes: []
  });

  const handleImageUpload = (key: string) => {
    // Simulate image upload
    setFormData((prev: any) => ({
      ...prev,
      images: { ...prev.images, [key]: `https://picsum.photos/seed/${key}${Math.random()}/400/400` }
    }));
  };

  const addFakeVersion = () => {
    setFormData((prev: any) => ({
      ...prev,
      fakes: [...prev.fakes, { description: '', differences: [''] }]
    }));
  };

  const updateFake = (index: number, field: string, value: any) => {
    const newFakes = [...formData.fakes];
    newFakes[index] = { ...newFakes[index], [field]: value };
    setFormData((prev: any) => ({ ...prev, fakes: newFakes }));
  };

  const addDifference = (fakeIndex: number) => {
    const newFakes = [...formData.fakes];
    newFakes[fakeIndex].differences.push('');
    setFormData((prev: any) => ({ ...prev, fakes: newFakes }));
  };

  const updateDifference = (fakeIndex: number, diffIndex: number, value: string) => {
    const newFakes = [...formData.fakes];
    newFakes[fakeIndex].differences[diffIndex] = value;
    setFormData((prev: any) => ({ ...prev, fakes: newFakes }));
  };

  return (
    <div className="space-y-12 pb-24">
      <div className="flex items-center gap-4">
        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-3xl font-bold text-brand-dark">{product ? 'Edit Product' : 'Add New Product'}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Basic Info */}
        <div className="space-y-8 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Activity size={20} className="text-brand-purple" /> Basic Information
          </h3>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Product Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-purple/20"
                placeholder="e.g. Panadol Extra"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-purple/20"
                >
                  <option>Drug</option>
                  <option>Skincare</option>
                  <option>Food</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">NAFDAC Number</label>
                <input 
                  type="text" 
                  value={formData.nafdacNumber}
                  onChange={e => setFormData({...formData, nafdacNumber: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-purple/20"
                  placeholder="e.g. A4-1234"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status</label>
              <select 
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-purple/20"
              >
                <option>Verified</option>
                <option>Fakes Circulating</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-purple/20 min-h-[120px] resize-none"
                placeholder="Describe the product..."
              />
            </div>
          </div>
        </div>

        {/* Manufacturer */}
        <div className="space-y-8 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Package size={20} className="text-brand-purple" /> Manufacturer Details
          </h3>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Company Name</label>
              <input 
                type="text" 
                value={formData.manufacturer.name}
                onChange={e => setFormData({...formData, manufacturer: {...formData.manufacturer, name: e.target.value}})}
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-purple/20"
                placeholder="e.g. Emzor Pharmaceuticals"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Address</label>
              <textarea 
                value={formData.manufacturer.address}
                onChange={e => setFormData({...formData, manufacturer: {...formData.manufacturer, address: e.target.value}})}
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-purple/20 min-h-[100px] resize-none"
                placeholder="Full manufacturing address..."
              />
            </div>
          </div>
        </div>

        {/* Reference Images */}
        <div className="lg:col-span-2 space-y-8 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <ImageIcon size={20} className="text-brand-purple" /> Authentic Reference Images
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {Object.entries(formData.images).map(([key, value]) => (
              <div key={key} className="space-y-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">{key}</p>
                <button 
                  onClick={() => handleImageUpload(key)}
                  className="w-full aspect-square rounded-2xl border-2 border-dashed border-gray-100 hover:border-brand-purple hover:bg-brand-purple/5 transition-all flex flex-col items-center justify-center gap-2 overflow-hidden group relative"
                >
                  {value ? (
                    <>
                      <img src={value as string} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-brand-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Plus className="text-white" size={24} />
                      </div>
                    </>
                  ) : (
                    <>
                      <Plus className="text-gray-300 group-hover:text-brand-purple" size={24} />
                      <span className="text-[10px] font-bold text-gray-300 group-hover:text-brand-purple uppercase">Upload</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Fake Versions */}
        <div className="lg:col-span-2 space-y-8 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <AlertTriangle size={20} className="text-red-500" /> Known Fake Versions
            </h3>
            <button 
              onClick={addFakeVersion}
              className="flex items-center gap-2 text-sm font-bold text-brand-purple hover:underline"
            >
              <Plus size={16} /> Add Fake Version
            </button>
          </div>
          
          <div className="space-y-8">
            {formData.fakes.map((fake: any, fIndex: number) => (
              <div key={fIndex} className="p-8 bg-red-50/50 rounded-3xl border border-red-100 space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-red-900">Fake Version #{fIndex + 1}</h4>
                  <button 
                    onClick={() => setFormData((prev: any) => ({ ...prev, fakes: prev.fakes.filter((_: any, i: number) => i !== fIndex) }))}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-red-900/40 uppercase tracking-widest">Description of this fake</label>
                    <input 
                      type="text" 
                      value={fake.description}
                      onChange={e => updateFake(fIndex, 'description', e.target.value)}
                      className="w-full bg-white border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-red-500/20"
                      placeholder="e.g. Common counterfeit found in open markets"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-red-900/40 uppercase tracking-widest block">Key Differences</label>
                    {fake.differences.map((diff: string, dIndex: number) => (
                      <div key={dIndex} className="flex gap-4">
                        <input 
                          type="text" 
                          value={diff}
                          onChange={e => updateDifference(fIndex, dIndex, e.target.value)}
                          className="flex-1 bg-white border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-red-500/20"
                          placeholder="e.g. Missing hologram seal"
                        />
                        <button 
                          onClick={() => {
                            const newFakes = [...formData.fakes];
                            newFakes[fIndex].differences = newFakes[fIndex].differences.filter((_: any, i: number) => i !== dIndex);
                            setFormData((prev: any) => ({ ...prev, fakes: newFakes }));
                          }}
                          className="p-4 text-red-400 hover:text-red-600"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => addDifference(fIndex)}
                      className="flex items-center gap-2 text-xs font-bold text-red-600 hover:underline"
                    >
                      <Plus size={14} /> Add Difference
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 left-72 right-0 px-8 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-end pointer-events-auto">
          <div className="bg-white p-4 rounded-3xl shadow-2xl border border-gray-100 flex gap-4">
            <button 
              onClick={onCancel}
              className="px-8 py-3 font-bold text-gray-400 hover:text-brand-dark transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => onSave(formData)}
              className="px-12 py-3 bg-brand-purple text-white rounded-2xl font-bold shadow-lg shadow-brand-purple/20 hover:scale-105 active:scale-95 transition-all"
            >
              Save Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminPanel = ({ user, onLogout }: { user: any, onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [products, setProducts] = useState<any[]>([
    { id: '1', name: 'Emzor Paracetamol', category: 'Drug', nafdacNumber: 'A4-1234', status: 'Verified', dateAdded: '2026-03-01' },
    { id: '2', name: 'Panadol Extra', category: 'Drug', nafdacNumber: 'B2-5678', status: 'Fakes Circulating', dateAdded: '2026-03-15' },
    { id: '3', name: 'Nivea Radiant & Beauty', category: 'Skincare', nafdacNumber: 'C1-9012', status: 'Verified', dateAdded: '2026-03-20' },
    { id: '4', name: 'Indomie Chicken Flavor', category: 'Food', nafdacNumber: 'D3-3456', status: 'Verified', dateAdded: '2026-03-25' },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [users, setUsers] = useState<any[]>([
    { 
      id: '1', 
      name: 'Chinonye Okubor', 
      email: 'okuborchinonye@gmail.com', 
      role: 'Admin', 
      status: 'Active', 
      joined: '2024-03-20',
      verifications: [
        { id: 'v1', product: 'Emzor Paracetamol', score: 98, date: '2024-03-26' },
        { id: 'v2', product: 'Panadol Extra', score: 45, date: '2024-03-25' },
      ],
      comments: [
        { id: 'c1', product: 'Panadol Extra', text: 'I found a fake version of this in Lagos. The seal was missing.', date: '2024-03-25' }
      ]
    },
    { 
      id: '2', 
      name: 'John Doe', 
      email: 'john@example.com', 
      role: 'User', 
      status: 'Active', 
      joined: '2024-03-25',
      verifications: [],
      comments: []
    },
    { 
      id: '3', 
      name: 'Jane Smith', 
      email: 'jane@example.com', 
      role: 'User', 
      status: 'Banned', 
      joined: '2024-03-26',
      verifications: [],
      comments: []
    },
  ]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [userStatusFilter, setUserStatusFilter] = useState('All');
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [userActionConfirm, setUserActionConfirm] = useState<{ type: 'ban' | 'unban' | 'promote' | 'demote', userId: string } | null>(null);

  const [comments, setComments] = useState<any[]>([
    { id: '1', text: 'I found a fake version of this in Lagos. The seal was missing.', user: 'amara_k', product: 'Panadol Extra', date: '2024-03-25', flagged: true },
    { id: '2', text: 'This product is authentic, I checked the hologram.', user: 'tunde_dev', product: 'Emzor Paracetamol', date: '2024-03-26', flagged: false },
    { id: '3', text: 'The packaging looks slightly different from the one I bought last month.', user: 'chidi_o', product: 'Nivea Radiant & Beauty', date: '2024-03-24', flagged: true },
    { id: '4', text: 'Very helpful app, thanks for the verification!', user: 'obi_j', product: 'Indomie Chicken Flavor', date: '2024-03-27', flagged: false },
  ]);
  const [commentSearchQuery, setCommentSearchQuery] = useState('');
  const [commentFilter, setCommentFilter] = useState<'All' | 'Flagged'>('Flagged');
  const [commentProductFilter, setCommentProductFilter] = useState('All');
  const [commentDeleteConfirm, setCommentDeleteConfirm] = useState<string | null>(null);

  const [submissions, setSubmissions] = useState<any[]>([
    { 
      id: 'SUB-8291', 
      productName: 'New Herbal Tea', 
      nafdac: '01-2233', 
      date: '2024-03-27', 
      user: 'amara_k', 
      status: 'Pending',
      notes: 'This is a new local tea I found in Enugu. Please verify.',
      images: [
        'https://picsum.photos/seed/tea1/400/400',
        'https://picsum.photos/seed/tea2/400/400',
        'https://picsum.photos/seed/tea3/400/400'
      ]
    },
    { 
      id: 'SUB-8290', 
      productName: 'Glow Serum X', 
      nafdac: '02-4455', 
      date: '2024-03-26', 
      user: 'Guest', 
      status: 'Reviewed',
      notes: 'Found this in a pharmacy, not sure if it is real.',
      images: ['https://picsum.photos/seed/serum1/400/400'],
      rejectionNote: 'Duplicate submission. Product already exists.'
    },
    { 
      id: 'SUB-8289', 
      productName: 'Power Energy Drink', 
      nafdac: '03-6677', 
      date: '2024-03-25', 
      user: 'chidi_o', 
      status: 'Pending',
      notes: 'The packaging looks suspicious.',
      images: ['https://picsum.photos/seed/drink1/400/400', 'https://picsum.photos/seed/drink2/400/400']
    },
  ]);
  const [submissionSearchQuery, setSubmissionSearchQuery] = useState('');
  const [submissionFilter, setSubmissionFilter] = useState<'Pending' | 'Reviewed'>('Pending');
  const [viewingSubmission, setViewingSubmission] = useState<any>(null);
  const [rejectingSubmission, setRejectingSubmission] = useState<any>(null);
  const [rejectionNote, setRejectionNote] = useState('');
  
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Products', icon: Package },
    { name: 'Users', icon: Users },
    { name: 'Comments', icon: MessageSquare },
    { name: 'Submissions', icon: Inbox },
  ];

  const chartData = [
    { name: 'Mar 21', value: 400 },
    { name: 'Mar 22', value: 300 },
    { name: 'Mar 23', value: 600 },
    { name: 'Mar 24', value: 800 },
    { name: 'Mar 25', value: 500 },
    { name: 'Mar 26', value: 900 },
    { name: 'Mar 27', value: 1200 },
  ];

  const recentActivity = [
    { id: 1, type: 'submission', text: 'New submission from User #8291', time: '2 mins ago', icon: Inbox, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 2, type: 'comment', text: 'Flagged comment on "Panadol Extra"', time: '15 mins ago', icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-50' },
    { id: 3, type: 'user', text: 'New user registered: amara_k', time: '1 hour ago', icon: User, color: 'text-green-500', bg: 'bg-green-50' },
    { id: 4, type: 'verification', text: 'Verification complete: Original (Lagos)', time: '2 hours ago', icon: Check, color: 'text-brand-purple', bg: 'bg-brand-purple/5' },
    { id: 5, type: 'submission', text: 'New submission from User #8290', time: '3 hours ago', icon: Inbox, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 6, type: 'comment', text: 'New comment from tunde_dev', time: '5 hours ago', icon: MessageSquare, color: 'text-orange-500', bg: 'bg-orange-50' },
    { id: 7, type: 'verification', text: 'Verification complete: Fake (Abuja)', time: '6 hours ago', icon: X, color: 'text-red-500', bg: 'bg-red-50' },
    { id: 8, type: 'user', text: 'New user registered: chidi_o', time: '8 hours ago', icon: User, color: 'text-green-500', bg: 'bg-green-50' },
    { id: 9, type: 'submission', text: 'New submission from User #8289', time: '12 hours ago', icon: Inbox, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 10, type: 'comment', text: 'Flagged comment on "Emzor Paracetamol"', time: '1 day ago', icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 bg-brand-dark text-white flex flex-col">
        <div className="p-8">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="text-2xl">🛡️</span> POVA AI Admin
          </h1>
        </div>
        
        <div className="px-4 py-2">
          <div className="h-px bg-white/10 w-full mb-6" />
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${
                activeTab === item.name 
                  ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/20' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={20} />
              <span className="font-bold text-sm">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <div className="h-px bg-white/10 w-full mb-6" />
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut size={20} />
            <span className="font-bold text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-100 p-8 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-brand-dark">{activeTab}</h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-brand-dark">{user?.name}</p>
              <p className="text-xs text-gray-400 uppercase tracking-widest">Super Admin</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-brand-purple/10 flex items-center justify-center text-brand-purple font-bold">
              AD
            </div>
          </div>
        </header>

        <main className="p-8">
          {activeTab === 'Dashboard' && (
            <div className="space-y-8">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {[
                  { label: 'Verifications Today', value: '1,284', change: '+12%', icon: Zap },
                  { label: 'Total Verifications', value: '142.8k', change: '+5%', icon: Activity },
                  { label: 'Pending Submissions', value: '24', change: '-2', icon: Inbox },
                  { label: 'Flagged Comments', value: '12', change: '+3', icon: ShieldAlert },
                  { label: 'Registered Users', value: '8,492', change: '+156', icon: Users },
                  { label: 'Total Products', value: '1,204', change: '+8', icon: Package },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-purple/5 flex items-center justify-center text-brand-purple group-hover:bg-brand-purple group-hover:text-white transition-all">
                        <stat.icon size={20} />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-xl font-bold text-brand-dark">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-bold text-brand-dark">Verification Volume</h3>
                      <p className="text-sm text-gray-400">Daily activity over the last 7 days</p>
                    </div>
                    <select className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-gray-600 focus:ring-2 focus:ring-brand-purple/20">
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                    </select>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 12, fill: '#9CA3AF', fontWeight: 600 }}
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 12, fill: '#9CA3AF', fontWeight: 600 }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '16px', 
                            border: 'none', 
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            padding: '12px'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#7C3AED" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorValue)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-brand-dark">Recent Activity</h3>
                    <button className="text-xs font-bold text-brand-purple hover:underline">View All</button>
                  </div>
                  <div className="space-y-6 flex-1 overflow-y-auto max-h-[300px] pr-2 scrollbar-hide">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex gap-4 group cursor-pointer">
                        <div className={`w-10 h-10 rounded-xl ${activity.bg} ${activity.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                          <activity.icon size={18} />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-brand-dark group-hover:text-brand-purple transition-colors">{activity.text}</p>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            <Clock size={10} />
                            {activity.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'Products' && (
            <div className="space-y-8">
              {isAdding || editingProduct ? (
                <ProductForm 
                  product={editingProduct}
                  onSave={(p) => {
                    if (editingProduct) {
                      setProducts(prev => prev.map(item => item.id === editingProduct.id ? { ...p, id: item.id, dateAdded: item.dateAdded } : item));
                    } else {
                      setProducts(prev => [...prev, { ...p, id: Math.random().toString(36).substr(2, 9), dateAdded: new Date().toISOString().split('T')[0] }]);
                      
                      // If we were approving a submission, mark it as reviewed
                      if (viewingSubmission) {
                        setSubmissions(prev => prev.map(s => 
                          s.id === viewingSubmission.id ? { ...s, status: 'Reviewed' } : s
                        ));
                        setViewingSubmission(null);
                      }
                    }
                    setIsAdding(false);
                    setEditingProduct(null);
                  }}
                  onCancel={() => {
                    setIsAdding(false);
                    setEditingProduct(null);
                  }}
                />
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-6">
                    <div className="flex flex-wrap items-center gap-4 flex-1">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                          type="text" 
                          placeholder="Search product or NAFDAC..."
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="w-full bg-white border border-gray-100 rounded-2xl pl-12 pr-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 shadow-sm"
                        />
                      </div>
                      <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-4 py-2 shadow-sm">
                        <Filter size={16} className="text-gray-400" />
                        <select 
                          value={categoryFilter}
                          onChange={e => setCategoryFilter(e.target.value)}
                          className="bg-transparent border-none text-sm font-bold text-gray-600 focus:ring-0"
                        >
                          <option>All Categories</option>
                          <option>Drug</option>
                          <option>Skincare</option>
                          <option>Food</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-4 py-2 shadow-sm">
                        <Activity size={16} className="text-gray-400" />
                        <select 
                          value={statusFilter}
                          onChange={e => setStatusFilter(e.target.value)}
                          className="bg-transparent border-none text-sm font-bold text-gray-600 focus:ring-0"
                        >
                          <option>All Status</option>
                          <option>Verified</option>
                          <option>Fakes Circulating</option>
                        </select>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsAdding(true)}
                      className="flex items-center gap-2 bg-green-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-green-500/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      <Plus size={20} /> Add New Product
                    </button>
                  </div>

                  <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                          <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product Name</th>
                          <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</th>
                          <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">NAFDAC No.</th>
                          <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                          <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date Added</th>
                          <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products
                          .filter(p => {
                            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.nafdacNumber.toLowerCase().includes(searchQuery.toLowerCase());
                            const matchesCategory = categoryFilter === 'All Categories' || p.category === categoryFilter;
                            const matchesStatus = statusFilter === 'All Status' || p.status === statusFilter;
                            return matchesSearch && matchesCategory && matchesStatus;
                          })
                          .map((p) => (
                            <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors group">
                              <td className="px-8 py-6">
                                <span className="font-bold text-brand-dark">{p.name}</span>
                              </td>
                              <td className="px-8 py-6">
                                <span className="text-sm text-gray-600">{p.category}</span>
                              </td>
                              <td className="px-8 py-6">
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">{p.nafdacNumber}</code>
                              </td>
                              <td className="px-8 py-6">
                                <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                                  p.status === 'Verified' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                }`}>
                                  {p.status}
                                </span>
                              </td>
                              <td className="px-8 py-6 text-sm text-gray-400">
                                {p.dateAdded}
                              </td>
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => setEditingProduct(p)}
                                    className="p-2 text-gray-400 hover:text-brand-purple hover:bg-brand-purple/5 rounded-xl transition-all"
                                  >
                                    <Edit2 size={18} />
                                  </button>
                                  <button 
                                    onClick={() => setDeleteConfirm(p.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
          
          {activeTab === 'Users' && (
            <div className="space-y-8">
              {viewingUser ? (
                <div className="space-y-8">
                  <button 
                    onClick={() => setViewingUser(null)}
                    className="flex items-center gap-2 text-gray-400 hover:text-brand-dark transition-colors font-bold"
                  >
                    <ChevronLeft size={20} /> Back to Users
                  </button>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* User Profile Info */}
                    <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-8">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-24 h-24 rounded-[32px] bg-brand-purple/10 flex items-center justify-center text-brand-purple text-3xl font-bold">
                          {viewingUser.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-brand-dark">{viewingUser.name}</h3>
                          <p className="text-gray-400">{viewingUser.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                            viewingUser.role === 'Admin' ? 'bg-brand-purple/10 text-brand-purple' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {viewingUser.role}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                            viewingUser.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                          }`}>
                            {viewingUser.status}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4 pt-8 border-t border-gray-50">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Joined Date</span>
                          <span className="text-sm font-bold text-brand-dark">{viewingUser.joined}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Verifications</span>
                          <span className="text-sm font-bold text-brand-dark">{viewingUser.verifications.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Comments</span>
                          <span className="text-sm font-bold text-brand-dark">{viewingUser.comments.length}</span>
                        </div>
                      </div>

                      <div className="space-y-3 pt-8">
                        {viewingUser.status === 'Active' ? (
                          <button 
                            onClick={() => setUserActionConfirm({ type: 'ban', userId: viewingUser.id })}
                            className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-600 hover:text-white transition-all"
                          >
                            Ban Account
                          </button>
                        ) : (
                          <button 
                            onClick={() => setUserActionConfirm({ type: 'unban', userId: viewingUser.id })}
                            className="w-full py-4 bg-green-50 text-green-600 rounded-2xl font-bold hover:bg-green-600 hover:text-white transition-all"
                          >
                            Unban Account
                          </button>
                        )}
                        {viewingUser.role === 'User' ? (
                          <button 
                            onClick={() => setUserActionConfirm({ type: 'promote', userId: viewingUser.id })}
                            className="w-full py-4 bg-brand-purple/5 text-brand-purple rounded-2xl font-bold hover:bg-brand-purple hover:text-white transition-all"
                          >
                            Promote to Admin
                          </button>
                        ) : (
                          <button 
                            onClick={() => setUserActionConfirm({ type: 'demote', userId: viewingUser.id })}
                            className="w-full py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold hover:bg-gray-600 hover:text-white transition-all"
                          >
                            Demote to User
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Activity History */}
                    <div className="lg:col-span-2 space-y-8">
                      {/* Verification History */}
                      <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
                        <h4 className="text-lg font-bold text-brand-dark mb-6">Verification History</h4>
                        {viewingUser.verifications.length > 0 ? (
                          <div className="space-y-4">
                            {viewingUser.verifications.map((v: any) => (
                              <div key={v.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${v.score > 80 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    <ShieldCheck size={20} />
                                  </div>
                                  <div>
                                    <p className="font-bold text-brand-dark">{v.product}</p>
                                    <p className="text-xs text-gray-400">{v.date}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className={`text-lg font-bold ${v.score > 80 ? 'text-green-600' : 'text-red-600'}`}>{v.score}%</p>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Match Score</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 text-gray-400 italic">No verifications yet.</div>
                        )}
                      </div>

                      {/* Comment History */}
                      <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
                        <h4 className="text-lg font-bold text-brand-dark mb-6">Comment History</h4>
                        {viewingUser.comments.length > 0 ? (
                          <div className="space-y-4">
                            {viewingUser.comments.map((c: any) => (
                              <div key={c.id} className="p-6 bg-gray-50 rounded-2xl space-y-3">
                                <div className="flex justify-between items-start">
                                  <p className="text-xs font-bold text-brand-purple uppercase tracking-widest">{c.product}</p>
                                  <span className="text-[10px] text-gray-400">{c.date}</span>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">{c.text}</p>
                                <button className="text-xs font-bold text-brand-dark hover:text-brand-purple transition-colors flex items-center gap-1">
                                  View Product <Activity size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 text-gray-400 italic">No comments yet.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-6">
                    <div className="flex flex-wrap items-center gap-4 flex-1">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                          type="text" 
                          placeholder="Search name or email..."
                          value={userSearchQuery}
                          onChange={e => setUserSearchQuery(e.target.value)}
                          className="w-full bg-white border border-gray-100 rounded-2xl pl-12 pr-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 shadow-sm"
                        />
                      </div>
                      <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-4 py-2 shadow-sm">
                        <Filter size={16} className="text-gray-400" />
                        <select 
                          value={userRoleFilter}
                          onChange={e => setUserRoleFilter(e.target.value)}
                          className="bg-transparent border-none text-sm font-bold text-gray-600 focus:ring-0"
                        >
                          <option>All Roles</option>
                          <option>Admin</option>
                          <option>User</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-4 py-2 shadow-sm">
                        <Activity size={16} className="text-gray-400" />
                        <select 
                          value={userStatusFilter}
                          onChange={e => setUserStatusFilter(e.target.value)}
                          className="bg-transparent border-none text-sm font-bold text-gray-600 focus:ring-0"
                        >
                          <option>All Status</option>
                          <option>Active</option>
                          <option>Banned</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                          <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Username</th>
                          <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</th>
                          <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Joined</th>
                          <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role</th>
                          <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                          <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {users
                          .filter(u => {
                            const matchesSearch = u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || u.email.toLowerCase().includes(userSearchQuery.toLowerCase());
                            const matchesRole = userRoleFilter === 'All Roles' || u.role === userRoleFilter;
                            const matchesStatus = userStatusFilter === 'All Status' || u.status === userStatusFilter;
                            return matchesSearch && matchesRole && matchesStatus;
                          })
                          .map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50/30 transition-colors group">
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-brand-purple/10 flex items-center justify-center text-brand-purple text-xs font-bold">
                                    {u.name.charAt(0)}
                                  </div>
                                  <span className="font-bold text-brand-dark">{u.name}</span>
                                </div>
                              </td>
                              <td className="px-8 py-6 text-sm text-gray-500">{u.email}</td>
                              <td className="px-8 py-6 text-sm text-gray-400">{u.joined}</td>
                              <td className="px-8 py-6">
                                <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                                  u.role === 'Admin' ? 'bg-brand-purple/10 text-brand-purple' : 'bg-gray-100 text-gray-500'
                                }`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-8 py-6">
                                <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                                  u.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                }`}>
                                  {u.status}
                                </span>
                              </td>
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => setViewingUser(u)}
                                    className="px-4 py-2 text-xs font-bold text-brand-purple hover:bg-brand-purple/5 rounded-xl transition-all"
                                  >
                                    View
                                  </button>
                                  {u.status === 'Active' ? (
                                    <button 
                                      onClick={() => setUserActionConfirm({ type: 'ban', userId: u.id })}
                                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                      title="Ban User"
                                    >
                                      <ShieldAlert size={18} />
                                    </button>
                                  ) : (
                                    <button 
                                      onClick={() => setUserActionConfirm({ type: 'unban', userId: u.id })}
                                      className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-xl transition-all"
                                      title="Unban User"
                                    >
                                      <ShieldCheck size={18} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'Comments' && (
            <div className="space-y-8">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex flex-wrap items-center gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="Search comment or user..."
                      value={commentSearchQuery}
                      onChange={e => setCommentSearchQuery(e.target.value)}
                      className="w-full bg-white border border-gray-100 rounded-2xl pl-12 pr-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 shadow-sm"
                    />
                  </div>
                  
                  <div className="flex bg-white border border-gray-100 rounded-2xl p-1 shadow-sm">
                    <button 
                      onClick={() => setCommentFilter('All')}
                      className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                        commentFilter === 'All' ? 'bg-brand-purple text-white shadow-md' : 'text-gray-400 hover:text-brand-dark'
                      }`}
                    >
                      All Comments
                    </button>
                    <button 
                      onClick={() => setCommentFilter('Flagged')}
                      className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                        commentFilter === 'Flagged' ? 'bg-red-500 text-white shadow-md' : 'text-gray-400 hover:text-red-500'
                      }`}
                    >
                      Flagged Only
                      {comments.filter(c => c.flagged).length > 0 && (
                        <span className={`w-2 h-2 rounded-full ${commentFilter === 'Flagged' ? 'bg-white' : 'bg-red-500'}`} />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-4 py-2 shadow-sm">
                    <Package size={16} className="text-gray-400" />
                    <select 
                      value={commentProductFilter}
                      onChange={e => setCommentProductFilter(e.target.value)}
                      className="bg-transparent border-none text-sm font-bold text-gray-600 focus:ring-0"
                    >
                      <option>All Products</option>
                      {Array.from(new Set(comments.map(c => c.product))).map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Comment</th>
                      <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">User</th>
                      <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product</th>
                      <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                      <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {comments
                      .filter(c => {
                        const matchesSearch = c.text.toLowerCase().includes(commentSearchQuery.toLowerCase()) || c.user.toLowerCase().includes(commentSearchQuery.toLowerCase());
                        const matchesFlagged = commentFilter === 'All' || c.flagged;
                        const matchesProduct = commentProductFilter === 'All Products' || c.product === commentProductFilter;
                        return matchesSearch && matchesFlagged && matchesProduct;
                      })
                      .map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50/30 transition-colors group">
                          <td className="px-8 py-6 max-w-xs">
                            <p className="text-sm text-brand-dark font-medium line-clamp-2">{c.text}</p>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                {c.user.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-bold text-gray-600">{c.user}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-xs font-bold text-brand-purple">{c.product}</span>
                          </td>
                          <td className="px-8 py-6 text-sm text-gray-400">{c.date}</td>
                          <td className="px-8 py-6">
                            {c.flagged ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full w-fit">
                                <ShieldAlert size={12} /> Flagged
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full w-fit">
                                <Check size={12} /> Approved
                              </span>
                            )}
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {c.flagged && (
                                <button 
                                  onClick={() => {
                                    setComments(prev => prev.map(item => item.id === c.id ? { ...item, flagged: false } : item));
                                  }}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-all"
                                  title="Approve"
                                >
                                  <Check size={18} />
                                </button>
                              )}
                              <button 
                                onClick={() => setCommentDeleteConfirm(c.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                              <a 
                                href={`/product/${c.product.toLowerCase().replace(/\s+/g, '-')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-400 hover:text-brand-purple hover:bg-brand-purple/5 rounded-xl transition-all"
                                title="View Product"
                              >
                                <Eye size={18} />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {comments.filter(c => {
                  const matchesSearch = c.text.toLowerCase().includes(commentSearchQuery.toLowerCase()) || c.user.toLowerCase().includes(commentSearchQuery.toLowerCase());
                  const matchesFlagged = commentFilter === 'All' || c.flagged;
                  const matchesProduct = commentProductFilter === 'All Products' || c.product === commentProductFilter;
                  return matchesSearch && matchesFlagged && matchesProduct;
                }).length === 0 && (
                  <div className="p-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                      <MessageSquare size={32} />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-brand-dark">No comments found</p>
                      <p className="text-sm text-gray-400">Try adjusting your filters or search query</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Submissions' && (
            <div className="space-y-8">
              {viewingSubmission ? (
                <div className="space-y-8">
                  <button 
                    onClick={() => setViewingSubmission(null)}
                    className="flex items-center gap-2 text-gray-400 hover:text-brand-dark transition-colors font-bold"
                  >
                    <ChevronLeft size={20} /> Back to Submissions
                  </button>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Submission Details */}
                    <div className="lg:col-span-2 space-y-8">
                      <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-8">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-2xl font-bold text-brand-dark">{viewingSubmission.productName}</h3>
                            <p className="text-gray-400">Submission ID: {viewingSubmission.id}</p>
                          </div>
                          <span className={`px-4 py-2 rounded-full text-xs font-bold ${
                            viewingSubmission.status === 'Pending' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'
                          }`}>
                            {viewingSubmission.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-8 py-8 border-y border-gray-50">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">NAFDAC Number</p>
                            <p className="font-bold text-brand-dark">{viewingSubmission.nafdac || 'Not provided'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Submitted Date</p>
                            <p className="font-bold text-brand-dark">{viewingSubmission.date}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Submitted By</p>
                            <p className="font-bold text-brand-dark">{viewingSubmission.user}</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">User Notes</p>
                          <div className="p-6 bg-gray-50 rounded-2xl text-gray-600 leading-relaxed italic">
                            "{viewingSubmission.notes}"
                          </div>
                        </div>

                        <div className="space-y-4">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Uploaded Images</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {viewingSubmission.images.map((img: string, idx: number) => (
                              <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-gray-100 group relative">
                                <img src={img} alt={`Submission ${idx}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                <button className="absolute inset-0 bg-brand-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                  <Maximize size={24} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions Sidebar */}
                    <div className="space-y-6">
                      <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-6">
                        <h4 className="text-lg font-bold text-brand-dark">Review Actions</h4>
                        <div className="space-y-3">
                          <button 
                            onClick={() => {
                              setEditingProduct({
                                name: viewingSubmission.productName,
                                nafdacNumber: viewingSubmission.nafdac || '',
                                category: 'Drug',
                                status: 'Verified',
                                manufacturer: { name: '', address: '' },
                                description: viewingSubmission.notes || '',
                                images: {
                                  front: viewingSubmission.images[0] || null,
                                  back: viewingSubmission.images[1] || null,
                                  left: viewingSubmission.images[2] || null,
                                  right: viewingSubmission.images[3] || null,
                                  seal: null,
                                  hologram: null
                                },
                                fakes: []
                              });
                              setIsAdding(true);
                              setActiveTab('Products');
                            }}
                            className="w-full py-4 bg-brand-purple text-white rounded-2xl font-bold shadow-lg shadow-brand-purple/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                          >
                            <Plus size={20} /> Approve & Add
                          </button>
                          <button 
                            onClick={() => setRejectingSubmission(viewingSubmission)}
                            className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                          >
                            <X size={20} /> Reject Submission
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                          Approving will open the product creation form with these details pre-filled.
                        </p>
                      </div>

                      {viewingSubmission.status === 'Reviewed' && viewingSubmission.rejectionNote && (
                        <div className="bg-red-50 rounded-[40px] p-8 border border-red-100 space-y-4">
                          <div className="flex items-center gap-2 text-red-600 font-bold">
                            <AlertTriangle size={20} /> Rejection Note
                          </div>
                          <p className="text-sm text-red-700 leading-relaxed">{viewingSubmission.rejectionNote}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-6">
                    <div className="flex flex-wrap items-center gap-4 flex-1">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                          type="text" 
                          placeholder="Search product name..."
                          value={submissionSearchQuery}
                          onChange={e => setSubmissionSearchQuery(e.target.value)}
                          className="w-full bg-white border border-gray-100 rounded-2xl pl-12 pr-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 shadow-sm"
                        />
                      </div>
                      
                      <div className="flex bg-white border border-gray-100 rounded-2xl p-1 shadow-sm">
                        <button 
                          onClick={() => setSubmissionFilter('Pending')}
                          className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                            submissionFilter === 'Pending' ? 'bg-brand-purple text-white shadow-md' : 'text-gray-400 hover:text-brand-dark'
                          }`}
                        >
                          Pending
                        </button>
                        <button 
                          onClick={() => setSubmissionFilter('Reviewed')}
                          className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                            submissionFilter === 'Reviewed' ? 'bg-brand-purple text-white shadow-md' : 'text-gray-400 hover:text-brand-dark'
                          }`}
                        >
                          Reviewed
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                          <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID</th>
                          <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product Name</th>
                          <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                          <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">User</th>
                          <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                          <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {submissions
                          .filter(s => {
                            const matchesSearch = s.productName.toLowerCase().includes(submissionSearchQuery.toLowerCase());
                            const matchesStatus = s.status === submissionFilter;
                            return matchesSearch && matchesStatus;
                          })
                          .map((s) => (
                            <tr key={s.id} className="hover:bg-gray-50/30 transition-colors group">
                              <td className="px-8 py-6 text-xs font-mono text-gray-400">{s.id}</td>
                              <td className="px-8 py-6">
                                <span className="font-bold text-brand-dark">{s.productName}</span>
                              </td>
                              <td className="px-8 py-6 text-sm text-gray-400">{s.date}</td>
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-2">
                                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${s.user === 'Guest' ? 'bg-gray-100 text-gray-400' : 'bg-brand-purple/10 text-brand-purple'}`}>
                                    {s.user.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="text-sm font-bold text-gray-600">{s.user}</span>
                                </div>
                              </td>
                              <td className="px-8 py-6">
                                <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                                  s.status === 'Pending' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'
                                }`}>
                                  {s.status}
                                </span>
                              </td>
                              <td className="px-8 py-6">
                                <button 
                                  onClick={() => setViewingSubmission(s)}
                                  className="px-6 py-2 bg-gray-50 text-brand-dark rounded-xl text-xs font-bold hover:bg-brand-purple hover:text-white transition-all"
                                >
                                  Review
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    {submissions.filter(s => {
                      const matchesSearch = s.productName.toLowerCase().includes(submissionSearchQuery.toLowerCase());
                      const matchesStatus = s.status === submissionFilter;
                      return matchesSearch && matchesStatus;
                    }).length === 0 && (
                      <div className="p-20 text-center space-y-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                          <Inbox size={32} />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-brand-dark">No submissions found</p>
                          <p className="text-sm text-gray-400">All caught up! No {submissionFilter.toLowerCase()} submissions.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab !== 'Dashboard' && activeTab !== 'Products' && activeTab !== 'Users' && activeTab !== 'Comments' && activeTab !== 'Submissions' && (
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
              <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-6">
                <Package size={48} />
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-2">{activeTab} Management</h3>
              <p className="text-gray-400 max-w-sm">
                This section is currently being populated with real-time data from the POVA AI engine.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-[40px] p-12 max-w-md w-full shadow-2xl text-center space-y-8"
            >
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center text-red-500 mx-auto">
                <Trash2 size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-brand-dark">Delete Product?</h3>
                <p className="text-gray-400">
                  This action cannot be undone. This product will be removed from the database and public verification.
                </p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-8 py-4 font-bold text-gray-400 hover:text-brand-dark transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setProducts(prev => prev.filter(p => p.id !== deleteConfirm));
                    setDeleteConfirm(null);
                  }}
                  className="flex-1 px-8 py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reject Submission Modal */}
      <AnimatePresence>
        {rejectingSubmission && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRejectingSubmission(null)}
              className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-[40px] p-12 max-w-md w-full shadow-2xl space-y-8"
            >
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto text-red-500">
                <X size={40} />
              </div>
              <div className="space-y-2 text-center">
                <h3 className="text-2xl font-bold text-brand-dark uppercase tracking-tight">Reject Submission?</h3>
                <p className="text-gray-400">Please provide a reason for rejecting this submission.</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Internal Note</label>
                <textarea 
                  value={rejectionNote}
                  onChange={e => setRejectionNote(e.target.value)}
                  placeholder="e.g., Duplicate submission, poor image quality..."
                  className="w-full bg-gray-50 border-none rounded-2xl p-6 text-sm focus:ring-2 focus:ring-red-500/20 min-h-[120px]"
                />
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setRejectingSubmission(null);
                    setRejectionNote('');
                  }}
                  className="flex-1 px-8 py-4 font-bold text-gray-400 hover:text-brand-dark transition-colors"
                >
                  Cancel
                </button>
                <button 
                  disabled={!rejectionNote.trim()}
                  onClick={() => {
                    setSubmissions(prev => prev.map(s => 
                      s.id === rejectingSubmission.id 
                        ? { ...s, status: 'Reviewed', rejectionNote: rejectionNote } 
                        : s
                    ));
                    setRejectingSubmission(null);
                    setViewingSubmission(null);
                    setRejectionNote('');
                  }}
                  className="flex-1 px-8 py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                  Confirm Reject
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Comment Delete Confirmation Modal */}
      <AnimatePresence>
        {commentDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCommentDeleteConfirm(null)}
              className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-[40px] p-12 max-w-md w-full shadow-2xl text-center space-y-8"
            >
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto text-red-500">
                <Trash2 size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-brand-dark uppercase tracking-tight">Delete Comment?</h3>
                <p className="text-gray-400">This action cannot be undone. The comment will be permanently removed from the platform.</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setCommentDeleteConfirm(null)}
                  className="flex-1 px-8 py-4 font-bold text-gray-400 hover:text-brand-dark transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setComments(prev => prev.filter(c => c.id !== commentDeleteConfirm));
                    setCommentDeleteConfirm(null);
                  }}
                  className="flex-1 px-8 py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Action Confirmation Modal */}
      <AnimatePresence>
        {userActionConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUserActionConfirm(null)}
              className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-[40px] p-12 max-w-md w-full shadow-2xl text-center space-y-8"
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
                userActionConfirm.type === 'ban' ? 'bg-red-50 text-red-500' : 
                userActionConfirm.type === 'unban' ? 'bg-green-50 text-green-500' :
                'bg-brand-purple/10 text-brand-purple'
              }`}>
                {userActionConfirm.type === 'ban' && <ShieldAlert size={40} />}
                {userActionConfirm.type === 'unban' && <ShieldCheck size={40} />}
                {(userActionConfirm.type === 'promote' || userActionConfirm.type === 'demote') && <Users size={40} />}
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-brand-dark uppercase tracking-tight">
                  {userActionConfirm.type} User?
                </h3>
                <p className="text-gray-400">
                  {userActionConfirm.type === 'ban' && "This user will no longer be able to log in or perform verifications."}
                  {userActionConfirm.type === 'unban' && "This user will regain access to all platform features."}
                  {userActionConfirm.type === 'promote' && "This user will gain full administrative access to the platform."}
                  {userActionConfirm.type === 'demote' && "This user will lose administrative access and become a regular user."}
                </p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setUserActionConfirm(null)}
                  className="flex-1 px-8 py-4 font-bold text-gray-400 hover:text-brand-dark transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    const { type, userId } = userActionConfirm;
                    setUsers(prev => prev.map(u => {
                      if (u.id === userId) {
                        if (type === 'ban') return { ...u, status: 'Banned' };
                        if (type === 'unban') return { ...u, status: 'Active' };
                        if (type === 'promote') return { ...u, role: 'Admin' };
                        if (type === 'demote') return { ...u, role: 'User' };
                      }
                      return u;
                    }));
                    if (viewingUser && viewingUser.id === userId) {
                      setViewingUser((prev: any) => {
                        if (type === 'ban') return { ...prev, status: 'Banned' };
                        if (type === 'unban') return { ...prev, status: 'Active' };
                        if (type === 'promote') return { ...prev, role: 'Admin' };
                        if (type === 'demote') return { ...prev, role: 'User' };
                        return prev;
                      });
                    }
                    setUserActionConfirm(null);
                  }}
                  className={`flex-1 px-8 py-4 text-white rounded-2xl font-bold shadow-lg transition-all hover:scale-105 active:scale-95 ${
                    userActionConfirm.type === 'ban' ? 'bg-red-500 shadow-red-500/20' : 
                    userActionConfirm.type === 'unban' ? 'bg-green-500 shadow-green-500/20' :
                    'bg-brand-purple shadow-brand-purple/20'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<View>('landing');
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState<'login' | 'signup' | null>(null);
  const [showAccountDrawer, setShowAccountDrawer] = useState(false);
  const [showVerdictPrompt, setShowVerdictPrompt] = useState(false);
  const [showVerdictResult, setShowVerdictResult] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [analysisState, setAnalysisState] = useState<{ active: boolean, progress: number, stage: string }>({
    active: false,
    progress: 0,
    stage: ''
  });
  const [toast, setToast] = useState<string | null>(null);

  // Random toast effect
  useEffect(() => {
    const messages = [
      "Amara just verified her skincare serum",
      "New verification from Lagos: Original",
      "Tunde saved ₦45,000 by detecting a fake charger",
      "Sign in to save your verification history",
      "Abdul verified his kids' medicine: Original"
    ];

    const showRandomToast = () => {
      const delay = Math.random() * 15000 + 10000; // 10-25 seconds
      setTimeout(() => {
        setToast(messages[Math.floor(Math.random() * messages.length)]);
        setTimeout(() => setToast(null), 5000);
        showRandomToast();
      }, delay);
    };

    showRandomToast();
  }, []);

  const handleStartUpload = () => {
    setView('upload');
  };

  const handleVerify = async () => {
    const stages = [
      "Checking packaging layout...",
      "Verifying labels and identifiers...",
      "Matching NAFDAC records...",
      "Generating verdict...",
      "Analysis complete."
    ];

    setAnalysisState({ active: true, progress: 0, stage: stages[0] });

    for (let i = 0; i < stages.length; i++) {
      setAnalysisState(prev => ({ ...prev, stage: stages[i], progress: i === stages.length - 1 ? 100 : 23 + (i * 15) }));
      await new Promise(r => setTimeout(r, 1500));
    }

    // Determine result (random for demo, but biased towards high score)
    const rand = Math.random();
    let score = 0;
    let status: 'found' | 'not_found' = 'found';
    let confidence: 'High' | 'Low' | 'None' = 'High';

    if (rand > 0.4) {
      score = Math.floor(Math.random() * 15) + 85;
      status = 'found';
      confidence = 'High';
    } else if (rand > 0.15) {
      score = Math.floor(Math.random() * 40) + 40;
      status = 'found';
      confidence = 'Low';
    } else {
      score = 0;
      status = 'not_found';
      confidence = 'None';
    }

    setVerificationResult({
      score,
      confidence,
      status,
      id: '8XJ29-KD72',
      date: '28 Feb 2026',
      images: ['https://images.unsplash.com/photo-1626544823126-666c5517033a?auto=format&fit=crop&w=800&q=80']
    });

    setAnalysisState(prev => ({ ...prev, active: false }));
    
    if (user) {
      setView('result');
    } else {
      setShowVerdictPrompt(true);
    }
  };

  return (
    <div className="min-h-screen selection:bg-brand-purple/10 selection:text-brand-purple">
      {view !== 'admin' && (
        <Navbar 
          user={user}
          onLogin={() => setShowAuthModal('login')} 
          onTryFree={() => setView('upload')} 
          onPlayGame={() => setView('game')}
          onOpenAccount={() => setShowAccountDrawer(true)}
        />
      )}
      
      <main>
        {view === 'admin' && (
          <AdminPanel 
            user={user} 
            onLogout={() => {
              setUser(null);
              setView('landing');
            }} 
          />
        )}
        {view === 'landing' && (
          <>
            <Hero onUpload={handleStartUpload} />
            <HowItWorks />
            <Stats />
            <Testimonials />
          </>
        )}
        {view === 'upload' && (
          <UploadPage 
            onVerify={handleVerify} 
            onBack={() => setView('landing')} 
          />
        )}
        {view === 'result' && verificationResult && (
          <ResultPage 
            result={verificationResult} 
            onBack={() => setView('landing')} 
            onSubmitReview={() => setView('submission_success')}
          />
        )}
        {view === 'submission_success' && (
          <SubmissionSuccessPage 
            onReset={() => setView('landing')} 
            onPlayGame={() => setView('game')}
          />
        )}
        {view === 'game' && (
          <GamePage onBack={() => setView('landing')} />
        )}
      </main>
      
      {view !== 'admin' && <Footer />}

      {/* Modals & Overlays */}
      <AnimatePresence>
        {analysisState.active && (
          <AnalysisModal progress={analysisState.progress} stage={analysisState.stage} />
        )}

        {showAuthModal && (
          <AuthModal 
            type={showAuthModal} 
            setView={(v) => setShowAuthModal(v as 'login' | 'signup')} 
            onClose={() => setShowAuthModal(null)} 
            onVerified={(userData) => {
              setUser(userData);
              if (userData.role === 'admin') {
                setView('admin');
              } else if (view !== 'landing') {
                setView('result');
              }
              setShowAuthModal(null);
            }}
          />
        )}

        {showAccountDrawer && (
          <AccountDrawer 
            user={user}
            onClose={() => setShowAccountDrawer(false)}
            onLogout={() => {
              setUser(null);
              setShowAccountDrawer(false);
              setView('landing');
            }}
          />
        )}

        {showVerdictPrompt && (
          <VerdictPrompt 
            onAuth={() => {
              setShowVerdictPrompt(false);
              setShowAuthModal('login');
            }}
          />
        )}

        {showVerdictResult && verificationResult && (
          <VerdictResult 
            result={verificationResult}
            onClose={() => setShowVerdictResult(false)} 
          />
        )}

        {toast && (
          <Toast message={toast} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
