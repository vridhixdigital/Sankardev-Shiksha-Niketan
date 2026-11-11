import React, { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  auth,
  PRIMARY_ADMIN_EMAIL,
  SUPER_ADMIN_EMAIL,
  ADMINISTRATIVE_USERS,
  signInWithGooglePopup,
} from '../firebase';
import {
  ShieldAlert,
  GraduationCap,
  Users,
  Award,
  KeyRound,
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldCheck,
  Building2,
  RefreshCw,
  BookOpen,
} from 'lucide-react';

export type DetectedRole = 'super_admin' | 'teacher' | 'student' | 'parent' | 'unknown';
export type PortalLoginMode = 'admin' | 'teacher' | 'student';

export interface RoleMeta {
  role: DetectedRole;
  title: string;
  badgeLabel: string;
  badgeColor: string;
  accentBorder: string;
  icon: React.ReactNode;
  description: string;
  modules: string[];
  isAdministrative: boolean;
}

export function detectRoleFromEmail(rawEmail: string): RoleMeta {
  const email = (rawEmail || '').toLowerCase().trim();

  // 1. Administrative Single User & Super Admins
  const isPrimaryAdmin =
    email === PRIMARY_ADMIN_EMAIL.toLowerCase() ||
    (ADMINISTRATIVE_USERS as readonly string[]).includes(email) ||
    email === SUPER_ADMIN_EMAIL.toLowerCase() ||
    email.startsWith('admin@') ||
    email.startsWith('principal@') ||
    email.startsWith('superadmin@') ||
    email.startsWith('chairman@') ||
    email.startsWith('office@') ||
    email.includes('niketan') ||
    email.includes('sankardevshiksha');

  if (isPrimaryAdmin) {
    return {
      role: 'super_admin',
      title: 'School Administrator',
      badgeLabel: 'School Admin',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700/60',
      accentBorder: 'border-amber-500',
      icon: <ShieldAlert className="w-4 h-4 text-amber-700 dark:text-amber-400" />,
      description: 'Authorized School Administrator · Institutional Governance & School Operations Administration.',
      modules: ['Admissions Approval', 'Biometric Terminal', 'Gradebook Audit', 'User Profiles Master', 'Statutory Records'],
      isAdministrative: true,
    };
  }

  // 2. Teachers & Faculty
  const isTeacher =
    email.includes('.phy@') ||
    email.includes('.eng@') ||
    email.includes('.tchr@') ||
    email.includes('.faculty@') ||
    email.includes('teacher') ||
    email.includes('faculty') ||
    email.includes('prof@') ||
    email.includes('educator') ||
    email.includes('hod@');

  if (isTeacher) {
    return {
      role: 'teacher',
      title: 'Faculty Member · Academic Educator',
      badgeLabel: 'Faculty & Educator',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700/60',
      accentBorder: 'border-emerald-500',
      icon: <GraduationCap className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />,
      description: 'Department Faculty & Academic Educators · ASSEB Curriculum & Senior Secondary Wings.',
      modules: ['Subject Gradebook', 'Skill Endorsements', 'Teacher Biometric Punch', 'Class Notice Feed'],
      isAdministrative: false,
    };
  }

  // 3. Students
  const isStudent =
    email.includes('.std@') ||
    email.includes('.student@') ||
    email.includes('.scholar@') ||
    email.includes('.ba@') ||
    email.includes('student') ||
    email.includes('scholar');

  if (isStudent) {
    return {
      role: 'student',
      title: 'Student Scholar · Academic Identity',
      badgeLabel: 'Student / Scholar',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-700/60',
      accentBorder: 'border-blue-500',
      icon: <Award className="w-4 h-4 text-blue-700 dark:text-blue-400" />,
      description: 'Enrolled Scholar (Class VI–XII & 4-Year B.A. Honours) · Bapadev Kshetra Campus, Gohpur.',
      modules: ['Official Marksheet & GPA', 'Skill XP Milestones', 'Campus Attendance Log', 'Digital Student Pass'],
      isAdministrative: false,
    };
  }

  // 4. Parents & Guardians
  const isParent =
    email.includes('parent') ||
    email.includes('guardian') ||
    email.includes('.parent@');

  if (isParent) {
    return {
      role: 'parent',
      title: 'Parent & Guardian · Ward Portal',
      badgeLabel: 'Parent / Guardian',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-700/60',
      accentBorder: 'border-purple-500',
      icon: <Users className="w-4 h-4 text-purple-700 dark:text-purple-400" />,
      description: 'Parent-Teacher Association (PTA) · Real-time Academic Tracking & Institutional Communication.',
      modules: ['Ward Performance Card', 'Fee Payment Slips', 'Attendance Verification', 'School Bulletins'],
      isAdministrative: false,
    };
  }

  // Default unrecognized
  return {
    role: 'unknown',
    title: 'Smart School Member',
    badgeLabel: 'Role Auto-Detecting...',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    accentBorder: 'border-slate-300',
    icon: <KeyRound className="w-4 h-4 text-slate-500" />,
    description: 'Enter your registered institutional or admission email to automatically detect permissions.',
    modules: ['Role-Based School Workspace', 'Biometric & Academic Records'],
    isAdministrative: false,
  };
}

