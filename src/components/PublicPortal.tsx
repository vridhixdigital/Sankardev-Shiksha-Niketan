import React, { useEffect, useMemo, useRef, useState } from 'react';
import { User } from 'firebase/auth';
import {
  ArrowRight,
  Bell,
  BookOpen,
  Building2,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  CreditCard,
  Eye,
  EyeOff,
  FileText,
  GraduationCap,
  Key,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Pause,
  Phone,
  Play,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  User as UserIcon,
  Users,
  Volume2,
  VolumeX,
  X,
  Trophy,
  Award,
} from 'lucide-react';
import {
  SSN_ACADEMIC_PILLARS,
  SSN_ACADEMIC_STREAMS,
  SSN_ACTIVITIES,
  SSN_BOARD_RESULTS,
  SSN_DEGREE_PROGRAMS,
  SSN_GENERAL_INFO_TABLE,
  SSN_HOSTELS,
  SSN_IMAGES,
  SSN_INFRASTRUCTURE_METRICS,
  SSN_LEADERSHIP,
  SSN_OFFICIAL_DOCUMENTS,
  SSN_PROMO_VIDEO_URL,
  SSN_PUBLIC_NOTICES,
  SSN_SCHOOL_INFO,
} from '../data/ssnPublicData';
import { AdmissionRecordDoc, NotificationItemDoc, WallOfFameDoc } from '../types/erp';
import { printDocument } from '../utils/printDocument';
import { PWAInstallButton } from './PWAInstallButton';
import { SmartGlobalLoginDialog, detectRoleFromEmail } from './SmartGlobalLoginDialog';

export type PublicPageTab =
  | 'home'
  | 'about'
  | 'academics'
  | 'facilities'
  | 'admissions'
  | 'wall_of_fame';

interface PublicPortalProps {
  activePage: PublicPageTab;
  setActivePage: (page: PublicPageTab) => void;
  onOpenErpPortal: () => void;
  isAuthenticated: boolean;
  currentUser?: User | null;
  userEmail?: string | null;
  onSignOut?: () => void;
  liveNotifications: NotificationItemDoc[];
  liveAdmissions: AdmissionRecordDoc[];
  liveWallOfFame?: WallOfFameDoc[];
  onSubmitOnlineAdmission: (formData: {
    applicantName: string;
    applyingForClass: string;
    stream: string;
    guardianName: string;
    contactPhone: string;
    contactEmail: string;
    previousSchool: string;
    percentageLastExam: number;
    studentPhoto?: string;
    photoType?: 'url' | 'file';
    firstName?: string;
    lastName?: string;
    gender?: string;
    dob?: string;
    mobileNumber?: string;
    caste?: string;
    religion?: string;
    bloodGroup?: string;
    hostelRequired?: string;
    portalPassword?: string;
    fatherName?: string;
    guardianIs?: string;
    guardianRelation?: string;
    guardianPhone?: string;
    guardianEmail?: string;
    guardianOccupation?: string;
    guardianAddress?: string;
    permanentAddress?: string;
    bankAccountNo?: string;
    bankAccountHolder?: string;
    bankName?: string;
    ifscCode?: string;
  }) => Promise<AdmissionRecordDoc>;
}