interface SmartGlobalLoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  onNavigateToAdmissions?: () => void;
  initialEmail?: string;
  initialPortalMode?: PortalLoginMode;
}

export const SmartGlobalLoginDialog: React.FC<SmartGlobalLoginDialogProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onNavigateToAdmissions,
  initialEmail = '',
  initialPortalMode = 'admin',
}) => {
  const [portalMode, setPortalMode] = useState<PortalLoginMode>(initialPortalMode);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
      const detected = detectRoleFromEmail(initialEmail);
      if (detected.role === 'super_admin') setPortalMode('admin');
      else if (detected.role === 'teacher') setPortalMode('teacher');
      else if (detected.role === 'student' || detected.role === 'parent') setPortalMode('student');
    }
  }, [initialEmail]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const roleMeta = detectRoleFromEmail(email);

  // Auto switch portal tab based on detected role if typed
  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (errorMessage) setErrorMessage(null);
    const detected = detectRoleFromEmail(val);
    if (val.length > 3) {
      if (detected.role === 'super_admin' && portalMode !== 'admin') {
        setPortalMode('admin');
      } else if (detected.role === 'teacher' && portalMode !== 'teacher') {
        setPortalMode('teacher');
      } else if ((detected.role === 'student' || detected.role === 'parent') && portalMode !== 'student') {
        setPortalMode('student');
      }
    }
  };

  const handlePortalTabChange = (mode: PortalLoginMode) => {
    setPortalMode(mode);
    setErrorMessage(null);
    setSuccessMessage(null);
    setEmail('');
    setPassword('');
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const cred = await signInWithGooglePopup();
      const signedInEmail = (cred.user.email || '').toLowerCase().trim();
      const isAdminEmail =
        signedInEmail === PRIMARY_ADMIN_EMAIL.toLowerCase() ||
        signedInEmail === SUPER_ADMIN_EMAIL.toLowerCase() ||
        ADMINISTRATIVE_USERS.includes(signedInEmail as any);

      // Isolation check: if user chose admin mode but is not an admin
      if (portalMode === 'admin' && !isAdminEmail) {
        await auth.signOut();
        setErrorMessage(
          'Access Denied: This Google account is not recognized as an authorized School Administrator. Please use an administrator account.'
        );
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Verified with Google Account! Connecting to workspace...');
      setTimeout(() => {
        onLoginSuccess();
        onClose();
      }, 500);
    } catch (err: unknown) {
      console.error('Google Sign-in error:', err);
      const error = err as { message?: string; code?: string };
      if (error.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(error.message || 'Google authentication was cancelled or encountered an error.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your official portal email.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    // Portal isolation validation
    if (portalMode === 'admin') {
      const isAdm =
        cleanEmail.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase() ||
        cleanEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ||
        cleanEmail.includes('admin') ||
        cleanEmail.includes('principal') ||
        cleanEmail.includes('niketan') ||
        cleanEmail.includes('sankardevshiksha');

      if (!isAdm) {
        setErrorMessage(
          'This portal is strictly reserved for School Administrators. Please switch to the "Teacher" or "Student & Parent" portal tab above.'
        );
        return;
      }
    }

    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, cleanEmail, password);
      setSuccessMessage(`Authenticated successfully! Routing to ${roleMeta.title} Workspace...`);
      setTimeout(() => {
        onLoginSuccess();
        onClose();
      }, 600);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      console.warn('Auth error:', error);

      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        if (portalMode === 'student') {
          setErrorMessage(
            'Account not recognized or invalid credentials. Student & parent accounts are created and provided exclusively by the School Admin upon official admission confirmation. If not enrolled yet, please apply through Online Admissions.'
          );
        } else if (portalMode === 'teacher') {
          setErrorMessage(
            'Account not recognized or invalid credentials. Faculty & staff credentials are issued exclusively by the School Administration upon appointment. Please contact the Admin Office.'
          );
        } else {
          setErrorMessage('School Administrator credentials not recognized. Please check your institutional email and password.');
        }
      } else if (error.code === 'auth/wrong-password') {
        setErrorMessage('Invalid password for this account. Please recheck your credentials or click Forgot Password.');
      } else if (error.code === 'auth/weak-password') {
        setErrorMessage('Password is too weak. Please check your credentials.');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage('Invalid institutional email format. Please check your spelling.');
      } else {
        setErrorMessage(error.message || 'Authentication failed. Please verify credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email above to receive password reset instructions.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setSuccessMessage(`Password reset link dispatched to ${cleanEmail}. Check your inbox.`);
    } catch (resetErr: unknown) {
      const rErr = resetErr as { message?: string };
      setErrorMessage(rErr.message || 'Unable to dispatch reset email.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="smart-login-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="bg-slate-950 text-white p-6 pb-4 relative border-b border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white p-1 border border-slate-700 shadow-md shrink-0 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="SSN Gohpur Logo"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://smartschool.asomweb.com/ssn/logo.png';
                }}
                className="w-full h-full object-contain"
              />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-blue-900/60 text-blue-200 border border-blue-700/50">
                <ShieldCheck className="w-3 h-3 text-blue-400" />
                Role-Isolated Portal Gateway
              </div>
              <h2
                id="smart-login-dialog-title"
                className="text-lg sm:text-xl font-bold font-display tracking-tight text-white mt-1 leading-tight"
              >
                Smart School ERP &amp; Role Authentication
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Sankardev Shiksha Niketan, Gohpur · Strictly isolated data &amp; dashboards
              </p>
            </div>
          </div>

          {/* 3 Dedicated Portal Selector Tabs */}
          <div className="grid grid-cols-3 gap-2 mt-5 p-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handlePortalTabChange('admin')}
              className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                portalMode === 'admin'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">School Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handlePortalTabChange('teacher')}
              className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                portalMode === 'teacher'
                  ? 'bg-emerald-600 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Teacher &amp; Faculty</span>
            </button>

            <button
              type="button"
              onClick={() => handlePortalTabChange('student')}
              className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                portalMode === 'student'
                  ? 'bg-blue-600 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Award className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Student / Parent</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 space-y-5">
          {/* Active Portal Header & Detected Role Badge */}
          <div
            className={`p-4 rounded-xl border transition-all duration-300 ${
              portalMode === 'admin'
                ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200'
                : portalMode === 'teacher'
                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                : 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-950 dark:text-blue-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-white/80 dark:bg-slate-800/80 shadow-2xs">
                  {portalMode === 'admin' ? (
                    <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  ) : portalMode === 'teacher' ? (
                    <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  )}
                </span>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider">
                    {portalMode === 'admin'
                      ? 'School Administration Portal'
                      : portalMode === 'teacher'
                      ? 'Faculty & Academic Workspace Gateway'
                      : 'Student & Guardian Scholar Gateway'}
                  </div>
                  <div className="text-sm font-semibold font-display">
                    {portalMode === 'admin'
                      ? 'Authorized Administrator Login'
                      : portalMode === 'teacher'
                      ? 'Teaching Faculty · Subject Gradebook & Biometrics'
                      : 'Scholar Identity · Report Cards, Skills & Transcripts'}
                  </div>
                </div>
              </div>

              {portalMode !== 'admin' && (
                <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-current/10 uppercase tracking-wider">
                  {portalMode.toUpperCase()} PORTAL
                </span>
              )}
            </div>

            <p className="text-xs mt-2 leading-relaxed opacity-90">
              {portalMode === 'admin'
                ? 'Authorized access for designated school administrators and governance.'
                : portalMode === 'teacher'
                ? 'Authorized for department faculty. Strict data isolation: access only assigned class marks and attendance.'
                : 'Authorized for enrolled scholars and parents. Strict data isolation: access only personal academic transcripts and skill XP.'}
            </p>
          </div>

          {/* Quick Real-Time Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-750 font-semibold text-xs flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer disabled:opacity-60"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google (Instant Verified Access)</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-1">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono absolute">
              or institutional email &amp; password
            </span>
          </div>

          {/* Error & Success Messages */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{successMessage}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="dialog-user-email"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {portalMode === 'admin'
                  ? 'School Admin Email *'
                  : portalMode === 'teacher'
                  ? 'Faculty Email / Educator ID *'
                  : 'Student Email / Roll ID / Parent Email *'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="dialog-user-email"
                  type="text"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder={
                    portalMode === 'admin'
                      ? 'admin@ssngohpur.ac.in'
                      : portalMode === 'teacher'
                      ? 'faculty@ssngohpur.ac.in'
                      : 'student@ssngohpur.ac.in'
                  }
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-mono"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="dialog-user-password"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Portal Password *
                </label>
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="dialog-user-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Enter your confidential password"
                  required
                  className="w-full pl-10 pr-11 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 text-sm font-semibold text-white rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                  portalMode === 'admin'
                    ? 'bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-slate-950 font-bold'
                    : portalMode === 'teacher'
                    ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700'
                    : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700'
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Connecting to Firebase Auth...</span>
                  </>
                ) : (
                  <>
                    <span>
                      Sign In to{' '}
                      {portalMode === 'admin'
                        ? 'School Admin Console'
                        : portalMode === 'teacher'
                        ? 'Teacher Faculty Workspace'
                        : 'Student & Parent Portal'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Strict Institutional Credential Notices (Self-Registration Disabled) */}
            <div className="pt-1">
              {portalMode === 'student' && (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 space-y-2.5">
                  <div className="flex items-start gap-2 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Credential Policy: </span>
                      Student and parent portal credentials are generated and provided exclusively by the School Admin upon official admission confirmation. Public self-registration is strictly restricted.
                    </div>
                  </div>
                  {onNavigateToAdmissions && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateToAdmissions();
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>New Applicant? Apply for Student Admission</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {portalMode === 'teacher' && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-2 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Staff Credential Policy: </span>
                    Faculty and staff portal credentials are created exclusively by the School Administration upon official appointment &amp; onboarding. If you do not have your credentials, please contact the Principal / Admin Office.
                  </div>
                </div>
              )}

              {portalMode === 'admin' && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Authorized Leadership Access: </span>
                    Access is restricted strictly to designated Super Admins and School Governance personnel.
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer Info */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            Bapadev Kshetra, Solengi, Gohpur
          </span>
          <span className="font-mono">Code: 035371 · 256-bit SSL</span>
        </div>
      </div>
    </div>
  );
};