export const PublicPortal: React.FC<PublicPortalProps> = ({
  activePage,
  setActivePage,
  onOpenErpPortal,
  isAuthenticated,
  currentUser,
  userEmail,
  onSignOut,
  liveNotifications,
  liveAdmissions,
  liveWallOfFame = [],
  onSubmitOnlineAdmission,
}) => {
  const [academicFilter, setAcademicFilter] = useState<'all' | 'school' | 'degree'>('all');
  const [galleryFilter, setGalleryFilter] = useState<'all' | 'campus' | 'labs' | 'library' | 'sports'>('all');
  const [notifBoardFilter, setNotifBoardFilter] = useState<'all' | 'Academic' | 'Admission' | 'General'>('all');
  const [wofCategoryFilter, setWofCategoryFilter] = useState<string>('all');

  const filteredPublicWof = useMemo(() => {
    return liveWallOfFame.filter((item) => {
      return wofCategoryFilter === 'all' || item.category === wofCategoryFilter;
    });
  }, [liveWallOfFame, wofCategoryFilter]);
  const [selectedDoc, setSelectedDoc] = useState<{
    title: string;
    refNo: string;
    authority: string;
    status: string;
    summary: string;
  } | null>(null);

  // Global Smart Dialog Login State
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [loginDialogEmail, setLoginDialogEmail] = useState('');

  // Dynamic Avatar User Menu State
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real-time detected role metadata from email
  const userRoleMeta = useMemo(() => {
    return detectRoleFromEmail(userEmail || currentUser?.email || '');
  }, [userEmail, currentUser]);

  // Hero Section Video Autoplay & Controls State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);

  // Safe playback helper that gracefully handles DOM removal and playback abortion
  const safePlayVideo = (videoEl: HTMLVideoElement | null) => {
    if (!videoEl || !videoEl.isConnected) return;
    try {
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (videoEl.isConnected) {
              setIsVideoPlaying(true);
            }
          })
          .catch((err: unknown) => {
            const error = err as Error;
            // Gracefully catch and ignore interrupted DOM removal or pause aborts
            if (
              error?.name === 'AbortError' ||
              error?.message?.includes('interrupted') ||
              error?.message?.includes('removed from the document')
            ) {
              return;
            }
            setIsVideoPlaying(false);
          });
      }
    } catch {
      // Ignore synchronous playback errors
    }
  };

  useEffect(() => {
    const video = videoRef.current;

    if (activePage === 'home' && video && video.isConnected) {
      video.defaultMuted = true;
      video.muted = true;
      safePlayVideo(video);
    }

    return () => {
      if (video) {
        try {
          video.pause();
        } catch {
          // Ignore pause error on unmount
        }
      }
    };
  }, [activePage]);

  // Dynamic SEO metadata synchronizer
  useEffect(() => {
    const seoMap: Record<
      string,
      { title: string; description: string; ogTitle: string }
    > = {
      home: {
        title: 'Sankardev Shiksha Niketan - Gohpur | School Portal & ERP',
        description:
          'Official public portal and full-stack School ERP for Sankardev Shiksha Niketan, Gohpur (SSN Gohpur), featuring online admissions, role-based dashboards, and biometric tracking.',
        ogTitle: 'Sankardev Shiksha Niketan - Gohpur | School Portal & ERP',
      },
      about: {
        title: 'About & Leadership | Sankardev Shiksha Niketan, Gohpur',
        description:
          'Learn about SSN Gohpur, founding visionary Chairman Mr. Uday Aditya Goswami, SAILAJA SANKKALP TRUST governance, and institutional history at Bapadev Kshetra.',
        ogTitle: 'About & Leadership | Sankardev Shiksha Niketan, Gohpur',
      },
      academics: {
        title: 'Academic Programs & Curriculum | SSN Gohpur',
        description:
          'Explore academic curricula from Class VI to XII (Science, Arts, Commerce) and 4-Year B.A. Honours programs with civil services mentoring at SSN Gohpur.',
        ogTitle: 'Academic Programs & Curriculum | SSN Gohpur',
      },
      facilities: {
        title: 'Campus Infrastructure & Laboratories | SSN Gohpur',
        description:
          'Discover our 14,715 sq m eco-campus at Bapadev Kshetra, featuring modern science labs, computer suites, digital library, and residential hostels.',
        ogTitle: 'Campus Infrastructure & Laboratories | SSN Gohpur',
      },
      admissions: {
        title: 'Online Admission 2026-27 | Sankardev Shiksha Niketan, Gohpur',
        description:
          'Official Admission Form for Academic Session 2026-27. Submit online application, receive immediate barcoded acknowledgment slip, and access smart student portal.',
        ogTitle: 'Online Admission 2026-27 | Sankardev Shiksha Niketan, Gohpur',
      },
    };

    const currentSeo = seoMap[activePage] || seoMap.home;
    document.title = currentSeo.title;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', currentSeo.description);
    }
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', currentSeo.ogTitle);
    }
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', currentSeo.description);
    }
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) {
      twTitle.setAttribute('content', currentSeo.ogTitle);
    }
    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) {
      twDesc.setAttribute('content', currentSeo.description);
    }
  }, [activePage]);

  const toggleVideoMute = () => {
    if (videoRef.current) {
      const nextMuted = !isVideoMuted;
      videoRef.current.muted = nextMuted;
      setIsVideoMuted(nextMuted);
    }
  };

  const toggleVideoPlay = () => {
    const video = videoRef.current;
    if (video && video.isConnected) {
      if (video.paused) {
        safePlayVideo(video);
      } else {
        try {
          video.pause();
        } catch {
          // Ignore pause errors
        }
        setIsVideoPlaying(false);
      }
    }
  };

  // Dynamic Auto-Fetching Real-Time Notifications Board State
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('Just now');
  const [isRefreshingNotifs, setIsRefreshingNotifs] = useState(false);
  const [notifSearch, setNotifSearch] = useState('');
  const [selectedNoticeModal, setSelectedNoticeModal] = useState<{
    id: string;
    title: string;
    category: string;
    date: string;
    summary: string;
    priority?: string;
    isLiveBroadcast?: boolean;
    sender?: string;
  } | null>(null);

  useEffect(() => {
    const updateSyncClock = () => {
      const d = new Date();
      setLastSyncedTime(
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateSyncClock();
    const timer = setInterval(updateSyncClock, 20000);
    return () => clearInterval(timer);
  }, []);

  const handleManualNotifRefresh = () => {
    setIsRefreshingNotifs(true);
    setTimeout(() => {
      const d = new Date();
      setLastSyncedTime(
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setIsRefreshingNotifs(false);
    }, 500);
  };

  const combinedNotices = useMemo(() => {
    const liveItems = (liveNotifications || []).map((ln) => ({
      id: ln.id,
      title: ln.title,
      category: ln.category || 'General',
      date: 'Live Broadcast',
      summary: ln.message,
      priority: ln.priority === 'urgent' ? 'Urgent Alert' : ln.priority === 'high' ? 'High Priority' : 'Official Broadcast',
      isLiveBroadcast: true,
      sender: ln.senderName || 'School Administration ERP',
    }));

    const standardItems = SSN_PUBLIC_NOTICES.map((pn) => ({
      id: pn.id,
      title: pn.title,
      category: pn.category,
      date: pn.date,
      summary: pn.summary,
      priority: pn.category === 'Admission' ? 'High Priority' : 'Official Circular',
      isLiveBroadcast: false,
      sender: 'Office of the Chairman, SAILAJA SANKKALP TRUST',
    }));

    return [...liveItems, ...standardItems];
  }, [liveNotifications]);

  const filteredNotices = useMemo(() => {
    return combinedNotices.filter((n) => {
      const matchesCategory =
        notifBoardFilter === 'all' ||
        n.category.toLowerCase().includes(notifBoardFilter.toLowerCase());
      const matchesSearch =
        !notifSearch.trim() ||
        n.title.toLowerCase().includes(notifSearch.toLowerCase()) ||
        n.summary.toLowerCase().includes(notifSearch.toLowerCase()) ||
        n.category.toLowerCase().includes(notifSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [combinedNotices, notifBoardFilter, notifSearch]);

  // Official Online Admission Form State (Academic Session 2026-27)
  const [admForm, setAdmForm] = useState({
    // Basic Details
    photoType: 'file' as 'url' | 'file',
    studentPhoto: '',
    applyingForClass: 'VI',
    firstName: '',
    lastName: '',
    gender: 'Male',
    dob: '',
    mobileNumber: '',
    contactEmail: userEmail || '',
    caste: 'General',
    religion: 'Hinduism',
    bloodGroup: 'A+',
    hostelRequired: 'Yes',
    // Portal Login Credentials
    portalPassword: '',
    showPassword: false,
    // Parent/Guardian Details
    fatherName: '',
    guardianIs: 'Father',
    guardianRelation: 'Father',
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    guardianOccupation: '',
    guardianAddress: '',
    // Address Details
    permanentAddress: '',
    // Miscellaneous & Bank Details
    bankAccountNo: '',
    bankAccountHolder: '',
    bankName: '',
    ifscCode: '',
    // Previous School Details
    previousSchool: '',
    percentageLastExam: '88.5',
  });
  const [admSubmitting, setAdmSubmitting] = useState(false);
  const [admError, setAdmError] = useState<string | null>(null);
  const [generatedSlip, setGeneratedSlip] = useState<AdmissionRecordDoc | null>(null);
  const [isSlipPopupOpen, setIsSlipPopupOpen] = useState(false);
  const [offlineModalOpen, setOfflineModalOpen] = useState(false);

  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setAdmError('Student photo exceeds maximum allowed size of 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAdmForm((prev) => ({ ...prev, studentPhoto: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Status Checker State
  const [statusSearchQuery, setStatusSearchQuery] = useState('');
  const [statusSearchResult, setStatusSearchResult] = useState<AdmissionRecordDoc | null | 'not_found'>(null);

  // Contact / Campus Tour Inquiry State
  const [contactForm, setContactForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: 'Campus Tour Appointment (9:00 AM - 2:00 PM)',
    message: '',
  });
  const [contactSubmitted, setContactSubmitted] = useState<string | null>(null);

  const handleAdmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdmError(null);

    const fName = admForm.firstName.trim();
    if (!fName) {
      setAdmError('Please provide Student First Name.');
      return;
    }
    if (!admForm.contactEmail.includes('@')) {
      setAdmError('Please provide a valid Student Email address.');
      return;
    }
    if (!admForm.portalPassword || admForm.portalPassword.length < 6) {
      setAdmError('Portal Password must be at least 6 characters.');
      return;
    }
    if (!admForm.guardianName.trim()) {
      setAdmError('Please provide Guardian Name.');
      return;
    }
    if (!admForm.guardianPhone.trim() && !admForm.mobileNumber.trim()) {
      setAdmError('Please provide a valid Guardian or Mobile Number.');
      return;
    }

    setAdmSubmitting(true);
    try {
      const applicantFullName = `${fName} ${admForm.lastName.trim()}`.trim();
      let derivedStream = 'General Secondary';
      if (admForm.applyingForClass.includes('Science')) {
        derivedStream = 'Science (PCM / PCB)';
      } else if (admForm.applyingForClass.includes('Arts')) {
        derivedStream = 'Arts (Humanities & Social Sciences)';
      } else if (admForm.applyingForClass.includes('Commerce')) {
        derivedStream = 'Commerce (Accountancy & Business)';
      } else if (admForm.applyingForClass.includes('B.A.')) {
        derivedStream = 'B.A. Honours Degree';
      }

      const primaryPhone = admForm.mobileNumber.trim() || admForm.guardianPhone.trim() || '+91 9954656161';
      const pct = Math.min(100, Math.max(0, Number(admForm.percentageLastExam) || 85));

      const record = await onSubmitOnlineAdmission({
        applicantName: applicantFullName,
        applyingForClass: admForm.applyingForClass,
        stream: derivedStream,
        guardianName: admForm.guardianName.trim(),
        contactPhone: primaryPhone,
        contactEmail: admForm.contactEmail.trim(),
        previousSchool: admForm.previousSchool.trim() || 'Assam Board School',
        percentageLastExam: pct,
        studentPhoto: admForm.studentPhoto.trim(),
        photoType: admForm.photoType,
        firstName: fName,
        lastName: admForm.lastName.trim(),
        gender: admForm.gender,
        dob: admForm.dob,
        mobileNumber: admForm.mobileNumber.trim(),
        caste: admForm.caste,
        religion: admForm.religion,
        bloodGroup: admForm.bloodGroup,
        hostelRequired: admForm.hostelRequired,
        portalPassword: admForm.portalPassword,
        fatherName: admForm.fatherName.trim(),
        guardianIs: admForm.guardianIs,
        guardianRelation: admForm.guardianRelation.trim(),
        guardianPhone: admForm.guardianPhone.trim() || primaryPhone,
        guardianEmail: admForm.guardianEmail.trim(),
        guardianOccupation: admForm.guardianOccupation.trim(),
        guardianAddress: admForm.guardianAddress.trim(),
        permanentAddress: admForm.permanentAddress.trim(),
        bankAccountNo: admForm.bankAccountNo.trim(),
        bankAccountHolder: admForm.bankAccountHolder.trim(),
        bankName: admForm.bankName.trim(),
        ifscCode: admForm.ifscCode.trim(),
      });
      setGeneratedSlip(record);
      setIsSlipPopupOpen(true);
    } catch (err) {
      setAdmError(err instanceof Error ? err.message : 'Unable to submit online admission application.');
    } finally {
      setAdmSubmitting(false);
    }
  };

  const handleCheckApplicationStatus = (e: React.FormEvent) => {
    e.preventDefault();
    const q = statusSearchQuery.trim().toUpperCase();
    if (!q) return;
    const found = liveAdmissions.find(
      (a) =>
        a.applicationNo.toUpperCase() === q ||
        a.applicantName.toUpperCase().includes(q)
    );
    if (found) {
      setStatusSearchResult(found);
    } else if (q === 'SSN-2026-1041') {
      setStatusSearchResult({
        id: 'adm_2026_1041',
        applicationNo: 'SSN-2026-1041',
        applicantName: 'Niharika Goswami',
        applyingForClass: 'Class XI (Science Stream)',
        stream: 'Science (PCM + Biology)',
        guardianName: 'Debajit Goswami',
        contactPhone: '+91 9435122334',
        contactEmail: 'niharika.goswami@gmail.com',
        previousSchool: 'Gohpur High School',
        percentageLastExam: 94.5,
        feeAmount: 14800,
        feeStatus: 'paid',
        applicationStatus: 'enrolled',
        ownerUid: 'system',
      });
    } else {
      setStatusSearchResult('not_found');
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.fullName.trim() || !contactForm.phone.trim()) return;
    setContactSubmitted(
      `Thank you, ${contactForm.fullName}. Your inquiry regarding "${contactForm.subject}" has been logged with the SSN Gohpur Reception (+91 9954656161).`
    );
    setContactForm({
      fullName: '',
      email: '',
      phone: '',
      subject: 'Campus Tour Appointment (9:00 AM - 2:00 PM)',
      message: '',
    });
  };

  const galleryItems = [
    {
      id: 'gal-1',
      category: 'campus',
      title: 'Bapadev Kshetra Main Academic Block',
      meta: 'Solengi, Gohpur · 14,715 sq mtr Campus Area',
      image: SSN_IMAGES.campusHero,
    },
    {
      id: 'gal-2',
      category: 'labs',
      title: 'Senior Secondary Physics & Computing Laboratory',
      meta: '470 sq mtr Lab Complex · ASSEB Practical Center',
      image: SSN_IMAGES.scienceLab,
    },
    {
      id: 'gal-3',
      category: 'library',
      title: 'Central Reference Library & Reading Hall',
      meta: 'Textbooks · Periodicals · APSC / UPSC Reference Section',
      image: SSN_IMAGES.libraryHall,
    },
    {
      id: 'gal-4',
      category: 'sports',
      title: 'Outdoor Athletics Track & Cultural Amphitheater',
      meta: 'Monday – Saturday · 4:00 PM – 6:00 PM Training',
      image: SSN_IMAGES.sportsArena,
    },
  ].filter((item) => galleryFilter === 'all' || item.category === galleryFilter);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-6 lg:px-10 py-4 flex items-center justify-between gap-8 no-print">
        {/* Zone 1: Official Logo Emblem & Wordmark */}
        <button
          type="button"
          onClick={() => setActivePage('home')}
          className="flex items-center gap-3 text-left group shrink-0 focus-visible:outline-2 focus-visible:outline-blue-700 cursor-pointer"
        >
          <img
            src={SSN_IMAGES.schoolLogo}
            alt="Sankardev Shiksha Niketan Gohpur Logo"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = SSN_IMAGES.schoolLogoLocal;
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-full bg-white p-0.5 border border-slate-200 shadow-2xs shrink-0 group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="text-base sm:text-xl font-bold tracking-tight text-slate-900 font-display whitespace-nowrap leading-tight">
              SSN Gohpur
            </span>
            <span className="text-[10px] text-slate-500 font-medium hidden sm:block leading-none mt-0.5">
              Sankardev Shiksha Niketan
            </span>
          </div>
        </button>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setActivePage('home')}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activePage === 'home'
                ? 'border-blue-800 text-slate-950 font-semibold'
                : 'border-transparent hover:text-slate-950 hover:border-slate-300'
            }`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => setActivePage('about')}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activePage === 'about'
                ? 'border-blue-800 text-slate-950 font-semibold'
                : 'border-transparent hover:text-slate-950 hover:border-slate-300'
            }`}
          >
            About &amp; Leadership
          </button>
          <button
            type="button"
            onClick={() => setActivePage('academics')}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activePage === 'academics'
                ? 'border-blue-800 text-slate-950 font-semibold'
                : 'border-transparent hover:text-slate-950 hover:border-slate-300'
            }`}
          >
            Academics
          </button>
          <button
            type="button"
            onClick={() => setActivePage('facilities')}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activePage === 'facilities'
                ? 'border-blue-800 text-slate-950 font-semibold'
                : 'border-transparent hover:text-slate-950 hover:border-slate-300'
            }`}
          >
            Infrastructure
          </button>
          <button
            type="button"
            onClick={() => setActivePage('admissions')}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activePage === 'admissions'
                ? 'border-blue-800 text-slate-950 font-semibold'
                : 'border-transparent hover:text-slate-950 hover:border-slate-300'
            }`}
          >
            Admissions &amp; Updates
          </button>
          <button
            type="button"
            onClick={() => setActivePage('wall_of_fame')}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activePage === 'wall_of_fame'
                ? 'border-amber-600 text-amber-900 font-bold'
                : 'border-transparent hover:text-amber-800 hover:border-amber-300'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            Wall of Fame
          </button>
        </nav>

        {/* Zone 3: Dynamic Avatar Header Nav + School Portal Action + PWA install */}
        <div className="flex items-center gap-2.5 shrink-0">
          <PWAInstallButton />
          {isAuthenticated ? (
            <div className="flex items-center gap-2 relative" ref={userMenuRef}>
              {/* Dynamic Avatar Pill with Dropdown Trigger */}
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-300 transition-all cursor-pointer group"
                title="Account & Role Menu"
              >
                <div className="relative">
                  {currentUser?.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="Avatar"
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-blue-500/40"
                    />
                  ) : (
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs ${
                        userRoleMeta.isAdministrative
                          ? 'bg-gradient-to-tr from-amber-600 to-amber-400'
                          : userRoleMeta.role === 'teacher'
                          ? 'bg-gradient-to-tr from-emerald-600 to-emerald-400'
                          : 'bg-gradient-to-tr from-blue-700 to-indigo-500'
                      }`}
                    >
                      {currentUser?.email?.[0]?.toUpperCase() ||
                        userEmail?.[0]?.toUpperCase() ||
                        'U'}
                    </div>
                  )}
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white absolute -bottom-0.5 -right-0.5 animate-pulse" />
                </div>

                <div className="hidden xl:flex flex-col text-left leading-tight">
                  <span className="text-[11px] font-bold text-slate-900 truncate max-w-[110px]">
                    {currentUser?.displayName ||
                      userEmail?.split('@')[0] ||
                      'Member'}
                  </span>
                  <span
                    className={`text-[9px] font-semibold px-1 py-0.2 rounded w-fit ${
                      userRoleMeta.isAdministrative
                        ? 'bg-amber-100 text-amber-800'
                        : userRoleMeta.role === 'teacher'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {userRoleMeta.badgeLabel}
                  </span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dynamic User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 text-slate-800">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="relative shrink-0">
                      {currentUser?.photoURL ? (
                        <img
                          src={currentUser.photoURL}
                          alt="Avatar"
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30"
                        />
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-xs ${
                            userRoleMeta.isAdministrative
                              ? 'bg-gradient-to-tr from-amber-600 to-amber-400'
                              : userRoleMeta.role === 'teacher'
                              ? 'bg-gradient-to-tr from-emerald-600 to-emerald-400'
                              : 'bg-gradient-to-tr from-blue-700 to-indigo-500'
                          }`}
                        >
                          {currentUser?.email?.[0]?.toUpperCase() ||
                            userEmail?.[0]?.toUpperCase() ||
                            'U'}
                        </div>
                      )}
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white absolute -bottom-0.5 -right-0.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {currentUser?.displayName || 'Authenticated Member'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono truncate">
                        {userEmail || currentUser?.email}
                      </div>
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            userRoleMeta.isAdministrative
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : userRoleMeta.role === 'teacher'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}
                        >
                          {userRoleMeta.badgeLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="py-2 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenErpPortal();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 transition-colors cursor-pointer shadow-xs"
                    >
                      <span className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-300" />
                        <span>Open School Portal</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <p className="px-3 text-[10px] text-slate-500">
                      {userRoleMeta.description}
                    </p>
                  </div>

                  {onSignOut && (
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onSignOut();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:text-rose-800 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Sign Out of School Portal</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Primary Direct Action Button: School Portal */}
              <button
                type="button"
                onClick={onOpenErpPortal}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0 shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-300" />
                <span>School Portal</span>
              </button>

              {/* Direct Log Out Button */}
              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  title="Sign Out"
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-slate-200 cursor-pointer shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsLoginDialogOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0 shadow-xs flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-5 h-5 rounded-full bg-blue-800 border border-blue-400/40 flex items-center justify-center text-blue-200 group-hover:bg-blue-700">
                <KeyRound className="w-3 h-3 text-blue-200" />
              </div>
              <span>School Portal Login</span>
            </button>
          )}
        </div>
      </header>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto no-print">
        <div className="flex items-center gap-2 shrink-0">
          <PWAInstallButton />
          {isAuthenticated ? (
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                    userRoleMeta.isAdministrative
                      ? 'bg-amber-600'
                      : userRoleMeta.role === 'teacher'
                      ? 'bg-emerald-600'
                      : 'bg-blue-800'
                  }`}
                >
                  {currentUser?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-white absolute -bottom-0.5 -right-0.5" />
              </div>
              <button
                type="button"
                onClick={onOpenErpPortal}
                className="px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-900 rounded-lg shrink-0 whitespace-nowrap flex items-center gap-1 cursor-pointer"
              >
                <Building2 className="w-3 h-3 text-blue-300" />
                <span>School Portal</span>
              </button>
              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs shrink-0 cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsLoginDialogOpen(true)}
              className="px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-900 rounded-lg shrink-0 whitespace-nowrap flex items-center gap-1 cursor-pointer"
            >
              <KeyRound className="w-3 h-3 text-blue-200" />
              <span>School Portal Login</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
        {(
          [
            ['home', 'Home'],
            ['about', 'About & Leadership'],
            ['academics', 'Academics'],
            ['facilities', 'Infrastructure'],
            ['admissions', 'Admissions'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActivePage(key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
              activePage === key
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {label}
          </button>
        ))}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1">
        {activePage === 'home' && (
          <div>
            {/* Hero Section — 2-Column Split with Full-Width KPI Strip Below */}
            <section className="bg-white border-b border-slate-200">
              <div className="max-w-[1360px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
                  <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <p className="text-xs font-medium text-slate-500 tracking-wide">
                        Sankardev Shiksha Niketan, Gohpur · Affiliation No: {SSN_SCHOOL_INFO.affiliationNo} · Code: {SSN_SCHOOL_INFO.schoolCode}
                      </p>
                      <h1
                        className="font-display font-bold text-slate-950 tracking-tight leading-[1.12]"
                        style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)' }}
                      >
                        Academic Rigor, Moral Character, and Holistic Excellence in Biswanath.
                      </h1>
                      <p className="text-base text-slate-600 leading-relaxed max-w-[65ch]">
                        Located at Bapadev Kshetra, Solengi, Gohpur, Sankardev Shiksha Niketan (SSN Gohpur) offers comprehensive education from Class VI to XII (Science, Arts, and Commerce) alongside 4-Year B.A. Honours Degree Programs and dedicated APSC/UPSC civil services mentorship.
                      </p>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setActivePage('admissions')}
                        className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
                      >
                        <span>Online Admission 2026–27</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={onOpenErpPortal}
                        className="px-5 py-2.5 text-sm font-semibold text-slate-800 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
                      >
                        <Building2 className="w-4 h-4 text-blue-900" />
                        <span>Open School Portal</span>
                      </button>
                    </div>

                    <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>Bapadev Kshetra, Solengi, Pin: 784168</span>
                      <span aria-hidden="true">·</span>
                      <span>Founder &amp; Chairman: {SSN_SCHOOL_INFO.chairmanName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">Helpline: {SSN_SCHOOL_INFO.phone}</span>
                    </div>
                  </div>

                  <div className="lg:col-span-5">
                    <div className="relative h-full min-h-[340px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 shadow-md group">
                      <video
                        ref={videoRef}
                        autoPlay
                        muted={isVideoMuted}
                        loop
                        playsInline
                        poster={SSN_IMAGES.campusHero}
                        preload="auto"
                        onPlay={() => setIsVideoPlaying(true)}
                        onPause={() => setIsVideoPlaying(false)}
                        className="w-full h-full object-cover"
                      >
                        <source src={SSN_PROMO_VIDEO_URL} type="video/mp4" />
                        <img
                          src={SSN_IMAGES.campusHero}
                          alt="Sankardev Shiksha Niketan Gohpur Campus at Bapadev Kshetra"
                          className="w-full h-full object-cover"
                        />
                      </video>

                      {/* Top Badges & Audio/Playback Controls */}
                      <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-auto">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/70 text-white backdrop-blur-md border border-white/15 shadow-xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>Campus Tour Video</span>
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={toggleVideoMute}
                            className="p-1.5 bg-black/70 hover:bg-black/90 text-white rounded-lg backdrop-blur-md border border-white/15 transition-colors cursor-pointer shadow-xs"
                            title={isVideoMuted ? 'Unmute video audio' : 'Mute video audio'}
                            aria-label={isVideoMuted ? 'Unmute video audio' : 'Mute video audio'}
                          >
                            {isVideoMuted ? (
                              <VolumeX className="w-4 h-4 text-slate-300" />
                            ) : (
                              <Volume2 className="w-4 h-4 text-emerald-400" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={toggleVideoPlay}
                            className="p-1.5 bg-black/70 hover:bg-black/90 text-white rounded-lg backdrop-blur-md border border-white/15 transition-colors cursor-pointer shadow-xs"
                            title={isVideoPlaying ? 'Pause promo video' : 'Play promo video'}
                            aria-label={isVideoPlaying ? 'Pause promo video' : 'Play promo video'}
                          >
                            {isVideoPlaying ? (
                              <Pause className="w-4 h-4 text-white" />
                            ) : (
                              <Play className="w-4 h-4 text-white" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Video Caption Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-6 text-white pointer-events-none">
                        <p className="text-xs text-slate-200">
                          SAILAJA SANKKALP TRUST · Established {SSN_SCHOOL_INFO.established}
                        </p>
                        <p className="text-lg font-display font-semibold mt-1">
                          Bapadev Kshetra Academic Campus, Solengi, Gohpur
                        </p>
                        <p className="text-xs text-slate-300 mt-1">
                          14,715 sq mtr eco-campus · 20 Classrooms · 5 Advanced Labs · Boys &amp; Girls Hostels
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Full-Width 4-Column Institutional KPI Row Below Hero */}
                <div className="mt-10 pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {SSN_SCHOOL_INFO.stats.map((st, idx) => (
                    <div key={idx} className="p-5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="text-2xl lg:text-3xl font-bold text-slate-950 font-mono tabular-nums">
                        {st.value}
                      </div>
                      <div className="text-sm font-semibold text-slate-800 mt-1">{st.label}</div>
                      <div className="text-xs text-slate-500 mt-1">{st.subtext}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Overview Dashboard: Board Examination Results (2023-2025) — Claim-to-Proof Adjacency */}
            <section className="py-14 lg:py-16 bg-slate-50 border-b border-slate-200">
              <div className="max-w-[1360px] mx-auto px-6 lg:px-10">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
                  <div>
                    <p className="text-xs font-medium text-blue-900">
                      Overview Dashboard · Verified Board Examination Performance (2023–2025)
                    </p>
                    <h2 className="text-2xl lg:text-3xl font-display font-bold text-slate-950 mt-1">
                      99.45% Cumulative Pass Rate Across ASSEB Examinations
                    </h2>
                  </div>
                  <div className="text-xs text-slate-600 font-mono tabular-nums">
                    Total Passed: {SSN_BOARD_RESULTS.summary.totalPassedRatio} Students · Perfect 100% Sessions: {SSN_BOARD_RESULTS.summary.perfectYears}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Class X Table */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-baseline justify-between pb-4 mb-4 border-b border-slate-200">
                      <div>
                        <h3 className="text-lg font-display font-bold text-slate-900">
                          {SSN_BOARD_RESULTS.classX.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Secondary School Examination Performance
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-emerald-700 font-mono tabular-nums">
                          {SSN_BOARD_RESULTS.classX.overallRate}
                        </span>
                        <span className="block text-xs text-slate-500">Overall Average</span>
                      </div>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-xs text-slate-500">
                          <th className="py-2.5 text-left font-medium">Academic Session</th>
                          <th className="py-2.5 text-right font-medium">Registered</th>
                          <th className="py-2.5 text-right font-medium">Passed</th>
                          <th className="py-2.5 text-right font-medium">Pass %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                        {SSN_BOARD_RESULTS.classX.rows.map((row) => (
                          <tr key={row.year} className="hover:bg-slate-50">
                            <td className="py-3 text-slate-900 font-medium">{row.year}</td>
                            <td className="py-3 text-right text-slate-600">{row.registered}</td>
                            <td className="py-3 text-right text-slate-600">{row.passed}</td>
                            <td className="py-3 text-right font-semibold text-emerald-700">
                              {row.passPercentage}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Class XII Table */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-baseline justify-between pb-4 mb-4 border-b border-slate-200">
                      <div>
                        <h3 className="text-lg font-display font-bold text-slate-900">
                          {SSN_BOARD_RESULTS.classXII.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Higher Secondary Final Examination Performance
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-emerald-700 font-mono tabular-nums">
                          {SSN_BOARD_RESULTS.classXII.overallRate}
                        </span>
                        <span className="block text-xs text-slate-500">Overall Average</span>
                      </div>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-xs text-slate-500">
                          <th className="py-2.5 text-left font-medium">Academic Session</th>
                          <th className="py-2.5 text-right font-medium">Registered</th>
                          <th className="py-2.5 text-right font-medium">Passed</th>
                          <th className="py-2.5 text-right font-medium">Pass %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                        {SSN_BOARD_RESULTS.classXII.rows.map((row) => (
                          <tr key={row.year} className="hover:bg-slate-50">
                            <td className="py-3 text-slate-900 font-medium">{row.year}</td>
                            <td className="py-3 text-right text-slate-600">{row.registered}</td>
                            <td className="py-3 text-right text-slate-600">{row.passed}</td>
                            <td className="py-3 text-right font-semibold text-emerald-700">
                              {row.passPercentage}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            {/* Leadership Stewardship & Dynamic Auto-Fetching Real-Time Notice Board */}
            <section className="py-14 lg:py-16 bg-white border-b border-slate-200">
              <div className="max-w-[1360px] mx-auto px-6 lg:px-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-900">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Official Institutional Stewardship &amp; Information Desk
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-display font-bold text-slate-950 mt-1">
                      Founder’s Vision &amp; Dynamic Live Notice Board
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Auto-Fetching Live Feed
                    </span>
                    <button
                      type="button"
                      onClick={() => setActivePage('about')}
                      className="text-xs font-semibold text-blue-900 hover:underline whitespace-nowrap"
                    >
                      Trust &amp; Governance Structure →
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  {/* Founder & Chairman Profile with Full Profile Photo */}
                  <div className="lg:col-span-5 bg-slate-50 rounded-2xl border border-slate-200 p-6 lg:p-7 flex flex-col justify-between shadow-xs">
                    <div className="space-y-5">
                      <div className="flex flex-col sm:flex-row gap-5 items-start">
                        <div className="relative group shrink-0 mx-auto sm:mx-0">
                          <img
                            src={SSN_IMAGES.chairmanPortrait}
                            alt="Mr. Uday Aditya Goswami, Founder &amp; Chairman of Sankardev Shiksha Niketan Gohpur"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = SSN_IMAGES.chairmanLocalBackup;
                            }}
                            className="w-36 h-44 sm:w-40 sm:h-48 object-cover object-top rounded-xl border-2 border-white shadow-md bg-slate-200"
                          />
                          <div className="absolute -bottom-2 -right-2 bg-blue-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wider">
                            Chairman
                          </div>
                        </div>

                        <div className="space-y-1.5 flex-1 text-center sm:text-left">
                          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                            <ShieldCheck className="w-3 h-3 text-blue-700" />
                            SAILAJA SANKKALP TRUST
                          </div>
                          <h3 className="text-xl font-display font-bold text-slate-950">
                            Mr. Uday Aditya Goswami
                          </h3>
                          <div className="text-xs font-semibold text-slate-700">
                            Founder &amp; Chairman · Educational Visionary
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            25+ Years in Social Service &amp; Governance
                          </div>
                          <div className="pt-1 text-[11px] text-slate-600 flex items-center justify-center sm:justify-start gap-1.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>Bapadev Kshetra, Solengi, Biswanath</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
                        <p className="text-xs text-slate-700 italic leading-relaxed">
                          “At Sankardev Shiksha Niketan, we believe that education is not merely about acquiring knowledge, but about nurturing young minds to become responsible global citizens who will shape the future of our society.”
                        </p>
                        <div className="text-right text-[10px] font-medium text-slate-500">
                          — Chairman’s Institutional Vision
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 text-xs">
                        <div className="p-2.5 bg-slate-100/70 rounded-lg border border-slate-200/60">
                          <div className="text-[10px] uppercase font-semibold text-slate-500">Board Record</div>
                          <div className="font-bold text-slate-900 font-mono">99.45% Pass Rate</div>
                        </div>
                        <div className="p-2.5 bg-slate-100/70 rounded-lg border border-slate-200/60">
                          <div className="text-[10px] uppercase font-semibold text-slate-500">Infrastructure</div>
                          <div className="font-bold text-slate-900 font-mono">470 m² Laboratories</div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>Direct: +91 70020 96889</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActivePage('about')}
                        className="font-semibold text-blue-900 hover:underline flex items-center gap-1 text-xs"
                      >
                        Executive Trust Board <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Auto-Fetching Real-Time School Notifications Board Display */}
                  <div className="lg:col-span-7 bg-slate-50 rounded-2xl border border-slate-200 p-6 lg:p-7 flex flex-col justify-between shadow-xs">
                    <div className="space-y-4">
                      {/* Top Header of Notice Board with Live Auto-Fetch Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-blue-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <Bell className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-display font-bold text-slate-950">
                                School Notifications Board
                              </h3>
                              <span className="relative flex h-2 w-2" title="Real-time auto-fetching active">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                              <span>Auto-fetch: Active</span>
                              <span>·</span>
                              <span>Synced: {lastSyncedTime}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleManualNotifRefresh}
                            disabled={isRefreshingNotifs}
                            title="Auto-fetch and refresh notice feed"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors cursor-pointer"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isRefreshingNotifs ? 'animate-spin' : ''}`} />
                            <span>{isRefreshingNotifs ? 'Fetching...' : 'Refresh'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActivePage('admissions')}
                            className="text-xs font-semibold text-blue-900 hover:underline px-2 py-1"
                          >
                            Admission Desk →
                          </button>
                        </div>
                      </div>

                      {/* Filter pills and Search input */}
                      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {[
                            { id: 'all', label: 'All Notices' },
                            { id: 'Admission', label: 'Admissions' },
                            { id: 'Academic', label: 'Academics' },
                            { id: 'General', label: 'Governance' },
                          ].map((tab) => (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setNotifBoardFilter(tab.id as any)}
                              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                                notifBoardFilter === tab.id
                                  ? 'bg-blue-900 text-white'
                                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                              }`}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>

                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Search notices..."
                            value={notifSearch}
                            onChange={(e) => setNotifSearch(e.target.value)}
                            className="w-full sm:w-44 pl-8 pr-2.5 py-1 text-xs rounded-md bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
                          />
                        </div>
                      </div>

                      {/* Dynamic Notifications Cards List */}
                      <div className="space-y-2.5 max-h-[310px] overflow-y-auto pr-1">
                        {filteredNotices.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                            No notifications match your current filter or search criteria.
                          </div>
                        ) : (
                          filteredNotices.slice(0, 4).map((notice) => (
                            <div
                              key={notice.id}
                              onClick={() => setSelectedNoticeModal(notice)}
                              className="group p-3 bg-white hover:bg-blue-50/40 rounded-xl border border-slate-200 hover:border-blue-300 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-start justify-between gap-3 shadow-2xs"
                            >
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {notice.isLiveBroadcast && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                      ⚡ LIVE ERP
                                    </span>
                                  )}
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                    notice.category === 'Admission'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : notice.category === 'Academic'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-purple-100 text-purple-800'
                                  }`}>
                                    {notice.category}
                                  </span>
                                  <span className="text-[11px] text-slate-400 font-mono">
                                    {notice.date}
                                  </span>
                                  <span className="text-[10px] font-medium text-slate-500">
                                    Ref: {notice.id}
                                  </span>
                                </div>
                                <h4 className="text-xs sm:text-sm font-semibold text-slate-950 group-hover:text-blue-900 line-clamp-1">
                                  {notice.title}
                                </h4>
                                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                  {notice.summary}
                                </p>
                              </div>
                              <div className="sm:self-center shrink-0 flex items-center gap-1 text-[11px] font-medium text-blue-900 group-hover:translate-x-0.5 transition-transform">
                                <span>Details</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Notice Board Footer Ticker */}
                    <div className="pt-3.5 mt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                        <span className="truncate">Session 2026–27 Admission &amp; ASSEB Assessment Broadcast Active</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActivePage('admissions')}
                        className="font-semibold text-blue-900 hover:underline text-xs whitespace-nowrap self-end sm:self-auto cursor-pointer"
                      >
                        All Public Circulars ({combinedNotices.length}) →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* School Life & Holistic Activities */}
            <section className="py-14 lg:py-16 bg-slate-50 border-b border-slate-200">
              <div className="max-w-[1360px] mx-auto px-6 lg:px-10">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Campus Life &amp; Co-Curricular Development
                    </p>
                    <h2 className="text-2xl lg:text-3xl font-display font-bold text-slate-950 mt-1">
                      Beyond the Classroom at Bapadev Kshetra
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActivePage('academics')}
                    className="text-sm font-semibold text-blue-900 hover:underline whitespace-nowrap shrink-0"
                  >
                    Explore All Courses &amp; Mentorship →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {SSN_ACTIVITIES.map((act, index) => (
                    <div
                      key={act.title}
                      className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col sm:flex-row"
                    >
                      <div className="sm:w-48 h-48 sm:h-auto shrink-0 bg-slate-200">
                        <img
                          src={act.image}
                          alt={act.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="text-xs text-slate-500">
                            0{index + 1}. {act.category} · {act.schedule}
                          </div>
                          <h3 className="text-lg font-display font-bold text-slate-950 mt-1">
                            {act.title}
                          </h3>
                          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                            {act.description}
                          </p>
                        </div>
                        <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                          Eligibility: {act.eligibility}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {activePage === 'about' && (
          <div className="py-12 lg:py-16 max-w-[1360px] mx-auto px-6 lg:px-10 space-y-14">
            {/* About Header & Vision/Mission */}
            <section className="bg-white rounded-xl border border-slate-200 p-8 lg:p-10">
              <p className="text-xs font-medium text-slate-500">
                Discover Our Journey of Excellence · Biswanath District, Assam
              </p>
              <h1 className="text-3xl lg:text-4xl font-display font-bold text-slate-950 mt-2">
                About Sankardev Shiksha Niketan, Gohpur
              </h1>
              <p className="text-base text-slate-600 mt-4 max-w-[72ch] leading-relaxed">
                Sankardev Shiksha Niketan stands as a beacon of educational excellence in the Biswanath district of Assam. Our journey is built on a foundation of academic rigor, moral values, and innovative teaching methodologies that prepare students for success in an ever-changing world.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-8 border-t border-slate-200">
                <div className="space-y-3">
                  <h2 className="text-xl font-display font-bold text-slate-950">01. Our Vision</h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    To be a leading educational institution that nurtures young minds to become responsible, compassionate, and innovative global citizens who contribute positively to society.
                  </p>
                  <ul className="text-xs text-slate-600 space-y-1.5 pt-2">
                    <li>· Academic excellence with a strong moral foundation</li>
                    <li>· Critical thinking and analytical problem-solving skills</li>
                    <li>· Adaptability to a rapidly evolving global landscape</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h2 className="text-xl font-display font-bold text-slate-950">02. Our Mission</h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    To provide holistic education that combines academic rigor with moral values, fostering intellectual, physical, emotional, and spiritual development of every student.
                  </p>
                  <ul className="text-xs text-slate-600 space-y-1.5 pt-2">
                    <li>· Nurturing environment for individual potential discovery</li>
                    <li>· Structured talent development and mentorship opportunities</li>
                    <li>· Inclusive education regardless of socio-economic background</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Educational Philosophy & Core Values */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-8 space-y-6">
                <div>
                  <p className="text-xs text-slate-500">Institutional Ethos</p>
                  <h2 className="text-2xl font-display font-bold text-slate-950 mt-1">
                    Our Four Core Values
                  </h2>
                </div>
                <div className="divide-y divide-slate-200">
                  {[
                    {
                      num: '01',
                      title: 'Excellence',
                      desc: 'We strive for academic and co-curricular excellence in all aspects of education.',
                    },
                    {
                      num: '02',
                      title: 'Integrity',
                      desc: 'We uphold the highest standards of honesty, accountability, and ethical behavior.',
                    },
                    {
                      num: '03',
                      title: 'Innovation',
                      desc: 'We embrace modern teaching methodologies, digital ERP tools, and scientific inquiry.',
                    },
                    {
                      num: '04',
                      title: 'Respect',
                      desc: 'We foster an environment of mutual respect, cultural harmony, and empathy.',
                    },
                  ].map((val) => (
                    <div key={val.num} className="py-4 first:pt-0 last:pb-0">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {val.num}. {val.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1">{val.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-8 space-y-6">
                <div>
                  <p className="text-xs text-slate-500">Sankariya Educational System</p>
                  <h2 className="text-2xl font-display font-bold text-slate-950 mt-1">
                    Our Educational Philosophy &amp; Guiding Principles
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    {
                      title: '01. Student-Centered Approach',
                      desc: 'Recognizing individual learning styles to personalize classroom instruction and mentorship.',
                    },
                    {
                      title: '02. Value Integration',
                      desc: 'Blending traditional Sankariya moral values with modern scientific and analytical practices.',
                    },
                    {
                      title: '03. Holistic Development',
                      desc: 'Focusing simultaneously on intellectual, physical, emotional, and ethical growth.',
                    },
                    {
                      title: '04. Safe & Inclusive Environment',
                      desc: 'Creating a disciplined, secure, and supportive residential and day-scholar atmosphere.',
                    },
                    {
                      title: '05. Creative Thinking',
                      desc: 'Encouraging curiosity, laboratory experimentation, and literary expression.',
                    },
                    {
                      title: '06. Social Responsibility',
                      desc: 'Fostering civic duty, community service, and environmental stewardship across Biswanath.',
                    },
                  ].map((p) => (
                    <div key={p.title} className="p-4 rounded-lg bg-slate-50 border border-slate-200/80">
                      <h3 className="text-sm font-semibold text-slate-900">{p.title}</h3>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* General Information Statutory Table */}
            <section className="bg-white rounded-xl border border-slate-200 p-8">
              <div className="mb-6">
                <p className="text-xs text-slate-500">Institutional Profile</p>
                <h2 className="text-2xl font-display font-bold text-slate-950 mt-1">
                  General Information at a Glance
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs text-slate-500">
                      <th className="py-3 px-4 text-left font-medium w-20">Sl.No</th>
                      <th className="py-3 px-4 text-left font-medium w-72">Information Parameter</th>
                      <th className="py-3 px-4 text-left font-medium">Official Institutional Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {SSN_GENERAL_INFO_TABLE.map((row) => (
                      <tr key={row.slNo} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-mono tabular-nums text-slate-500">
                          0{row.slNo}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{row.field}</td>
                        <td className="py-3.5 px-4 text-slate-700 font-mono tabular-nums">
                          {row.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Leadership & Management Committee (NM&DC and PTA) */}
            <section className="bg-white rounded-xl border border-slate-200 p-8 space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-500">
                    Governance Hierarchy · SAILAJA SANKKALP TRUST (NM&amp;DC &amp; PTA)
                  </p>
                  <h2 className="text-2xl font-display font-bold text-slate-950 mt-1">
                    Leadership &amp; Management Committee
                  </h2>
                </div>
                <p className="text-xs text-slate-500">
                  Strategic Policy Planning · Financial Oversight · Parent-Teacher Collaboration
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {SSN_LEADERSHIP.map((leader) => (
                  <div
                    key={leader.name}
                    className="p-6 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row gap-5 items-start justify-between"
                  >
                    {leader.image && (
                      <img
                        src={leader.image}
                        alt={leader.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = SSN_IMAGES.chairmanLocalBackup;
                        }}
                        className="w-24 h-28 sm:w-28 sm:h-32 object-cover object-top rounded-xl border border-slate-300 shadow-2xs shrink-0 bg-slate-200"
                      />
                    )}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{leader.organization}</span>
                        <span className="font-mono">{leader.experience}</span>
                      </div>
                      <h3 className="text-lg font-display font-bold text-slate-950">
                        {leader.name}
                      </h3>
                      <p className="text-xs font-semibold text-blue-900">
                        {leader.role} · {leader.designationTag}
                      </p>
                      <p className="text-sm text-slate-600 pt-1 leading-relaxed">
                        “{leader.quote}”
                      </p>
                      <div className="pt-2 border-t border-slate-200/80 text-xs text-slate-500 font-mono tabular-nums">
                        Contact Office: {leader.contact}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activePage === 'academics' && (
          <div className="py-12 lg:py-16 max-w-[1360px] mx-auto px-6 lg:px-10 space-y-14">
            <section className="bg-white rounded-xl border border-slate-200 p-8 lg:p-10">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-slate-200">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    শৈক্ষণিক কাৰ্যসূচী · Secondary, Senior Secondary &amp; 4-Year Degree Programs
                  </p>
                  <h1 className="text-3xl lg:text-4xl font-display font-bold text-slate-950 mt-2">
                    Academic Programs &amp; Curriculum
                  </h1>
                  <p className="text-sm text-slate-600 mt-2 max-w-[68ch]">
                    Discover our structured curriculum across Class VI–X, Senior Secondary Science, Arts, and Commerce streams, and 4-Year Undergraduate Degree Honours courses.
                  </p>
                </div>

                {/* Interactive Filter Controls */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
                  {(
                    [
                      ['all', 'All Programs'],
                      ['school', 'Class VI – XII'],
                      ['degree', '4-Year B.A. Honours'],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setAcademicFilter(key)}
                      className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                        academicFilter === key
                          ? 'bg-white text-slate-950 shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Secondary & Senior Secondary Streams */}
              {(academicFilter === 'all' || academicFilter === 'school') && (
                <div className="mt-8 space-y-6">
                  <h2 className="text-xl font-display font-bold text-slate-950">
                    Secondary &amp; Senior Secondary Streams (Class VI – XII)
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {SSN_ACADEMIC_STREAMS.map((stream) => (
                      <div
                        key={stream.code}
                        className="p-6 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-2">
                          <div className="text-xs text-slate-500 font-mono tabular-nums">
                            Code: {stream.code} · Duration: {stream.duration}
                          </div>
                          <h3 className="text-lg font-display font-bold text-slate-950">
                            {stream.title}
                          </h3>
                          <p className="text-sm text-slate-600 leading-relaxed">{stream.summary}</p>
                        </div>

                        <div className="space-y-3 pt-3 border-t border-slate-200">
                          <div>
                            <div className="text-xs font-semibold text-slate-800">Core Subjects:</div>
                            <p className="text-xs text-slate-600 mt-1">
                              {stream.subjects.join(' · ')}
                            </p>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-800">
                              Program Highlights:
                            </div>
                            <p className="text-xs text-slate-600 mt-1">
                              {stream.highlights.join(' · ')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4-Year Degree Programs (B.A.) */}
              {(academicFilter === 'all' || academicFilter === 'degree') && (
                <div className="mt-10 pt-8 border-t border-slate-200 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                    <div>
                      <h2 className="text-xl font-display font-bold text-slate-950">
                        4-Year Undergraduate Degree Programs (B.A. Honours · FYUGP)
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Integrated with civil services foundation coaching (APSC / UPSC) and research seminars
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {SSN_DEGREE_PROGRAMS.map((deg) => (
                      <div
                        key={deg.code}
                        className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="text-xs font-mono text-slate-500">{deg.code}</div>
                          <h3 className="text-base font-display font-bold text-slate-950 mt-1">
                            {deg.title}
                          </h3>
                          <p className="text-xs text-slate-600 mt-1">{deg.duration}</p>
                        </div>
                        <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-mono tabular-nums">
                            Intake: {deg.seats} Seats
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setAdmForm((prev) => ({
                                ...prev,
                                applyingForClass: deg.title,
                                stream: 'B.A. 4-Year Honours',
                              }));
                              setActivePage('admissions');
                            }}
                            className="font-semibold text-blue-900 hover:underline"
                          >
                            Apply →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Academic Mentorship & Support Pillars */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SSN_ACADEMIC_PILLARS.map((pillar, i) => (
                <div
                  key={pillar.title}
                  className="bg-white rounded-xl border border-slate-200 p-6 space-y-3"
                >
                  <div className="text-xs text-slate-500 font-mono">0{i + 1}. Academic Resource</div>
                  <h3 className="text-lg font-display font-bold text-slate-950">{pillar.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{pillar.description}</p>
                  <div className="pt-2 text-xs text-slate-500">
                    {pillar.features.join(' · ')}
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}

        {activePage === 'facilities' && (
          <div className="py-12 lg:py-16 max-w-[1360px] mx-auto px-6 lg:px-10 space-y-14">
            {/* Infrastructure Metrics Overview */}
            <section className="bg-white rounded-xl border border-slate-200 p-8 lg:p-10">
              <p className="text-xs font-medium text-slate-500">
                অবকাঠামো আৰু সুবিধাসমূহ · Bapadev Kshetra Campus Infrastructure
              </p>
              <h1 className="text-3xl lg:text-4xl font-display font-bold text-slate-950 mt-2">
                Infrastructure, Hostels &amp; Mandatory Disclosures
              </h1>
              <p className="text-sm text-slate-600 mt-2 max-w-[68ch]">
                Our 14,715 sq mtr campus in Solengi, Gohpur is engineered to provide modern laboratories, digital connectivity, hygienic facilities, and safe residential hostels.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {SSN_INFRASTRUCTURE_METRICS.map((item) => (
                  <div
                    key={item.label}
                    className="p-5 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <div className="text-2xl font-bold text-slate-950 font-mono tabular-nums">
                      {item.metric}
                    </div>
                    <div className="text-sm font-semibold text-slate-800 mt-1">{item.label}</div>
                    <div className="text-xs text-slate-500 mt-1">{item.detail}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Boys & Girls Hostel Facilities */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {SSN_HOSTELS.map((hostel) => (
                <div
                  key={hostel.name}
                  className="bg-white rounded-xl border border-slate-200 p-8 space-y-4"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 font-mono tabular-nums">
                    <span>Capacity: {hostel.capacity}</span>
                    <span>{hostel.supervision}</span>
                  </div>
                  <h2 className="text-xl font-display font-bold text-slate-950">{hostel.name}</h2>
                  <p className="text-sm text-slate-600 leading-relaxed">{hostel.description}</p>
                  <div className="pt-3 border-t border-slate-200 text-xs text-slate-600">
                    <span className="font-semibold text-slate-900">Key Amenities: </span>
                    {hostel.features.join(' · ')}
                  </div>
                </div>
              ))}
            </section>

            {/* Official Documents & Mandatory Compliance Disclosures */}
            <section className="bg-white rounded-xl border border-slate-200 p-8 space-y-8">
              <div>
                <p className="text-xs text-slate-500">
                  Public Statutory Disclosure · School Code: {SSN_SCHOOL_INFO.schoolCode}
                </p>
                <h2 className="text-2xl font-display font-bold text-slate-950 mt-1">
                  Official Institutional Compliance &amp; Academic Records
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Institutional Compliance */}
                <div className="space-y-4">
                  <h3 className="text-base font-display font-bold text-slate-900">
                    Part A: Institutional Compliance Certificates
                  </h3>
                  <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl">
                    {SSN_OFFICIAL_DOCUMENTS.compliance.map((docItem) => (
                      <div
                        key={docItem.sl}
                        className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50"
                      >
                        <div>
                          <div className="text-xs font-mono text-slate-500">
                            0{docItem.sl} · Ref: {docItem.refNo}
                          </div>
                          <div className="text-sm font-medium text-slate-900 mt-0.5">
                            {docItem.title}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedDoc(docItem)}
                          className="px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg whitespace-nowrap shrink-0"
                        >
                          View Record
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Academic Records */}
                <div className="space-y-4">
                  <h3 className="text-base font-display font-bold text-slate-900">
                    Part B: Academic &amp; Governance Records
                  </h3>
                  <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl">
                    {SSN_OFFICIAL_DOCUMENTS.academicRecords.map((docItem) => (
                      <div
                        key={docItem.sl}
                        className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50"
                      >
                        <div>
                          <div className="text-xs font-mono text-slate-500">
                            0{docItem.sl} · Ref: {docItem.refNo}
                          </div>
                          <div className="text-sm font-medium text-slate-900 mt-0.5">
                            {docItem.title}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedDoc(docItem)}
                          className="px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg whitespace-nowrap shrink-0"
                        >
                          View Record
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Campus Visual Gallery */}
            <section className="bg-white rounded-xl border border-slate-200 p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-500">Campus Visual Archive</p>
                  <h2 className="text-2xl font-display font-bold text-slate-950 mt-1">
                    Life &amp; Facilities at SSN Gohpur
                  </h2>
                </div>
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
                  {(
                    [
                      ['all', 'All Photos'],
                      ['campus', 'Campus'],
                      ['labs', 'Laboratories'],
                      ['library', 'Library'],
                      ['sports', 'Sports & Culture'],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setGalleryFilter(key)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                        galleryFilter === key
                          ? 'bg-white text-slate-950 shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {galleryItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50"
                  >
                    <div className="h-60 bg-slate-200">
                      <img
                        src={item.image}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-base font-display font-bold text-slate-950">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">{item.meta}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activePage === 'wall_of_fame' && (
          <div className="py-12 lg:py-16 max-w-[1360px] mx-auto px-6 lg:px-10 space-y-12">
            <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-950 rounded-3xl p-8 lg:p-12 text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-semibold uppercase tracking-wider">
                  <Trophy className="w-4 h-4 text-amber-300" />
                  <span>Honor Roll &amp; Hall of Achievers</span>
                </div>
                <h1 className="text-3xl lg:text-5xl font-display font-bold tracking-tight">
                  Wall of Fame &amp; Academic Laureates
                </h1>
                <p className="text-amber-100 text-base leading-relaxed">
                  Honoring outstanding state rankers, board exam toppers, APSC civil service qualifiers, national sports champions, and cultural ambassadors of Shankardev Shiksha Niketan, Gohpur.
                </p>
              </div>
            </div>

            {/* Filter Categories */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setWofCategoryFilter('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  wofCategoryFilter === 'all'
                    ? 'bg-amber-700 text-white shadow-md'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                All Honorees ({liveWallOfFame.length})
              </button>
              {[
                'ASSEB Board Exam State Ranker',
                'Star Distinction & 95%+ Club',
                'APSC / Civil Services Scholar',
                'National / State Sports Champion',
                'Sankariya Cultural & Vedic Arts',
                'STEM & Olympiad Laureate',
              ].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setWofCategoryFilter(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                    wofCategoryFilter === cat
                      ? 'bg-amber-700 text-white shadow-md'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Achievers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPublicWof.map((achiever) => (
                <div
                  key={achiever.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group"
                >
                  <div className="relative h-64 bg-slate-100 overflow-hidden">
                    <img
                      src={achiever.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'}
                      alt={achiever.scholarName}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex flex-col justify-between p-5">
                      <div className="flex justify-between items-start">
                        <span className="px-3 py-1 bg-amber-500 text-amber-950 font-bold text-xs rounded-full shadow-md">
                          {achiever.batchSession}
                        </span>
                        {achiever.studentIdOrRoll && (
                          <span className="px-2.5 py-1 bg-black/50 backdrop-blur-xs text-white font-mono text-[11px] rounded-lg">
                            {achiever.studentIdOrRoll}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-display font-bold text-xl">{achiever.scholarName}</h3>
                        <p className="text-amber-300 text-xs font-semibold mt-0.5">{achiever.achievementTitle}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
                        <Award className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>{achiever.category}</span>
                      </div>
                      <div className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-bold">
                        {achiever.rankOrScore}
                      </div>
                      <p className="text-slate-600 text-xs leading-relaxed italic">
                        "{achiever.citationStory}"
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl">
                      <span className="font-bold text-slate-900 block mb-0.5">Current Pursuit / Placement:</span>
                      {achiever.currentPursuit}
                    </div>
                  </div>
                </div>
              ))}
              {filteredPublicWof.length === 0 && (
                <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200">
                  <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-800">No Laureates Found in this Category</h3>
                  <p className="text-xs text-slate-500 mt-1">Please select another category or view all honorees.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activePage === 'admissions' && (
          <div className="py-12 lg:py-16 max-w-[1360px] mx-auto px-6 lg:px-10 space-y-14">
            {/* Online & Offline Admission Header & Action Banner */}
            <section className="bg-white rounded-2xl border border-slate-200 p-8 lg:p-10 shadow-xs space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                    <span>Academic Session 2026–27 · Official Admissions</span>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-display font-bold text-slate-950">
                    Online Admission
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-[75ch]">
                    Start your journey towards educational excellence today for Session 2026-27.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <a
                    href="#official-admission-form"
                    className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span>Apply Online Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href="#check-form-status"
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold border border-slate-200 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Search className="w-4 h-4 text-slate-600" />
                    <span>Check Form Status</span>
                  </a>
                </div>
              </div>

              {/* How to Apply Online */}
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-display font-bold text-slate-950">
                    How to Apply Online
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Follow these simple steps to secure your admission at Sankardev Shiksha Niketan for the 2026-27 session.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    {
                      step: 'Step 1',
                      title: 'Fill Online Form',
                      desc: 'Complete the digital application with accurate student, parent, and address details.',
                    },
                    {
                      step: 'Step 2',
                      title: 'Set Portal Password',
                      desc: 'Create a secure password to access your Smart Student Portal for future tracking.',
                    },
                    {
                      step: 'Step 3',
                      title: 'Submit & Get ID',
                      desc: 'Receive your unique Student ID immediately upon successful submission.',
                    },
                    {
                      step: 'Step 4',
                      title: 'Print Slip',
                      desc: 'Download and print the auto-generated Acknowledgement Slip for office use.',
                    },
                    {
                      step: 'Step 5',
                      title: 'Office Verification',
                      desc: 'Visit the school office with original documents and the printed slip to finalize admission.',
                    },
                  ].map((st) => (
                    <div
                      key={st.step}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 relative group hover:border-blue-300 transition-colors"
                    >
                      <div className="text-[11px] font-mono font-bold text-blue-900 uppercase tracking-wider">
                        {st.step}
                      </div>
                      <h3 className="text-sm font-display font-bold text-slate-950">
                        {st.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {st.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Online Admission Form + Barcode Slip / Status Checker */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div id="official-admission-form" className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-8 scroll-mt-24">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-slate-950">
                      Official Admission Form
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Academic Session 2026-27 | Please provide accurate information.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-900 border border-blue-200 w-fit">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
                      <span>Session 2026–27 Open</span>
                    </span>
                  </div>
                </div>

                {admError && (
                  <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-800 flex items-center gap-2">
                    <X className="w-4 h-4 text-red-600 shrink-0 cursor-pointer" onClick={() => setAdmError(null)} />
                    <span>{admError}</span>
                  </div>
                )}

                <form onSubmit={handleAdmissionSubmit} className="space-y-8">
                  {/* Section 1: Basic Details */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <div className="w-2 h-2 rounded-full bg-blue-900"></div>
                      <h3 className="text-sm font-display font-bold text-slate-900 uppercase tracking-wider">
                        Basic Details
                      </h3>
                    </div>

                    {/* Student Photo Section */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <label className="block text-xs font-bold text-slate-800 mb-2">
                        Student Photo *
                      </label>
                      <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                        <div className="flex-1 space-y-2.5 w-full">
                          {/* URL / File Toggle Tabs */}
                          <div className="inline-flex p-1 rounded-lg bg-slate-200/80 border border-slate-300 gap-1">
                            <button
                              type="button"
                              onClick={() => setAdmForm({ ...admForm, photoType: 'url' })}
                              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                                admForm.photoType === 'url'
                                  ? 'bg-white text-blue-950 shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              URL
                            </button>
                            <button
                              type="button"
                              onClick={() => setAdmForm({ ...admForm, photoType: 'file' })}
                              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                                admForm.photoType === 'file'
                                  ? 'bg-white text-blue-950 shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              File
                            </button>
                          </div>

                          {admForm.photoType === 'url' ? (
                            <div>
                              <input
                                type="url"
                                value={admForm.studentPhoto}
                                onChange={(e) =>
                                  setAdmForm({ ...admForm, studentPhoto: e.target.value })
                                }
                                placeholder="Paste image link here..."
                                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-800"
                              />
                              <p className="text-[11px] text-slate-500 mt-1">
                                JPG/PNG/WEBP · Max size: 2MB
                              </p>
                            </div>
                          ) : (
                            <div>
                              <label className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-dashed border-slate-400 bg-white hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700">
                                <Upload className="w-4 h-4 text-slate-500" />
                                <span>Choose image file (Max size: 2MB)</span>
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp"
                                  onChange={handlePhotoFileUpload}
                                  className="hidden"
                                />
                              </label>
                              <p className="text-[11px] text-slate-500 mt-1">
                                JPG/PNG/WEBP · Max size: 2MB
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Photo Preview Container */}
                        <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-lg border border-slate-300 bg-white overflow-hidden flex flex-col items-center justify-center relative shrink-0 shadow-2xs">
                          {admForm.studentPhoto ? (
                            <>
                              <img
                                src={admForm.studentPhoto}
                                alt="Student Photo Preview"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setAdmForm((prev) => ({ ...prev, studentPhoto: '' }))
                                }
                                className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white p-1 rounded-full text-[10px]"
                                title="Remove photo"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </>
                          ) : (
                            <div className="text-center p-2 text-slate-400 flex flex-col items-center justify-center">
                              <Camera className="w-6 h-6 mb-1 text-slate-300" />
                              <span className="text-xs font-semibold text-slate-400">
                                No Preview
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Class & Names Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Class *
                        </label>
                        <select
                          required
                          value={admForm.applyingForClass}
                          onChange={(e) =>
                            setAdmForm({ ...admForm, applyingForClass: e.target.value })
                          }
                          className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-800"
                        >
                          <option value="">Select</option>
                          <option value="VI">VI</option>
                          <option value="VII">VII</option>
                          <option value="VIII">VIII</option>
                          <option value="IX">IX</option>
                          <option value="X">X</option>
                          <option value="XI Science">XI Science</option>
                          <option value="XI Arts">XI Arts</option>
                          <option value="XI Commerce">XI Commerce</option>
                          <option value="XII Science">XII Science</option>
                          <option value="XII Arts">XII Arts</option>
                          <option value="XII Commerce">XII Commerce</option>
                          <option value="B.A. Honours (English)">B.A. Honours (English)</option>
                          <option value="B.A. Honours (Assamese)">B.A. Honours (Assamese)</option>
                          <option value="B.A. Honours (Economics)">B.A. Honours (Economics)</option>
                          <option value="B.A. Honours (Political Science)">B.A. Honours (Political Science)</option>
                          <option value="B.A. Honours (History)">B.A. Honours (History)</option>
                          <option value="B.A. Honours (Geography)">B.A. Honours (Geography)</option>
                          <option value="B.A. Honours (Sociology)">B.A. Honours (Sociology)</option>
                          <option value="B.A. Honours (Hindi)">B.A. Honours (Hindi)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          First Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={admForm.firstName}
                          onChange={(e) =>
                            setAdmForm({ ...admForm, firstName: e.target.value })
                          }
                          placeholder="First Name"
                          className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={admForm.lastName}
                          onChange={(e) =>
                            setAdmForm({ ...admForm, lastName: e.target.value })
                          }
                          placeholder="Last Name"
                          className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-800"
                        />
                      </div>
                    </div>

                    {/* Gender, DOB, Mobile, Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Gender *
                        </label>
                        <select
                          required
                          value={admForm.gender}
                          onChange={(e) =>
                            setAdmForm({ ...admForm, gender: e.target.value })
                          }
                          className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-800"
                        >
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Date Of Birth *
                        </label>
                        <input
                          type="date"
                          required
                          placeholder="dd/mm/yyyy"
                          value={admForm.dob}
                          onChange={(e) =>
                            setAdmForm({ ...admForm, dob: e.target.value })
                          }
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          value={admForm.mobileNumber}
                          onChange={(e) =>
                            setAdmForm({ ...admForm, mobileNumber: e.target.value })
                          }
                          placeholder="Mobile Number"
                          className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 font-mono focus:outline-none focus:border-blue-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={admForm.contactEmail}
                          onChange={(e) =>
                            setAdmForm({ ...admForm, contactEmail: e.target.value })
                          }
                          placeholder="niketansankardevshiksha@gmail.com"
                          className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-800"
                        />
                      </div>
                    </div>

                    {/* Caste, Religion, Blood Group, Hostel */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Caste
                        </label>
                        <select
                          value={admForm.caste}
                          onChange={(e) =>
                            setAdmForm({ ...admForm, caste: e.target.value })
                          }
                          className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-800"
                        >
                          <option value="General">General</option>
                          <option value="OBC">OBC</option>
                          <option value="MOBC">MOBC</option>
                          <option value="SC">SC</option>
                          <option value="ST(P)">ST(P)</option>
                          <option value="ST(H)">ST(H)</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Religion
                        </label>
                        <select
                          value={admForm.religion}
                          onChange={(e) =>
                            setAdmForm({ ...admForm, religion: e.target.value })
                          }
                          className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-800"
                        >
                          <option value="Hinduism">Hinduism</option>
                          <option value="Islam">Islam</option>
                          <option value="Christianity">Christianity</option>
                          <option value="Sikhism">Sikhism</option>
                          <option value="Buddhism">Buddhism</option>
                          <option value="Jainism">Jainism</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Blood Group
                        </label>
                        <select
                          value={admForm.bloodGroup}
                          onChange={(e) =>
                            setAdmForm({ ...admForm, bloodGroup: e.target.value })
                          }
                          className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-800"
                        >
                          <option value="">Select</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Hostel Required? *
                        </label>
                        <select
                          required
                          value={admForm.hostelRequired}
                          onChange={(e) =>
                            setAdmForm({ ...admForm, hostelRequired: e.target.value })
                          }
                          className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-800 font-semibold text-slate-900"
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Portal Login Credentials */}
                  <div className="p-5 rounded-xl bg-slate-900 text-white space-y-4 shadow-sm border border-slate-800">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                      <Key className="w-4 h-4 text-blue-400" />
                      <h3 className="text-sm font-display font-bold uppercase tracking-wider text-white">
                        Portal Login Credentials
                      </h3>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      This password will be used to access your student portal. An official identity record will be automatically created.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Login Username (Email)
                        </label>
                        <div className="px-3.5 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 font-mono text-white min-h-[40px] flex items-center">
                          {admForm.contactEmail ? (
                            <span className="text-emerald-400 font-semibold">{admForm.contactEmail}</span>
                          ) : (
                            <span className="text-slate-400 italic">Waiting for email input...</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Your email address will be your username.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Set Portal Password *
                        </label>
                        <div className="relative">
                          <input
                            type={admForm.showPassword ? 'text' : 'password'}
                            required
                            minLength={6}
                            value={admForm.portalPassword}
                            onChange={(e) =>
                              setAdmForm({ ...admForm, portalPassword: e.target.value })
                            }
                            placeholder="Set Portal Password"
                            className="w-full px-3.5 py-2 pr-10 text-sm rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setAdmForm((prev) => ({
                                ...prev,
                                showPassword: !prev.showPassword,
                              }))
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                          >
                            {admForm.showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Minimum 6 characters recommended.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center gap-2.5 text-xs text-emerald-400">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-medium">
                        Smart Enrollment: Automatic Firebase Auth &amp; Identity creation enabled.
                      </span>
                    </div>
                  </div>

                  {/* Section 3: Parent/Guardian Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <div className="w-2 h-2 rounded-full bg-blue-900"></div>
                      <h3 className="text-sm font-display font-bold text-slate-900 uppercase tracking-wider">
                        Parent/Guardian Details
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Father Name
                        </label>
                        <input
                          type="text"
                          value={admForm.fatherName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdmForm((prev) => ({
                              ...prev,
                              fatherName: val,
                              guardianName:
                                prev.guardianIs === 'Father' && !prev.guardianName
                                  ? val
                                  : prev.guardianName,
                            }));
                          }}
                          placeholder="Father Name"
                          className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Guardian Is *
                        </label>
                        <select
                          required
                          value={admForm.guardianIs}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdmForm((prev) => ({
                              ...prev,
                              guardianIs: val,
                              guardianRelation:
                                val === 'Father'
                                  ? 'Father'
                                  : val === 'Mother'
                                  ? 'Mother'
                                  : 'Uncle',
                              guardianName:
                                val === 'Father' && prev.fatherName
                                  ? prev.fatherName
                                  : prev.guardianName,
                            }));
                          }}
                          className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-800 font-medium"
                        >
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Guardian Relation *
                        </label>
                        <input
                          type="text"
                          required
                          value={admForm.guardianRelation}
                          onChange={(e) =>
                            setAdmForm({ ...admForm, guardianRelation: e.target.value })
                          }
                          placeholder="e.g. Uncle"
                          className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Guardian Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={admForm.guardianName}
                          onChange={(e) =>
                            setAdmForm({ ...admForm, guardianName: e.target.value })
                          }
                          placeholder="Guardian Name"
                          className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Guardian Phone *
                        </label>
                        <input
                          type="tel"
                          required
                          value={admForm.guardianPhone}
                          onChange={(e) =>
                            setAdmForm({ ...admForm, guardianPhone: e.target.value })
                          }
                          placeholder="Guardian Phone"
                          className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 font-mono focus:outline-none focus:border-blue-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Guardian Email
                        </label>
                        <input
                          type="email"
                          value={admForm.guardianEmail}
                          onChange={(e) =>
                            setAdmForm({ ...admForm, guardianEmail: e.target.value })
                          }
                          placeholder="Guardian Email"
                          className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Guardian Occupation
                        </label>
                        <input
                          type="text"
                          value={admForm.guardianOccupation}
                          onChange={(e) =>
                            setAdmForm({ ...admForm, guardianOccupation: e.target.value })
                          }
                          placeholder="Guardian Occupation"
                          className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Guardian Address
                        </label>
                        <input
                          type="text"
                          value={admForm.guardianAddress}
                          onChange={(e) =>
                            setAdmForm({ ...admForm, guardianAddress: e.target.value })
                          }
                          placeholder="Guardian Address"
                          className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Address Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <div className="w-2 h-2 rounded-full bg-blue-900"></div>
                      <h3 className="text-sm font-display font-bold text-slate-900 uppercase tracking-wider">
                        Address Details
                      </h3>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Permanent Address
                      </label>
                      <textarea
                        rows={2}
                        value={admForm.permanentAddress}
                        onChange={(e) =>
                          setAdmForm({ ...admForm, permanentAddress: e.target.value })
                        }
                        placeholder="Permanent Address"
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-800"
                      />
                    </div>
                  </div>

                  {/* Section 5: Miscellaneous & Bank Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <CreditCard className="w-4 h-4 text-blue-900" />
                      <h3 className="text-sm font-display font-bold text-slate-900 uppercase tracking-wider">
                        Miscellaneous &amp; Bank Details
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Bank Account Number
                        </label>
                        <input
                          type="text"
                          value={admForm.bankAccountNo}
                          onChange={(e) =>
                            setAdmForm({ ...admForm, bankAccountNo: e.target.value })
                          }
                          placeholder="Bank Account Number"
                          className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 font-mono focus:outline-none focus:border-blue-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Name of Account Holder
                        </label>
                        <input
                          type="text"
                          value={admForm.bankAccountHolder}
                          onChange={(e) =>
                            setAdmForm({ ...admForm, bankAccountHolder: e.target.value })
                          }
                          placeholder="Name of Account Holder"
                          className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Bank Name
                        </label>
                        <input
                          type="text"
                          value={admForm.bankName}
                          onChange={(e) =>
                            setAdmForm({ ...admForm, bankName: e.target.value })
                          }
                          placeholder="Bank Name"
                          className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          IFSC Code
                        </label>
                        <input
                          type="text"
                          value={admForm.ifscCode}
                          onChange={(e) =>
                            setAdmForm({ ...admForm, ifscCode: e.target.value.toUpperCase() })
                          }
                          placeholder="IFSC Code"
                          className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 font-mono uppercase focus:outline-none focus:border-blue-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 6: Previous School Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <div className="w-2 h-2 rounded-full bg-blue-900"></div>
                      <h3 className="text-sm font-display font-bold text-slate-900 uppercase tracking-wider">
                        Previous School Details
                      </h3>
                    </div>

                    <div>
                      <textarea
                        rows={3}
                        value={admForm.previousSchool}
                        onChange={(e) =>
                          setAdmForm({ ...admForm, previousSchool: e.target.value })
                        }
                        placeholder="Name of school, address, marks obtained..."
                        className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-800"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-xs text-slate-500">
                      Note: Admission is provisional until original physical documents are verified within 3 working days at Bapadev Kshetra office.
                    </p>
                    <button
                      type="submit"
                      disabled={admSubmitting}
                      className="px-6 py-3 text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors shadow-xs whitespace-nowrap shrink-0 disabled:opacity-50 cursor-pointer"
                    >
                      {admSubmitting ? 'Submitting Application...' : 'Submit Application'}
                    </button>
                  </div>
                </form>

                {/* Generated Official Acknowledgement Slip */}
                {generatedSlip && (
                  <div className="mt-8 p-6 sm:p-7 rounded-2xl bg-white border-2 border-slate-900 shadow-md space-y-6">
                    <div className="flex flex-col sm:flex-row items-start justify-between border-b border-slate-200 pb-5 gap-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={SSN_IMAGES.schoolLogo}
                          alt="SSN Logo"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = SSN_IMAGES.schoolLogoLocal;
                          }}
                          className="w-12 h-12 object-contain rounded-full bg-white p-0.5 border border-slate-300 shadow-2xs shrink-0"
                        />
                        <div>
                          <div className="text-[11px] font-mono uppercase tracking-wider text-blue-900 font-semibold">
                            OFFICIAL ADMISSION ACKNOWLEDGEMENT SLIP · SESSION 2026–27
                          </div>
                          <h3 className="text-xl font-display font-bold text-slate-950">
                            Sankardev Shiksha Niketan, Gohpur (Code: 035371)
                          </h3>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Bapadev Kshetra, Solengi, P.O: Govinda Elengisatra, Biswanath, Pin: 784168
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          printDocument({
                            title: `SSN_Admission_Slip_${generatedSlip.applicationNo}`,
                            filename: `SSN_Admission_Acknowledgement_${generatedSlip.applicationNo}_${generatedSlip.applicantName.replace(/\s+/g, '_')}`,
                          })
                        }
                        className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 inline-flex items-center gap-1.5 no-print shadow-xs shrink-0 cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Print Slip</span>
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                      {generatedSlip.studentPhoto && (
                        <div className="w-28 h-36 rounded-xl border border-slate-300 overflow-hidden shadow-2xs shrink-0 bg-slate-100">
                          <img
                            src={generatedSlip.studentPhoto}
                            alt="Student"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-xs flex-1">
                        <div>
                          <span className="text-slate-500 block">Application ID</span>
                          <span className="font-mono font-bold text-slate-950 text-sm">
                            {generatedSlip.applicationNo}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Applicant Full Name</span>
                          <span className="font-semibold text-slate-900">
                            {generatedSlip.applicantName}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Applying For Class</span>
                          <span className="font-semibold text-slate-900">
                            {generatedSlip.applyingForClass} ({generatedSlip.stream})
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Gender &amp; DOB</span>
                          <span className="font-semibold text-slate-900">
                            {generatedSlip.gender || 'Male'} · {generatedSlip.dob || 'NA'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Blood Group / Hostel</span>
                          <span className="font-semibold text-slate-900">
                            {generatedSlip.bloodGroup || 'A+'} · Hostel: {generatedSlip.hostelRequired || 'Yes'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Guardian Details</span>
                          <span className="font-semibold text-slate-900">
                            {generatedSlip.guardianName} ({generatedSlip.guardianRelation || 'Guardian'}) · {generatedSlip.contactPhone}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Student Portal Login</span>
                          <span className="font-mono font-semibold text-blue-900">
                            {generatedSlip.contactEmail}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Provisional Fee Assessment</span>
                          <span className="font-mono font-semibold text-slate-900">
                            ₹{generatedSlip.feeAmount.toLocaleString('en-IN')} ({generatedSlip.feeStatus})
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Application Status</span>
                          <span className="font-bold text-emerald-700 uppercase">
                            {generatedSlip.applicationStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Visual Barcode & Official Instructions */}
                    <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="text-xs text-slate-600 leading-relaxed max-w-[55ch]">
                        Please present this barcoded slip along with original Birth Certificate, Marksheets, Transfer Certificate and 2 passport photos at the Bapadev Kshetra office within 3 working days.
                      </div>
                      <div className="bg-slate-50 px-5 py-2.5 border border-slate-300 rounded-lg text-center shrink-0">
                        <div className="font-mono tracking-[0.25em] text-xs font-bold text-slate-950">
                          ||| |||| | ||| |||| || |||
                        </div>
                        <div className="font-mono text-[11px] text-slate-600 mt-0.5">
                          {generatedSlip.applicationNo}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Check Application Status + Post-Submission Guide + Announcements */}
              <div className="lg:col-span-4 space-y-6">
                {/* Application Status Checker */}
                <div id="check-form-status" className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 scroll-mt-24 shadow-xs">
                  <h2 className="text-lg font-display font-bold text-slate-950">
                    Check Admission Form Status
                  </h2>
                  <p className="text-xs text-slate-500">
                    Enter your Application ID (e.g. <span className="font-mono">SSN-2026-1041</span>) or applicant name.
                  </p>
                  <form onSubmit={handleCheckApplicationStatus} className="flex gap-2">
                    <input
                      type="text"
                      value={statusSearchQuery}
                      onChange={(e) => setStatusSearchQuery(e.target.value)}
                      placeholder="SSN-2026-1041"
                      className="flex-1 px-3.5 py-2 text-sm rounded-lg border border-slate-300 font-mono focus:outline-none focus:border-blue-800"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Check Status
                    </button>
                  </form>

                  {statusSearchResult === 'not_found' && (
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                      No application matched that ID. Try <span className="font-mono font-semibold">SSN-2026-1041</span> or submit a new application on the left.
                    </div>
                  )}

                  {statusSearchResult && statusSearchResult !== 'not_found' && (
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-950">
                          {statusSearchResult.applicationNo}
                        </span>
                        <span className="font-semibold text-emerald-700 uppercase">
                          Status: {statusSearchResult.applicationStatus}
                        </span>
                      </div>
                      <div className="text-slate-800 font-medium">
                        {statusSearchResult.applicantName} · {statusSearchResult.applyingForClass}
                      </div>
                      <div className="text-slate-500 font-mono tabular-nums">
                        Guardian: {statusSearchResult.guardianName} · Fee Status: {statusSearchResult.feeStatus.toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>

                {/* Post-Submission Guide */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-xs">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <FileText className="w-5 h-5 text-blue-900" />
                    <h2 className="text-lg font-display font-bold text-slate-950">
                      Post-Submission Guide
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center shrink-0">
                        1
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-900">
                          Print the Acknowledgement Slip
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          After clicking submit, a popup window will appear with your Official Acknowledgement Slip. Click the <strong className="text-slate-900">Print</strong> button immediately. This document contains your unique Application ID and barcode required by the office.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center shrink-0">
                        2
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-900">
                          Check Your Email
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          A detailed confirmation email will be sent to your registered email address. This email serves as your digital receipt and contains your login credentials for the <strong className="text-slate-900">Smart Student Portal</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center shrink-0">
                        3
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-900">
                          Visit School Office
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Within 3 working days of submission, visit the school office at <strong className="text-slate-900">Gohpur, Bapadev Kshetra</strong> with the printed slip and original certificates (Birth Certificate, Marksheets, Transfer Certificate) for final verification and fee payment.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                    <strong>Note:</strong> Admission is considered provisional until physical documents are verified and initial fees are paid.
                  </div>
                </div>

                {/* Offline (Office) Physical Verification & Counter Information */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-900" />
                    <h3 className="text-sm font-display font-bold text-slate-950 uppercase tracking-wider">
                      School Office Verification Desk
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Within 3 working days of online submission, visit our administrative office at Bapadev Kshetra, Solengi with your printed Acknowledgement Slip and original certificates for document verification and fee payment.
                  </p>
                  <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span><strong>Counter Timings:</strong> 9:00 AM – 3:30 PM (Mon–Sat)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span><strong>Office:</strong> Solengi, Gohpur, Biswanath – 784168</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span><strong>Desk Phone:</strong> +91 9954656161</span>
                    </div>
                  </div>
                </div>

                {/* Live Institutional Announcements & Updates */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-display font-bold text-slate-950">
                      Announcements &amp; General Notices
                    </h2>
                    <span className="text-xs text-slate-500">Session 2026–27</span>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {liveNotifications.slice(0, 2).map((ln) => (
                      <div key={ln.id} className="py-3.5 first:pt-0">
                        <div className="text-xs text-blue-900 font-medium">
                          Live ERP Broadcast · {ln.category} · Priority: {ln.priority}
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 mt-0.5">{ln.title}</h3>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ln.message}</p>
                      </div>
                    ))}
                    {SSN_PUBLIC_NOTICES.map((notice) => (
                      <div key={notice.id} className="py-3.5 first:pt-0 last:pb-0">
                        <div className="text-xs text-slate-500">
                          {notice.category} · {notice.date}
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 mt-0.5">
                          {notice.title}
                        </h3>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {notice.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Us & Campus Tour Scheduling */}
            <section className="bg-white rounded-xl border border-slate-200 p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <p className="text-xs text-slate-500">Visit Bapadev Kshetra Campus</p>
                  <h2 className="text-2xl font-display font-bold text-slate-950 mt-1">
                    Contact Information &amp; Campus Tour Timings
                  </h2>
                </div>

                <div className="space-y-4 text-sm text-slate-700">
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Official Address</div>
                    <p className="mt-0.5">{SSN_SCHOOL_INFO.address}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-semibold text-slate-900">
                        Office &amp; Reception Phone
                      </div>
                      <p className="mt-0.5 font-mono tabular-nums">{SSN_SCHOOL_INFO.phone}</p>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">Official Emails</div>
                      <p className="mt-0.5 text-xs font-mono">{SSN_SCHOOL_INFO.emailPrimary}</p>
                      <p className="text-xs font-mono">{SSN_SCHOOL_INFO.emailSecondary}</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                    <div className="font-semibold text-slate-900">
                      School &amp; Campus Tour Schedule
                    </div>
                    <p>{SSN_SCHOOL_INFO.schoolHours.weekdays}</p>
                    <p>{SSN_SCHOOL_INFO.schoolHours.saturday}</p>
                    <p>{SSN_SCHOOL_INFO.schoolHours.sunday}</p>
                    <p className="pt-1 text-slate-500">
                      Campus Tours: {SSN_SCHOOL_INFO.schoolHours.campusTourHours}
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-4">
                <h3 className="text-lg font-display font-bold text-slate-950">
                  Schedule a Campus Tour or Send an Inquiry
                </h3>
                {contactSubmitted && (
                  <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                    {contactSubmitted}
                  </div>
                )}
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactForm.fullName}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, fullName: e.target.value })
                        }
                        placeholder="Your full name"
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={contactForm.phone}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, phone: e.target.value })
                        }
                        placeholder="+91 99546 56161"
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 font-mono"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, email: e.target.value })
                        }
                        placeholder="you@example.com"
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Inquiry Subject
                      </label>
                      <select
                        value={contactForm.subject}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, subject: e.target.value })
                        }
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="Campus Tour Appointment (9:00 AM - 2:00 PM)">
                          Campus Tour Appointment (9:00 AM - 2:00 PM)
                        </option>
                        <option value="Admission Inquiry (2026-27)">
                          Admission Inquiry (2026-27)
                        </option>
                        <option value="Hostel Accommodation Inquiry">
                          Hostel Accommodation Inquiry
                        </option>
                        <option value="B.A. Honours / APSC Mentorship">
                          B.A. Honours / APSC Mentorship
                        </option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Message
                    </label>
                    <textarea
                      rows={3}
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, message: e.target.value })
                      }
                      placeholder="Specify preferred date for campus visit (at least 2 days in advance) or academic query..."
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Submit Campus Inquiry
                  </button>
                </form>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Official Document Inspection Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-xl w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <div className="text-xs font-mono text-slate-500">
                  OFFICIAL STATUTORY RECORD · REF: {selectedDoc.refNo}
                </div>
                <h3 className="text-lg font-display font-bold text-slate-950 mt-1">
                  {selectedDoc.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Issuing / Governing Authority</span>
                  <span className="font-semibold text-slate-900">{selectedDoc.authority}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Verification Status</span>
                  <span className="font-semibold text-emerald-700">{selectedDoc.status}</span>
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed">{selectedDoc.summary}</p>
              <div className="text-xs text-slate-500 pt-2 border-t border-slate-200 font-mono">
                Institution: Sankardev Shiksha Niketan, Gohpur · Affiliation: {SSN_SCHOOL_INFO.affiliationNo} · Code: {SSN_SCHOOL_INFO.schoolCode}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  printDocument({
                    title: `SSN_Prospectus_Extract_${selectedDoc.title.replace(/[^a-zA-Z0-9]/g, '_')}`,
                    orientation: 'portrait',
                  })
                }
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Print Extract
              </button>
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg cursor-pointer"
              >
                Close Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Notice Reader Modal */}
      {selectedNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50 rounded-t-2xl">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                    Official Notice Extract
                  </span>
                  {selectedNoticeModal.isLiveBroadcast && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      ⚡ Live ERP Stream
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-display font-bold text-slate-950 mt-1">
                  {selectedNoticeModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNoticeModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono">
                <div>
                  <div className="text-[10px] text-slate-400">Notice ID</div>
                  <div className="font-semibold text-slate-900">{selectedNoticeModal.id}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Date Published</div>
                  <div className="font-semibold text-slate-900">{selectedNoticeModal.date}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Category</div>
                  <div className="font-semibold text-slate-900">{selectedNoticeModal.category}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Issuing Body</div>
                  <div className="font-semibold text-slate-900 truncate">
                    {selectedNoticeModal.sender || 'Chairman Office'}
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 text-sm leading-relaxed text-slate-800">
                <p>{selectedNoticeModal.summary}</p>
                <p className="text-xs text-slate-500 pt-2 leading-relaxed">
                  This circular is an official digital communication issued under the authority of SAILAJA SANKKALP TRUST for Sankardev Shiksha Niketan, Gohpur (Affiliation: Sonitpur-2023/FR-25/10, School Code: 035371, Bapadev Kshetra, Solengi).
                </p>
              </div>

              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-blue-950">Administrative Seal &amp; Authority</div>
                  <div className="text-[11px] text-blue-800">Office of Mr. Uday Aditya Goswami, Founder &amp; Chairman</div>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-blue-900/30 flex items-center justify-center text-[9px] font-bold text-blue-900 uppercase">
                  Verified
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 bg-slate-50 border-t border-slate-200 rounded-b-2xl">
              <button
                type="button"
                onClick={() =>
                  printDocument({
                    title: `SSN_Institutional_Notice_${selectedNoticeModal.title.replace(/[^a-zA-Z0-9]/g, '_')}`,
                    orientation: 'portrait',
                  })
                }
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Notice</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedNoticeModal(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiet Institutional Footer */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 py-12 px-6 lg:px-10 no-print">
        <div className="max-w-[1360px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={SSN_IMAGES.schoolLogo}
                alt="SSN Gohpur Logo"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = SSN_IMAGES.schoolLogoLocal;
                }}
                className="w-10 h-10 object-contain rounded-full bg-white p-0.5 border border-slate-700 shadow-2xs shrink-0"
              />
              <div className="text-lg font-display font-bold text-white leading-tight">
                Sankardev Shiksha Niketan, Gohpur
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dedicated to fostering academic excellence and strong moral values through holistic development in Biswanath, Assam.
            </p>
            <p className="text-xs font-mono text-slate-500 pt-1">
              Affiliation: {SSN_SCHOOL_INFO.affiliationNo} · Code: {SSN_SCHOOL_INFO.schoolCode}
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="font-semibold text-white">Public Portal Navigation</div>
            <ul className="space-y-1.5">
              <li>
                <button type="button" onClick={() => setActivePage('home')} className="hover:text-white">
                  Home &amp; Board Results
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setActivePage('about')} className="hover:text-white">
                  About Us &amp; Governance (NM&amp;DC)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setActivePage('academics')} className="hover:text-white">
                  Academics (Class VI–XII &amp; B.A.)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setActivePage('facilities')} className="hover:text-white">
                  Infrastructure, Hostels &amp; Disclosures
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setActivePage('admissions')} className="hover:text-white">
                  Online Admission 2026–27
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2 text-xs">
            <div className="font-semibold text-white">Statutory Bodies &amp; School Portal</div>
            <ul className="space-y-1.5">
              <li>Assam State School Education Board (ASSEB)</li>
              <li>UGC · Ministry of Education (MoE) · NCTE</li>
              <li>SAILAJA SANKKALP TRUST</li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsLoginDialogOpen(true)}
                  className="text-blue-400 hover:text-blue-300 hover:underline font-medium flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <KeyRound className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                  <span>Smart School Portal Login (Admin / Teacher / Student / Parent)</span>
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2 text-xs">
            <div className="font-semibold text-white">Campus Address &amp; Office</div>
            <p>{SSN_SCHOOL_INFO.address}</p>
            <p className="font-mono text-slate-300">{SSN_SCHOOL_INFO.phone}</p>
            <p className="font-mono text-slate-300">{SSN_SCHOOL_INFO.emailPrimary}</p>
            <p className="text-slate-500">{SSN_SCHOOL_INFO.schoolHours.weekdays}</p>
          </div>
        </div>

        <div className="max-w-[1360px] mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 border-t border-slate-900 mt-4">
          <div>
            © 2023–2026 Sankardev Shiksha Niketan, Gohpur (SSN Gohpur). All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsLoginDialogOpen(true)}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <KeyRound className="w-3 h-3 text-blue-400" />
              <span>Portal Login (Super Admin &amp; Roles)</span>
            </button>
            <span>·</span>
            <span>Bapadev Kshetra, Solengi · Biswanath, Assam 784168</span>
          </div>
        </div>
      </footer>

      {/* Smart Dialog Page Global Login */}
      <SmartGlobalLoginDialog
        isOpen={isLoginDialogOpen}
        onClose={() => setIsLoginDialogOpen(false)}
        onLoginSuccess={() => {
          setIsLoginDialogOpen(false);
          onOpenErpPortal();
        }}
        onNavigateToAdmissions={() => {
          setIsLoginDialogOpen(false);
          setActivePage('admissions');
        }}
        initialEmail={loginDialogEmail}
      />

      {/* Official Admission Acknowledgement Slip Popup Window */}
      {isSlipPopupOpen && generatedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white border-2 border-slate-900 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 text-slate-900">
            <div className="flex flex-col sm:flex-row items-start justify-between border-b border-slate-200 pb-5 gap-4">
              <div className="flex items-start gap-4">
                <img
                  src={SSN_IMAGES.schoolLogo}
                  alt="SSN Logo"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = SSN_IMAGES.schoolLogoLocal;
                  }}
                  className="w-12 h-12 object-contain rounded-full bg-white p-0.5 border border-slate-300 shadow-2xs shrink-0"
                />
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-blue-900 font-semibold">
                    OFFICIAL ADMISSION ACKNOWLEDGEMENT SLIP · SESSION 2026–27
                  </div>
                  <h3 className="text-xl font-display font-bold text-slate-950">
                    Sankardev Shiksha Niketan, Gohpur (Code: 035371)
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Bapadev Kshetra, Solengi, P.O: Govinda Elengisatra, Biswanath, Pin: 784168
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 no-print shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    printDocument({
                      title: `SSN_Admission_Slip_${generatedSlip.applicationNo}`,
                      orientation: 'portrait',
                    })
                  }
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-900 rounded-lg hover:bg-blue-800 inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSlipPopupOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
                  title="Close popup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {generatedSlip.studentPhoto ? (
                <div className="w-28 h-36 rounded-xl border border-slate-300 overflow-hidden shadow-2xs shrink-0 bg-slate-100">
                  <img
                    src={generatedSlip.studentPhoto}
                    alt="Student"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-28 h-36 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-2 bg-slate-50 shrink-0">
                  <Camera className="w-6 h-6 mb-1 text-slate-300" />
                  <span>Passport Photo</span>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-xs flex-1">
                <div>
                  <span className="text-slate-500 block">Application ID</span>
                  <span className="font-mono font-bold text-blue-950 text-base">
                    {generatedSlip.applicationNo}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Applicant Full Name</span>
                  <span className="font-semibold text-slate-900">
                    {generatedSlip.applicantName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Applying For Class</span>
                  <span className="font-semibold text-slate-900">
                    {generatedSlip.applyingForClass} ({generatedSlip.stream})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Gender &amp; DOB</span>
                  <span className="font-semibold text-slate-900">
                    {generatedSlip.gender || 'Male'} · {generatedSlip.dob || 'NA'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Blood Group / Hostel</span>
                  <span className="font-semibold text-slate-900">
                    {generatedSlip.bloodGroup || 'A+'} · Hostel: {generatedSlip.hostelRequired || 'Yes (Compulsory)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Guardian Details</span>
                  <span className="font-semibold text-slate-900">
                    {generatedSlip.guardianName} ({generatedSlip.guardianRelation || 'Guardian'}) · {generatedSlip.contactPhone}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Student Portal Login</span>
                  <span className="font-mono font-semibold text-blue-900">
                    {generatedSlip.contactEmail}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Provisional Fee Assessment</span>
                  <span className="font-mono font-semibold text-slate-900">
                    ₹{generatedSlip.feeAmount.toLocaleString('en-IN')} ({generatedSlip.feeStatus})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Application Status</span>
                  <span className="font-bold text-emerald-700 uppercase">
                    {generatedSlip.applicationStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Barcode & Official Instructions */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-slate-600 leading-relaxed max-w-[45ch]">
                Please present this barcoded slip along with original Birth Certificate, Marksheets, Transfer Certificate and 2 passport photos at the Bapadev Kshetra office within 3 working days.
              </div>
              <div className="bg-slate-50 px-5 py-2.5 border border-slate-300 rounded-lg text-center shrink-0">
                <div className="font-mono tracking-[0.25em] text-xs font-bold text-slate-950">
                  ||| |||| | ||| |||| || |||
                </div>
                <div className="font-mono text-[11px] text-slate-600 mt-0.5">
                  {generatedSlip.applicationNo}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3 no-print">
              <button
                type="button"
                onClick={() => setIsSlipPopupOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() =>
                  printDocument({
                    title: `SSN_Admission_Slip_${generatedSlip.applicationNo}`,
                    orientation: 'portrait',
                  })
                }
                className="px-5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Slip Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Offline (Office) Physical Admission Application Form Modal */}
      {offlineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white border-2 border-slate-900 rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 text-slate-900">
            <div className="flex flex-col sm:flex-row items-start justify-between border-b border-slate-200 pb-4 gap-4">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-amber-800 font-semibold">
                  OFFLINE COUNTER ADMISSION · SESSION 2026–27
                </div>
                <h3 className="text-xl font-display font-bold text-slate-950">
                  Physical Blank Admission Application Form
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Print this official form to fill manually with pen and submit at the Bapadev Kshetra school office counter.
                </p>
              </div>

              <div className="flex items-center gap-2 no-print shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    printDocument({
                      title: 'SSN_Gohpur_Physical_Admission_Application_Form_2026_27',
                      orientation: 'portrait',
                    })
                  }
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Form (Ctrl+P)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOfflineModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
                  title="Close form"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Form Sheet Simulation */}
            <div className="p-6 rounded-xl border border-slate-300 bg-slate-50/50 space-y-6 text-xs text-slate-800">
              <div className="flex items-start justify-between border-b border-slate-300 pb-4">
                <div className="space-y-1">
                  <div className="font-bold text-sm text-slate-950">
                    SANKARDEV SHIKSHA NIKETAN, GOHPUR (ESTD. 2023)
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Bapadev Kshetra, Solengi, Biswanath, Assam · School Code: 035371
                  </div>
                  <div className="text-[11px] font-mono font-semibold text-blue-900">
                    Official Application Form for Class VI to XII &amp; 4-Year B.A. Honours
                  </div>
                </div>
                <div className="w-24 h-28 border border-dashed border-slate-400 rounded bg-white flex flex-col items-center justify-center text-slate-400 text-[10px] text-center p-1">
                  <Camera className="w-5 h-5 mb-1 text-slate-300" />
                  <span>Affix Recent Passport Photo</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-bold text-slate-700 block mb-1">1. Seeking Admission to Class:</span>
                  <div className="p-2 bg-white border border-slate-300 rounded font-mono">
                    [ ] VI  [ ] VII  [ ] VIII  [ ] IX  [ ] X  [ ] XI Sc  [ ] XI Arts  [ ] XII  [ ] B.A.
                  </div>
                </div>
                <div>
                  <span className="font-bold text-slate-700 block mb-1">2. Academic Stream:</span>
                  <div className="p-2 bg-white border border-slate-300 rounded font-mono">
                    [ ] Science  [ ] Arts  [ ] Commerce  [ ] General Foundation
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-700 block">3. Scholar Full Name (in block letters):</span>
                <div className="h-8 bg-white border-b-2 border-slate-400 border-dashed"></div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <span className="font-bold text-slate-700 block">4. Date of Birth:</span>
                  <div className="h-8 bg-white border-b border-slate-400 mt-1 flex items-center px-2 text-slate-400 font-mono">
                    DD / MM / YYYY
                  </div>
                </div>
                <div>
                  <span className="font-bold text-slate-700 block">5. Gender:</span>
                  <div className="h-8 bg-white border-b border-slate-400 mt-1 flex items-center px-2 text-slate-400 font-mono">
                    [ ] Male  [ ] Female  [ ] Other
                  </div>
                </div>
                <div>
                  <span className="font-bold text-slate-700 block">6. Blood Group:</span>
                  <div className="h-8 bg-white border-b border-slate-400 mt-1"></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-bold text-slate-700 block">7. Caste / Category:</span>
                  <div className="h-8 bg-white border-b border-slate-400 mt-1 flex items-center px-1 text-[11px] text-slate-400 font-mono">
                    [ ] Gen  [ ] OBC  [ ] MOBC  [ ] SC  [ ] ST(P)  [ ] ST(H)
                  </div>
                </div>
                <div>
                  <span className="font-bold text-slate-700 block">8. Religion &amp; Mother Tongue:</span>
                  <div className="h-8 bg-white border-b border-slate-400 mt-1"></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-bold text-slate-700 block">9. Father&apos;s Name:</span>
                  <div className="h-8 bg-white border-b border-slate-400 mt-1"></div>
                </div>
                <div>
                  <span className="font-bold text-slate-700 block">10. Mother&apos;s / Guardian&apos;s Name:</span>
                  <div className="h-8 bg-white border-b border-slate-400 mt-1"></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-bold text-slate-700 block">11. Primary Contact Mobile No:</span>
                  <div className="h-8 bg-white border-b border-slate-400 mt-1"></div>
                </div>
                <div>
                  <span className="font-bold text-slate-700 block">12. Parent / Student Email:</span>
                  <div className="h-8 bg-white border-b border-slate-400 mt-1"></div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-700 block">13. Permanent Residential Address:</span>
                <div className="h-12 bg-white border border-slate-300 rounded p-2"></div>
              </div>

              <div className="p-3 bg-amber-50 rounded border border-amber-200">
                <span className="font-bold text-amber-950 block">14. Compulsory Hostel &amp; Residency Declaration:</span>
                <p className="text-[11px] text-amber-900 mt-0.5">
                  Sankardev Shiksha Niketan, Solengi is a full residential institution. All scholars are allocated to institution-monitored dormitories. Mess Preference: [ ] Satvic Vegetarian  [ ] Standard Non-Vegetarian.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-[11px] text-slate-600">
                <div className="space-y-6">
                  <div className="h-6 border-b border-slate-400"></div>
                  <span>Signature of Student / Applicant</span>
                </div>
                <div className="space-y-6">
                  <div className="h-6 border-b border-slate-400"></div>
                  <span>Signature of Parent / Guardian</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 no-print">
              <span className="text-xs text-slate-500">
                Office Hours: 9:00 AM – 3:30 PM (Mon–Sat) · Gohpur, Bapadev Kshetra
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOfflineModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() =>
                    printDocument({
                      title: 'SSN_Gohpur_Physical_Admission_Application_Form_2026_27',
                      orientation: 'portrait',
                    })
                  }
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Form</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
