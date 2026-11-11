import React, { useState, useMemo } from 'react';
import { User } from 'firebase/auth';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Award,
  GraduationCap,
  Fingerprint,
  Bell,
  FileSpreadsheet,
  Search,
  Plus,
  RefreshCw,
  Printer,
  Edit3,
  Trash2,
  CheckCircle2,
  Lock,
  Building2,
  LogOut,
  ArrowLeft,
  Clock,
  Database,
  Eye,
  AlertTriangle,
  FileText,
  DollarSign,
  TrendingUp,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
  UserPlus,
  Receipt,
  Camera,
  Upload,
  Key,
  EyeOff,
  Trophy,
  IdCard,
  LayoutGrid,
  Table as TableIcon,
  User as UserIcon,
  PieChart,
} from 'lucide-react';
import {
  UserProfileDoc,
  GradeRecordDoc,
  SkillMilestoneDoc,
  BiometricAttendanceDoc,
  NotificationItemDoc,
  AdmissionRecordDoc,
  FeeStructureRecordDoc,
  DepartmentDoc,
  WallOfFameDoc,
  ExamTermType,
  UserRole,
  HrStaffDoc,
  HrPayrollDoc,
  HrLeaveDoc,
  StudentCertificateDoc,
  FeePaymentReceiptDoc,
  SchoolAdminSettingsDoc,
} from '../../types/erp';
import { DEFAULT_SCHOOL_SETTINGS } from '../../data/erpSeedService';
import { printDocument, formatCurrencyToWords, getInstitutionalVerificationTimestamp } from '../../utils/printDocument';
import { PrintActionToolbar } from '../common/PrintActionToolbar';
import { PWAInstallButton } from '../PWAInstallButton';
import { FeeStructureDirectoryManager } from './FeeStructureDirectoryManager';
import { DepartmentDirectoryManager } from './DepartmentDirectoryManager';
import { WallOfFameDirectoryManager } from './WallOfFameDirectoryManager';
import { HrManagementDirectory } from './HrManagementDirectory';
import { InstitutionalDocumentManager } from './InstitutionalDocumentManager';
import { StudentFeeTransactionManager } from './StudentFeeTransactionManager';

interface AdminGovernanceDashboardProps {
  currentUser: User | null;
  onSignOut: () => void;
  onBackToPublicPortal: () => void;
  onSwitchPortalView?: (view: 'admin' | 'teacher' | 'student') => void;
  users: UserProfileDoc[];
  grades: GradeRecordDoc[];
  skills: SkillMilestoneDoc[];
  biometricLogs: BiometricAttendanceDoc[];
  notifications: NotificationItemDoc[];
  admissions: AdmissionRecordDoc[];
  feeStructures?: FeeStructureRecordDoc[];
  departments?: DepartmentDoc[];
  wallOfFame?: WallOfFameDoc[];
  hrStaff?: HrStaffDoc[];
  hrPayroll?: HrPayrollDoc[];
  hrLeaves?: HrLeaveDoc[];
  certificates?: StudentCertificateDoc[];
  payments?: FeePaymentReceiptDoc[];
  schoolSettings?: SchoolAdminSettingsDoc;
  isLoadingData: boolean;
  onAddUser?: (user: Partial<UserProfileDoc>) => Promise<void>;
  onUpdateUser?: (id: string, updates: Partial<UserProfileDoc>) => Promise<void>;
  onDeleteUser?: (id: string) => Promise<void>;
  onAddAdmission?: (admission: Partial<AdmissionRecordDoc>) => Promise<void>;
  onUpdateAdmissionStatus?: (id: string, status: 'submitted' | 'verified' | 'enrolled' | 'rejected', feeStatus: 'pending' | 'paid' | 'waived') => Promise<void>;
  onBroadcastNotice?: (notice: Partial<NotificationItemDoc>) => Promise<void>;
  onAddFeeStructure?: (fee: Partial<FeeStructureRecordDoc>) => Promise<void>;
  onUpdateFeeStructure?: (id: string, updates: Partial<FeeStructureRecordDoc>) => Promise<void>;
  onDeleteFeeStructure?: (id: string) => Promise<void>;
  onAddDepartment?: (dept: Partial<DepartmentDoc>) => Promise<void>;
  onUpdateDepartment?: (id: string, updates: Partial<DepartmentDoc>) => Promise<void>;
  onDeleteDepartment?: (id: string) => Promise<void>;
  onAddWallOfFame?: (award: Partial<WallOfFameDoc>) => Promise<void>;
  onUpdateWallOfFame?: (id: string, updates: Partial<WallOfFameDoc>) => Promise<void>;
  onDeleteWallOfFame?: (id: string) => Promise<void>;
  onAddStaff?: (staff: Partial<HrStaffDoc>) => Promise<void>;
  onUpdateStaff?: (id: string, updates: Partial<HrStaffDoc>) => Promise<void>;
  onDeleteStaff?: (id: string) => Promise<void>;
  onAddPayroll?: (payroll: Partial<HrPayrollDoc>) => Promise<void>;
  onUpdatePayroll?: (id: string, updates: Partial<HrPayrollDoc>) => Promise<void>;
  onDeletePayroll?: (id: string) => Promise<void>;
  onAddLeave?: (leave: Partial<HrLeaveDoc>) => Promise<void>;
  onUpdateLeave?: (id: string, updates: Partial<HrLeaveDoc>) => Promise<void>;
  onDeleteLeave?: (id: string) => Promise<void>;
  onAddCertificate?: (cert: Partial<StudentCertificateDoc>) => Promise<void>;
  onUpdateCertificate?: (id: string, updates: Partial<StudentCertificateDoc>) => Promise<void>;
  onAddPaymentReceipt?: (payment: Partial<FeePaymentReceiptDoc>) => Promise<void>;
  onUpdatePaymentReceipt?: (id: string, updates: Partial<FeePaymentReceiptDoc>) => Promise<void>;
  onDeletePaymentReceipt?: (id: string) => Promise<void>;
  onUpdateSchoolSettings?: (settings: Partial<SchoolAdminSettingsDoc>) => Promise<void>;
}

export type AdminTab =
  | 'overview'
  | 'fee_transactions'
  | 'fee_structures'
  | 'departments'
  | 'wall_of_fame'
  | 'hr_management'
  | 'documents_settings'
  | 'admissions'
  | 'student_admission'
  | 'grades'
  | 'skills'
  | 'biometrics'
  | 'notifications'
  | 'statutory';

export const AdminGovernanceDashboard: React.FC<AdminGovernanceDashboardProps> = ({
  currentUser,
  onSignOut,
  onBackToPublicPortal,
  users,
  grades,
  skills,
  biometricLogs,
  notifications,
  admissions,
  feeStructures = [],
  departments = [],
  wallOfFame = [],
  hrStaff = [],
  hrPayroll = [],
  hrLeaves = [],
  certificates = [],
  payments = [],
  schoolSettings = DEFAULT_SCHOOL_SETTINGS as SchoolAdminSettingsDoc,
  isLoadingData,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onAddAdmission,
  onUpdateAdmissionStatus,
  onBroadcastNotice,
  onAddFeeStructure,
  onUpdateFeeStructure,
  onDeleteFeeStructure,
  onAddDepartment,
  onUpdateDepartment,
  onDeleteDepartment,
  onAddWallOfFame,
  onUpdateWallOfFame,
  onDeleteWallOfFame,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
  onAddPayroll,
  onUpdatePayroll,
  onDeletePayroll,
  onAddLeave,
  onUpdateLeave,
  onDeleteLeave,
  onAddCertificate,
  onUpdateCertificate,
  onAddPaymentReceipt,
  onUpdatePaymentReceipt,
  onDeletePaymentReceipt,
  onUpdateSchoolSettings,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [admissionFilter, setAdmissionFilter] = useState<string>('all');
  const [admissionSearch, setAdmissionSearch] = useState('');
  const [gradeSearch, setGradeSearch] = useState('');
  const [gradeTermFilter, setGradeTermFilter] = useState<string>('all');
  const [selectedAdmission, setSelectedAdmission] = useState<AdmissionRecordDoc | null>(null);
  const [scrutinyChecklist, setScrutinyChecklist] = useState({
    birthCertificate: true,
    marksheetTc: true,
    conductCert: true,
    medicalFitness: true,
    hostelAllocation: true,
  });
  const [rejectionReason, setRejectionReason] = useState('');
  const [isScrutinySubmitting, setIsScrutinySubmitting] = useState(false);
  const [viewingCredentialAdmission, setViewingCredentialAdmission] = useState<AdmissionRecordDoc | null>(null);
  const [credentialCopied, setCredentialCopied] = useState(false);

  // Broadcast Notice Modal State
  const [isBroadcastingNotice, setIsBroadcastingNotice] = useState(false);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeMsg, setNewNoticeMsg] = useState('');
  const [newNoticeCategory, setNewNoticeCategory] = useState('Academic');
  const [newNoticePriority, setNewNoticePriority] = useState<'normal' | 'high' | 'urgent'>('high');
  const [newNoticeTarget, setNewNoticeTarget] = useState<'all' | 'teacher' | 'student' | 'parent'>('all');
  const [isSendingNotice, setIsSendingNotice] = useState(false);

  // User Master CRUD State
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState({
    fullName: '',
    email: '',
    role: 'student' as UserRole,
    gender: 'Male' as 'Male' | 'Female',
    departmentOrClass: 'Class XII (Science Stream)',
    rollOrEmpNo: 'SSN-2026-090',
    guardianOrLinkedName: 'Guardian Name',
    phone: '+91 9954656161',
    address: 'Solengi, Gohpur, Biswanath',
  });
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  // Biometric Terminal Hardware Model & API Config State
  const [biometricTerminals, setBiometricTerminals] = useState([
    {
      id: 'term_01',
      name: 'Optical Scanner #01 (Bapadev Main Gate)',
      model: 'BioMetric Apex-X 500FP',
      apiVersion: 'v2.4-REST',
      endpointUrl: 'https://gateway.ssngohpur.ac.in/api/v1/scanner-01',
      baudRate: '115200 bps',
      sensitivity: '98.5% (High Precision)',
      encryption: 'AES-256 Bit TLS Tunnel',
      status: 'Online',
      lastPing: 'Just now',
    },
    {
      id: 'term_02',
      name: 'Passkey Gateway #02 (Admin Block)',
      model: 'FIDO2 WebAuthn Passkey V3',
      apiVersion: 'v3.0-FIDO',
      endpointUrl: 'https://gateway.ssngohpur.ac.in/api/v1/passkey-auth',
      baudRate: 'Gigabit LAN / BLE 5.2',
      sensitivity: 'Biometric FIDO2 Level 2',
      encryption: 'ECDSA P-256 Secure Enclave',
      status: 'Online',
      lastPing: '2 mins ago',
    },
    {
      id: 'term_03',
      name: 'IRIS Optical Sensor #03 (Science Wing)',
      model: 'IrisScan Pro-9000',
      apiVersion: 'v1.8-REST',
      endpointUrl: 'https://gateway.ssngohpur.ac.in/api/v1/iris-03',
      baudRate: '57600 bps',
      sensitivity: '99.1% Sub-millimeter',
      encryption: 'AES-256 Bit',
      status: 'Standby',
      lastPing: '15 mins ago',
    },
  ]);
  const [selectedTerminalId, setSelectedTerminalId] = useState('term_01');
  const [configForm, setConfigForm] = useState({
    model: 'BioMetric Apex-X 500FP',
    apiVersion: 'v2.4-REST',
    endpointUrl: 'https://gateway.ssngohpur.ac.in/api/v1/scanner-01',
    baudRate: '115200 bps',
    sensitivity: '98.5% (High Precision)',
    encryption: 'AES-256 Bit TLS Tunnel',
    webhookUrl: 'https://ssngohpur.ac.in/api/webhooks/biometric-sync',
    apiKey: 'ssn_live_sec_9941a88301be47b',
  });
  const [terminalFeedback, setTerminalFeedback] = useState<string | null>(null);
  const [isTestingTerminal, setIsTestingTerminal] = useState(false);

  // Class-wise Demographics View Mode State
  const [classDemographicsView, setClassDemographicsView] = useState<'cards' | 'table'>('cards');
  const [demographicsStageFilter, setDemographicsStageFilter] = useState<'all' | 'middle' | 'secondary' | 'hs' | 'degree'>('all');

  // Unified Student Demographics calculated 100% strictly from real-time Firestore collections (no mock baseline counts)
  const studentDemographics = useMemo(() => {
    const classConfigs = [
      { id: 'cls_6', name: 'Class VI', stage: 'middle', stageLabel: 'Middle School', stream: 'General Foundation & Vedic Sciences', hostel: 'Brahmaputra Dorm / Chhatriniwas' },
      { id: 'cls_7', name: 'Class VII', stage: 'middle', stageLabel: 'Middle School', stream: 'General Foundation & Assamese Literature', hostel: 'Brahmaputra Dorm / Chhatriniwas' },
      { id: 'cls_8', name: 'Class VIII', stage: 'middle', stageLabel: 'Middle School', stream: 'General Foundation & Applied Mathematics', hostel: 'Brahmaputra Dorm / Chhatriniwas' },
      { id: 'cls_9', name: 'Class IX', stage: 'secondary', stageLabel: 'Secondary Stage', stream: 'ASSEB Secondary Foundation', hostel: 'Brahmaputra Dorm / Chhatriniwas' },
      { id: 'cls_10', name: 'Class X', stage: 'secondary', stageLabel: 'Secondary (HSLC)', stream: 'ASSEB HSLC Board Exam Year', hostel: 'Brahmaputra Dorm / Chhatriniwas' },
      { id: 'cls_11_sci', name: 'Class XI (Science)', stage: 'hs', stageLabel: 'Higher Secondary', stream: 'Physics, Chemistry, Maths & Bio', hostel: 'Brahmaputra Dorm / Chhatriniwas' },
      { id: 'cls_11_arts', name: 'Class XI (Arts)', stage: 'hs', stageLabel: 'Higher Secondary', stream: 'Humanities, History & Political Science', hostel: 'Brahmaputra Dorm / Chhatriniwas' },
      { id: 'cls_12_sci', name: 'Class XII (Science)', stage: 'hs', stageLabel: 'Higher Secondary Final', stream: 'Board Final & NEET/JEE Preparatory', hostel: 'Brahmaputra Dorm / Chhatriniwas' },
      { id: 'cls_12_arts', name: 'Class XII (Arts)', stage: 'hs', stageLabel: 'Higher Secondary Final', stream: 'Board Final & APSC/UPSC Foundation', hostel: 'Brahmaputra Dorm / Chhatriniwas' },
      { id: 'cls_ba', name: '4-Year B.A. Honours', stage: 'degree', stageLabel: 'Undergraduate Degree', stream: 'English & Political Science Honours', hostel: 'Brahmaputra Dorm / Chhatriniwas' },
    ];

    const realTimeClassCounts: Record<string, { boys: number; girls: number }> = {};
    classConfigs.forEach((c) => {
      realTimeClassCounts[c.id] = { boys: 0, girls: 0 };
    });

    const countedStudentKeys = new Set<string>();

    // 1. Calculate strictly from real-time Firestore Admissions collection
    admissions.forEach((a) => {
      const clsName = (a.applyingForClass || '').toLowerCase();
      const isFemale =
        a.gender === 'Female' ||
        (a.gender !== 'Male' && /ananya|niharika|himashree|priyanka|puja|riya|sneha|mina|junali|deepa|rupali|pallavi|barsha|kabita/i.test(a.applicantName));

      const key = (a.applicantName || '').trim().toLowerCase();
      if (key) countedStudentKeys.add(key);

      const target = classConfigs.find(
        (c) =>
          clsName.includes(c.name.toLowerCase().replace(/ \(.+\)/, '')) ||
          (c.name.includes('Science') && clsName.includes('science')) ||
          (c.name.includes('Arts') && clsName.includes('arts')) ||
          (c.name.includes('B.A.') && clsName.includes('b.a.'))
      );
      if (target) {
        if (isFemale) realTimeClassCounts[target.id].girls += 1;
        else realTimeClassCounts[target.id].boys += 1;
      }
    });

    // 2. Calculate strictly from real-time Firestore Users collection (students)
    users
      .filter((u) => u.role === 'student')
      .forEach((u) => {
        const key = (u.fullName || '').trim().toLowerCase();
        if (key && countedStudentKeys.has(key)) return; // Avoid double-counting if already in admissions

        const clsName = (u.departmentOrClass || '').toLowerCase();
        const isFemale =
          u.gender === 'Female' ||
          (u.gender !== 'Male' && /ananya|niharika|himashree|priyanka|puja|riya|sneha|mina|junali|deepa|rupali|pallavi|barsha|kabita/i.test(u.fullName));

        const target = classConfigs.find(
          (c) =>
            clsName.includes(c.name.toLowerCase().replace(/ \(.+\)/, '')) ||
            (c.name.includes('Science') && clsName.includes('science')) ||
            (c.name.includes('Arts') && clsName.includes('arts')) ||
            (c.name.includes('B.A.') && clsName.includes('b.a.'))
        );
        if (target) {
          if (isFemale) realTimeClassCounts[target.id].girls += 1;
          else realTimeClassCounts[target.id].boys += 1;
        }
      });

    const classBreakdown = classConfigs.map((cfg) => {
      const boys = realTimeClassCounts[cfg.id].boys;
      const girls = realTimeClassCounts[cfg.id].girls;
      const total = boys + girls;
      const boysPct = total > 0 ? Math.round((boys / total) * 100) : 0;
      const girlsPct = total > 0 ? 100 - boysPct : 0;

      return {
        ...cfg,
        total,
        boys,
        girls,
        boysPct,
        girlsPct,
      };
    });

    const totalStudentsCount = classBreakdown.reduce((sum, c) => sum + c.total, 0);
    const totalBoysCount = classBreakdown.reduce((sum, c) => sum + c.boys, 0);
    const totalGirlsCount = classBreakdown.reduce((sum, c) => sum + c.girls, 0);
    const overallBoysPct = totalStudentsCount > 0 ? Math.round((totalBoysCount / totalStudentsCount) * 100) : 0;
    const overallGirlsPct = totalStudentsCount > 0 ? 100 - overallBoysPct : 0;

    return {
      totalStudentsCount,
      totalBoysCount,
      totalGirlsCount,
      overallBoysPct,
      overallGirlsPct,
      classBreakdown,
    };
  }, [users, admissions]);

  // Computed Governance Metrics
  const totalStudents = studentDemographics.totalStudentsCount;
  const totalTeachers = users.filter((u) => u.role === 'teacher').length;
  const totalParents = users.filter((u) => u.role === 'parent').length;
  const enrolledAdmissions = admissions.filter((a) => a.applicationStatus === 'enrolled').length;
  const pendingAdmissions = admissions.filter((a) => a.applicationStatus === 'submitted').length;
  const totalFeesCollected = admissions
    .filter((a) => a.feeStatus === 'paid')
    .reduce((sum, a) => sum + (a.feeAmount || 0), 0);

  const filteredAdmissions = useMemo(() => {
    return admissions.filter((adm) => {
      const matchStatus = admissionFilter === 'all' || adm.applicationStatus === admissionFilter;
      const matchSearch =
        !admissionSearch.trim() ||
        adm.applicantName.toLowerCase().includes(admissionSearch.toLowerCase()) ||
        adm.applicationNo.toLowerCase().includes(admissionSearch.toLowerCase()) ||
        adm.applyingForClass.toLowerCase().includes(admissionSearch.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [admissions, admissionFilter, admissionSearch]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      const matchSearch =
        !userSearch.trim() ||
        u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.rollOrEmpNo.toLowerCase().includes(userSearch.toLowerCase());
      return matchRole && matchSearch;
    });
  }, [users, userRoleFilter, userSearch]);

  const filteredGrades = useMemo(() => {
    return grades.filter((g) => {
      const matchTerm = gradeTermFilter === 'all' || g.examTerm === gradeTermFilter;
      const matchSearch =
        !gradeSearch.trim() ||
        g.studentName.toLowerCase().includes(gradeSearch.toLowerCase()) ||
        g.subject.toLowerCase().includes(gradeSearch.toLowerCase()) ||
        g.className.toLowerCase().includes(gradeSearch.toLowerCase());
      return matchTerm && matchSearch;
    });
  }, [grades, gradeTermFilter, gradeSearch]);

  const handleSendNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle.trim() || !newNoticeMsg.trim()) return;
    setIsSendingNotice(true);
    try {
      if (onBroadcastNotice) {
        await onBroadcastNotice({
          title: newNoticeTitle.trim(),
          message: newNoticeMsg.trim(),
          category: newNoticeCategory as NotificationItemDoc['category'],
          priority: newNoticePriority,
          targetRole: newNoticeTarget,
          senderName: 'Office of the Super Admin, SAILAJA SANKKALP TRUST',
        });
      }
      setIsBroadcastingNotice(false);
      setNewNoticeTitle('');
      setNewNoticeMsg('');
    } catch (err) {
      console.error('Failed to broadcast notice:', err);
    } finally {
      setIsSendingNotice(false);
    }
  };

  const handleUserFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.fullName.trim() || !userForm.email.trim()) return;
    setIsSubmittingUser(true);
    try {
      if (editingUserId && onUpdateUser) {
        await onUpdateUser(editingUserId, userForm);
      } else if (onAddUser) {
        await onAddUser(userForm);
      }
      setIsAddingUser(false);
      setEditingUserId(null);
      setUserForm({
        fullName: '',
        email: '',
        role: 'student',
        gender: 'Male',
        departmentOrClass: 'Class XII (Science Stream)',
        rollOrEmpNo: 'SSN-2026-090',
        guardianOrLinkedName: 'Guardian Name',
        phone: '+91 9954656161',
        address: 'Solengi, Gohpur, Biswanath',
      });
    } catch (err) {
      console.error('User CRUD error:', err);
    } finally {
      setIsSubmittingUser(false);
    }
  };

  // Student Admission Form & Residency Hostel State
  const [isSubmittingAdmissionForm, setIsSubmittingAdmissionForm] = useState(false);
  const [studentAdmissionForm, setStudentAdmissionForm] = useState({
    applicantName: '',
    gender: 'Male' as 'Male' | 'Female',
    applyingForClass: 'Class IX',
    stream: 'General Foundation',
    guardianName: '',
    contactPhone: '+91 9954656161',
    email: '',
    address: 'Solengi, Gohpur, Biswanath',
    previousSchool: '',
    feeAmount: 35000,
    feeStatus: 'pending' as 'pending' | 'paid' | 'waived',
    hostelBlock: 'Brahmaputra Boys Hostel - Block A',
    roomNumber: 'Room 102',
    messPreference: 'Vegetarian',
    studentPhoto: '',
    photoType: 'url' as 'url' | 'file',
    portalPassword: '',
    showPassword: false,
  });

  const handleStudentAdmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentAdmissionForm.applicantName.trim() || !studentAdmissionForm.guardianName.trim()) return;
    setIsSubmittingAdmissionForm(true);
    try {
      const generatedRoll = `SSN-ADM-${Math.floor(1000 + Math.random() * 9000)}`;
      const generatedEmail =
        studentAdmissionForm.email ||
        `${studentAdmissionForm.applicantName.toLowerCase().replace(/[^a-z0-9]/g, '')}.${generatedRoll.slice(-4)}@ssngohpur.ac.in`;
      const generatedPwd =
        studentAdmissionForm.portalPassword ||
        `SSN-STD@${generatedRoll.replace(/[^a-zA-Z0-9]/g, '')}`;

      const fullSubmission = {
        ...studentAdmissionForm,
        applicationNo: generatedRoll,
        email: generatedEmail,
        contactEmail: generatedEmail,
        portalLoginEmail: generatedEmail,
        portalInitialPassword: generatedPwd,
        credentialsIssuedAt: new Date().toISOString(),
      };

      if (onAddAdmission) {
        await onAddAdmission(fullSubmission);
      }

      setViewingCredentialAdmission({
        id: `adm_${Date.now()}`,
        applicationNo: generatedRoll,
        applicantName: studentAdmissionForm.applicantName,
        gender: studentAdmissionForm.gender,
        applyingForClass: studentAdmissionForm.applyingForClass,
        stream: studentAdmissionForm.stream,
        guardianName: studentAdmissionForm.guardianName,
        contactPhone: studentAdmissionForm.contactPhone,
        contactEmail: generatedEmail,
        previousSchool: studentAdmissionForm.previousSchool,
        percentageLastExam: 85,
        feeAmount: studentAdmissionForm.feeAmount,
        feeStatus: studentAdmissionForm.feeStatus,
        applicationStatus: 'enrolled',
        ownerUid: currentUser?.uid || 'admin',
        portalLoginEmail: generatedEmail,
        portalInitialPassword: generatedPwd,
        credentialsIssuedAt: new Date().toISOString(),
      });

      setStudentAdmissionForm({
        applicantName: '',
        gender: 'Male',
        applyingForClass: 'Class IX',
        stream: 'General Foundation',
        guardianName: '',
        contactPhone: '+91 9954656161',
        email: '',
        address: 'Solengi, Gohpur, Biswanath',
        previousSchool: '',
        feeAmount: 35000,
        feeStatus: 'pending',
        hostelBlock: 'Brahmaputra Boys Hostel - Block A',
        roomNumber: 'Room 102',
        messPreference: 'Vegetarian',
        studentPhoto: '',
        photoType: 'url',
        portalPassword: '',
        showPassword: false,
      });
      setActiveTab('admissions');
    } catch (err) {
      console.error('Student admission submission error:', err);
    } finally {
      setIsSubmittingAdmissionForm(false);
    }
  };

  const navSections = [
    {
      group: 'Core Governance',
      items: [
        { id: 'overview' as AdminTab, label: 'Command Overview', icon: Building2, badge: null, badgeColor: '' },
        {
          id: 'fee_transactions' as AdminTab,
          label: 'Fee Transactions & Ledger',
          icon: Receipt,
          badge: `${payments.length} Txns`,
          badgeColor: 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold',
        },
        {
          id: 'fee_structures' as AdminTab,
          label: 'Fee Structure Directory',
          icon: DollarSign,
          badge: `${feeStructures.length} Classes`,
          badgeColor: 'bg-blue-100 text-blue-900 border border-blue-300 font-bold',
        },
        {
          id: 'departments' as AdminTab,
          label: 'Department Directory',
          icon: Building2,
          badge: `${departments.length} Units`,
          badgeColor: 'bg-blue-100 text-blue-900 border border-blue-300 font-bold',
        },
        {
          id: 'wall_of_fame' as AdminTab,
          label: 'Wall of Fame & Honor Roll',
          icon: Trophy,
          badge: `${wallOfFame.length} Achievers`,
          badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300 font-bold',
        },
        {
          id: 'hr_management' as AdminTab,
          label: 'HR, Staff & Payroll',
          icon: Users,
          badge: `${hrStaff.length} Staff`,
          badgeColor: 'bg-purple-100 text-purple-900 border border-purple-300 font-bold',
        },
        {
          id: 'documents_settings' as AdminTab,
          label: 'ERP Docs & ID Cards',
          icon: IdCard,
          badge: 'Print/PDF',
          badgeColor: 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold',
        },
        {
          id: 'student_admission' as AdminTab,
          label: 'Student Admission',
          icon: UserPlus,
          badge: 'New',
          badgeColor: 'bg-amber-100 text-amber-800 border border-amber-300 font-bold',
        },
        {
          id: 'admissions' as AdminTab,
          label: 'Admissions Desk',
          icon: FileText,
          badge: pendingAdmissions > 0 ? `${pendingAdmissions} Pending` : `${admissions.length}`,
          badgeColor:
            pendingAdmissions > 0
              ? 'bg-amber-100 text-amber-800 border border-amber-300 font-bold animate-pulse'
              : 'bg-slate-100 text-slate-600 border border-slate-200',
        },
      ],
    },
    {
      group: 'Academics & Operations',
      items: [
        {
          id: 'grades' as AdminTab,
          label: 'Gradebook Audit',
          icon: FileSpreadsheet,
          badge: `${grades.length}`,
          badgeColor: 'bg-slate-100 text-slate-600 border border-slate-200',
        },
        {
          id: 'biometrics' as AdminTab,
          label: 'Biometrics Terminal',
          icon: Fingerprint,
          badge: `${biometricLogs.length}`,
          badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        },
        {
          id: 'skills' as AdminTab,
          label: 'Skill Milestones',
          icon: Award,
          badge: `${skills.length}`,
          badgeColor: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
        },
      ],
    },
    {
      group: 'System & Legal',
      items: [
        {
          id: 'notifications' as AdminTab,
          label: 'Notice Broadcaster',
          icon: Bell,
          badge: `${notifications.length}`,
          badgeColor: 'bg-blue-50 text-blue-700 border border-blue-200',
        },
        {
          id: 'statutory' as AdminTab,
          label: 'Statutory & Trust Audit',
          icon: ShieldCheck,
          badge: 'Verified',
          badgeColor: 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold',
        },
      ],
    },
  ];

  const currentNav =
    navSections.flatMap((s) => s.items).find((i) => i.id === activeTab) || {
      id: 'overview' as AdminTab,
      label: 'Command Overview',
      icon: Building2,
    };
  const CurrentIcon = currentNav.icon;

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex font-sans overflow-hidden">
      {/* Mobile Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden animate-in fade-in transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* SUPER ADMIN SIDEBAR (Responsive Desktop + Mobile Drawer) */}
      <aside
        className={`fixed md:sticky top-0 inset-y-0 left-0 z-50 md:z-30 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 select-none h-screen shrink-0 shadow-xl md:shadow-none ${
          isMobileSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'
        } ${isSidebarCollapsed ? 'md:w-20' : 'md:w-72'}`}
      >
        {/* Sidebar Apex Brand Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0 bg-white">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-white p-1 border border-amber-500/30 shadow-xs flex items-center justify-center shrink-0">
              <img
                src="/logo.png"
                alt="SSN Logo"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://smartschool.asomweb.com/ssn/logo.png';
                }}
                className="w-full h-full object-contain"
              />
            </div>
            {!isSidebarCollapsed && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold tracking-tight text-slate-900 font-display truncate">
                    SSN Gohpur
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300 uppercase">
                    Admin
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 truncate">
                  School Admin Portal
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Desktop Collapse Toggle */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden md:flex p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Administrator Profile Card */}
        {!isSidebarCollapsed ? (
          <div className="p-3 mx-3 my-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-900 font-black text-xs flex items-center justify-center ring-2 ring-amber-400/40">
                  {currentUser?.email?.[0]?.toUpperCase() || 'A'}
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white absolute -bottom-0.5 -right-0.5 animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    School Administrator
                  </span>
                  <span className="text-[9px] font-mono font-bold text-emerald-600">
                    LIVE
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono truncate">
                  {currentUser?.email || 'Administrator'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-3 flex justify-center border-b border-slate-200 shrink-0">
            <div className="relative group" title={`Admin: ${currentUser?.email || 'Administrator'}`}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-900 font-black text-sm flex items-center justify-center ring-2 ring-amber-400/40">
                {currentUser?.email?.[0]?.toUpperCase() || 'A'}
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white absolute -bottom-0.5 -right-0.5" />
            </div>
          </div>
        )}

        {/* Navigation Categories & Items */}
        <div className="flex-1 overflow-y-auto px-2.5 py-2 space-y-4">
          {navSections.map((sec) => (
            <div key={sec.group} className="space-y-1">
              {!isSidebarCollapsed && (
                <div className="px-3 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                  {sec.group}
                </div>
              )}
              {sec.items.map((item) => {
                const ItemIcon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileSidebarOpen(false);
                    }}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-50 text-amber-900 border border-amber-200 font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent font-medium'
                    } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
                  >
                    <ItemIcon
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isActive ? 'text-amber-600 scale-110' : 'text-slate-500'
                      }`}
                    />
                    {!isSidebarCollapsed && (
                      <>
                        <span className="truncate flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium shrink-0 ${item.badgeColor}`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Quick Circular Action */}
          {!isSidebarCollapsed && (
            <div className="pt-2 px-1">
              <button
                type="button"
                onClick={() => setIsBroadcastingNotice(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Broadcast Notice</span>
              </button>
            </div>
          )}

        </div>

        {/* Sidebar Footer Actions */}
        <div className="p-3 border-t border-slate-200 shrink-0 bg-white space-y-2">
          {/* Return to School Portal */}
          <button
            type="button"
            onClick={onBackToPublicPortal}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-colors cursor-pointer ${
              isSidebarCollapsed ? 'justify-center px-2' : ''
            }`}
            title="Return to Public School Portal"
          >
            <ArrowLeft className="w-4 h-4 shrink-0 text-slate-500" />
            {!isSidebarCollapsed && <span>Return to School Portal</span>}
          </button>

          {/* Sign Out Action */}
          <button
            type="button"
            onClick={onSignOut}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer ${
              isSidebarCollapsed ? 'justify-center px-2' : ''
            }`}
            title="Sign Out of Apex Console"
          >
            <LogOut className="w-4 h-4 shrink-0 text-rose-600" />
            {!isSidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* MAIN WORKSPACE AREA (Smart Layout: Sticky Header + Scrollable View) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-slate-50">
        {/* Top Header / Breadcrumb & Actions Bar */}
        <header className="bg-white/95 backdrop-blur border-b border-slate-200 px-4 sm:px-6 py-3 shrink-0 flex items-center justify-between gap-3 z-20">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Expand / Collapse toggle shortcut */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden md:flex p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>

            {/* Breadcrumb Info */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="hidden sm:inline text-xs font-medium text-slate-500">
                Super Admin
              </span>
              <span className="hidden sm:inline text-slate-400">/</span>
              <div className="flex items-center gap-2">
                <CurrentIcon className="w-4 h-4 text-amber-600 shrink-0" />
                <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">
                  {currentNav.label}
                </h1>
              </div>
            </div>
          </div>

          {/* Right Header Quick Tools */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Live Firestore Sync Status */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Firestore Sync</span>
            </div>

            {/* Fast Broadcast Notice Button */}
            <button
              type="button"
              onClick={() => setIsBroadcastingNotice(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Broadcast</span>
            </button>

            {/* Public Portal Shortcut */}
            <button
              type="button"
              onClick={onBackToPublicPortal}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
              title="Return to Public School Portal"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">School Portal</span>
            </button>

            <PWAInstallButton />

            {/* Topbar Sign Out Button */}
            <button
              type="button"
              onClick={onSignOut}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>


        {/* Main Admin Workspace Area (Scrollable) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Loading Indicator */}
        {isLoadingData && (
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2.5 shadow-xs">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            <span className="font-medium">Synchronizing live institutional records with Firebase Firestore...</span>
          </div>
        )}

        {/* 1. COMMAND OVERVIEW (Clean White Institutional Super Admin Console) */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in">
            {/* 1. SMART STUDENT DEMOGRAPHICS & GENDER PARITY SUITE */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                    Institutional Scholar Demographics &amp; Gender Parity (Session 2026–27)
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  Affiliation: ASSEB 035371 · Bapadev Kshetra, Gohpur
                </span>
              </div>

              {/* 4 Smart Demographic Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* CARD 1: TOTAL ENROLLED SCHOLARS */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Total Enrolled Students
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-3xl font-extrabold font-display text-slate-900 tracking-tight">
                      {studentDemographics.totalStudentsCount}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
                      <span className="px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200 inline-flex items-center gap-1 font-mono">
                        👦 {studentDemographics.totalBoysCount} Boys
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 inline-flex items-center gap-1 font-mono">
                        👧 {studentDemographics.totalGirlsCount} Girls
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Class VI to XII &amp; 4-Year B.A. Honours
                    </p>
                  </div>
                </div>

                {/* CARD 2: TOTAL BOYS (MALE SCHOLARS) */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Total Boys (Male)
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-700">
                      <UserIcon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between">
                      <div className="text-3xl font-extrabold font-display text-slate-900 tracking-tight">
                        {studentDemographics.totalBoysCount}
                      </div>
                      <span className="text-xs font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                        {studentDemographics.overallBoysPct}% Ratio
                      </span>
                    </div>
                    {/* Mini Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-cyan-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${studentDemographics.overallBoysPct}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      Resident in Brahmaputra Boys Hostel (Blocks A &amp; B)
                    </p>
                  </div>
                </div>

                {/* CARD 3: TOTAL GIRLS (FEMALE SCHOLARS) */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Total Girls (Female)
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                      <UserIcon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between">
                      <div className="text-3xl font-extrabold font-display text-slate-900 tracking-tight">
                        {studentDemographics.totalGirlsCount}
                      </div>
                      <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        {studentDemographics.overallGirlsPct}% Ratio
                      </span>
                    </div>
                    {/* Mini Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${studentDemographics.overallGirlsPct}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      Resident in Mahila Chhatriniwas (Padmini Wing)
                    </p>
                  </div>
                </div>

                {/* CARD 4: GENDER BALANCE & PARITY INDEX */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Gender Balance Ratio
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                      <Sparkles className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-2xl font-extrabold font-mono text-slate-900 tracking-tight">
                      {studentDemographics.overallBoysPct}% <span className="text-slate-400 font-normal">:</span> {studentDemographics.overallGirlsPct}%
                    </div>
                    {/* Dual-Tone Split Bar */}
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                      <div
                        className="bg-cyan-600 h-full transition-all duration-500"
                        style={{ width: `${studentDemographics.overallBoysPct}%` }}
                        title={`Boys: ${studentDemographics.overallBoysPct}%`}
                      />
                      <div
                        className="bg-rose-500 h-full transition-all duration-500"
                        style={{ width: `${studentDemographics.overallGirlsPct}%` }}
                        title={`Girls: ${studentDemographics.overallGirlsPct}%`}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-emerald-700">Healthy Co-Ed Balance</span>
                      <span className="font-mono text-slate-500">
                        {studentDemographics.totalBoysCount}B : {studentDemographics.totalGirlsCount}G
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECONDARY ROW: STAFF, ADMISSIONS & FEES */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Faculty & Staff */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Faculty &amp; Educators</span>
                    <div className="text-2xl font-bold font-display text-slate-900">{totalTeachers} Active</div>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">Brahmaputra Academic Block</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                {/* Admissions Ledger */}
                <div
                  onClick={() => setActiveTab('admissions')}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer flex items-center justify-between group"
                  title="Click to open Admissions Desk"
                >
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider group-hover:text-amber-800 transition-colors">Admissions Desk</span>
                    <div className="text-2xl font-bold font-display text-slate-900">
                      {enrolledAdmissions} <span className="text-xs font-normal text-slate-400">/ {admissions.length} applications</span>
                    </div>
                    <span className="text-[10px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-md">
                      {pendingAdmissions} Pending Verifications &rarr;
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>

                {/* Fee Transactions & Realized Revenue */}
                <div
                  onClick={() => setActiveTab('fee_transactions')}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex items-center justify-between group"
                  title="Click to open Fee Transactions & Ledger"
                >
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider group-hover:text-emerald-700 transition-colors">Fee Ledger</span>
                    <div className="text-2xl font-bold font-display text-slate-900 font-mono">
                      ₹{payments.reduce((s, p) => s + (p.amountPaid || 0), 0).toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                      {payments.length} Registered Txns &rarr;
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Receipt className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* 2. CLASS-WISE STUDENT DEMOGRAPHICS & GENDER MATRIX SUITE */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <h4 className="text-sm font-bold text-slate-900">
                        Class-Wise Student Strength &amp; Gender Demographics
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500">
                      Live demographic breakdown of Boys and Girls across Class VI–XII and 4-Year B.A. Honours with parity distribution.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Stage Filter */}
                    <div className="flex items-center p-0.5 rounded-xl bg-slate-100 text-xs">
                      {[
                        { id: 'all', label: 'All Classes' },
                        { id: 'middle', label: 'Middle (VI–VIII)' },
                        { id: 'secondary', label: 'Secondary (IX–X)' },
                        { id: 'hs', label: 'Higher Sec (XI–XII)' },
                        { id: 'degree', label: 'B.A. Honours' },
                      ].map((stg) => (
                        <button
                          key={stg.id}
                          type="button"
                          onClick={() => setDemographicsStageFilter(stg.id as any)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                            demographicsStageFilter === stg.id
                              ? 'bg-white text-slate-900 shadow-2xs font-bold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {stg.label}
                        </button>
                      ))}
                    </div>

                    {/* View Switcher: Cards vs Table */}
                    <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                      <button
                        type="button"
                        onClick={() => setClassDemographicsView('cards')}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          classDemographicsView === 'cards' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                        }`}
                        title="Smart Cards View"
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setClassDemographicsView('table')}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          classDemographicsView === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                        }`}
                        title="Matrix Table View"
                      >
                        <TableIcon className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Print Demographics Button */}
                    <button
                      type="button"
                      onClick={() =>
                        printDocument({
                          title: `SSN_Classwise_Student_Gender_Demographics_${new Date().toISOString().slice(0, 10)}`,
                          orientation: 'landscape',
                        })
                      }
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      title="Print Official Demographics Sheet"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>Print Sheet</span>
                    </button>
                  </div>
                </div>

                {/* 2A. SMART CARDS VIEW */}
                {classDemographicsView === 'cards' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
                    {studentDemographics.classBreakdown
                      .filter((cls) => demographicsStageFilter === 'all' || cls.stage === demographicsStageFilter)
                      .map((cls) => (
                        <div
                          key={cls.id}
                          className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-blue-300 hover:bg-white hover:shadow-xs transition-all space-y-3"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <h5 className="font-bold text-slate-900 text-sm leading-tight">{cls.name}</h5>
                              <span className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">
                                {cls.stageLabel}
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-900 font-mono text-[11px] font-bold border border-blue-200 shrink-0">
                              {cls.total} Scholars
                            </span>
                          </div>

                          {/* Boys and Girls Split Badges */}
                          <div className="grid grid-cols-2 gap-1.5 text-xs">
                            <div className="p-2 rounded-lg bg-cyan-50/70 border border-cyan-200/80">
                              <span className="text-[10px] font-bold uppercase text-cyan-800 block">Boys</span>
                              <span className="font-mono font-black text-cyan-950 text-sm">{cls.boys}</span>
                              <span className="text-[10px] text-cyan-700 block font-mono">({cls.boysPct}%)</span>
                            </div>

                            <div className="p-2 rounded-lg bg-rose-50/70 border border-rose-200/80">
                              <span className="text-[10px] font-bold uppercase text-rose-800 block">Girls</span>
                              <span className="font-mono font-black text-rose-950 text-sm">{cls.girls}</span>
                              <span className="text-[10px] text-rose-700 block font-mono">({cls.girlsPct}%)</span>
                            </div>
                          </div>

                          {/* Two-Tone Visual Split Bar */}
                          <div className="space-y-1">
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                              <div
                                className="bg-cyan-600 h-full transition-all"
                                style={{ width: `${cls.boysPct}%` }}
                                title={`Boys: ${cls.boysPct}%`}
                              />
                              <div
                                className="bg-rose-500 h-full transition-all"
                                style={{ width: `${cls.girlsPct}%` }}
                                title={`Girls: ${cls.girlsPct}%`}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                              <span>{cls.boysPct}% Boys</span>
                              <span>{cls.girlsPct}% Girls</span>
                            </div>
                          </div>

                          {/* Stream Footer */}
                          <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 truncate">
                            {cls.stream}
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {/* 2B. DETAILED MATRIX TABLE VIEW */}
                {classDemographicsView === 'table' && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs text-slate-600 border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="p-3">Class Level</th>
                          <th className="p-3">Academic Stage</th>
                          <th className="p-3">Curriculum / Stream</th>
                          <th className="p-3 text-center">Total Scholars</th>
                          <th className="p-3 text-center text-cyan-800">Boys (👦)</th>
                          <th className="p-3 text-center text-rose-700">Girls (👧)</th>
                          <th className="p-3 text-center">Gender Split Bar</th>
                          <th className="p-3 text-right">Ratio (B : G)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {studentDemographics.classBreakdown
                          .filter((cls) => demographicsStageFilter === 'all' || cls.stage === demographicsStageFilter)
                          .map((cls) => (
                            <tr key={cls.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="p-3 font-bold text-slate-900 whitespace-nowrap">{cls.name}</td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                                  {cls.stageLabel}
                                </span>
                              </td>
                              <td className="p-3 text-slate-600">{cls.stream}</td>
                              <td className="p-3 text-center font-mono font-bold text-slate-900 text-sm">
                                {cls.total}
                              </td>
                              <td className="p-3 text-center font-mono font-bold text-cyan-800">
                                {cls.boys} ({cls.boysPct}%)
                              </td>
                              <td className="p-3 text-center font-mono font-bold text-rose-700">
                                {cls.girls} ({cls.girlsPct}%)
                              </td>
                              <td className="p-3">
                                <div className="w-28 mx-auto bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                                  <div
                                    className="bg-cyan-600 h-full"
                                    style={{ width: `${cls.boysPct}%` }}
                                    title={`Boys: ${cls.boysPct}%`}
                                  />
                                  <div
                                    className="bg-rose-500 h-full"
                                    style={{ width: `${cls.girlsPct}%` }}
                                    title={`Girls: ${cls.girlsPct}%`}
                                  />
                                </div>
                              </td>
                              <td className="p-3 text-right font-mono font-bold text-slate-800">
                                {cls.boys} : {cls.girls}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                      <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-mono text-xs font-bold text-slate-900">
                        <tr>
                          <td colSpan={3} className="p-3 uppercase font-sans text-right">
                            Composite Enrollment Demographics:
                          </td>
                          <td className="p-3 text-center text-sm font-black text-blue-900">
                            {studentDemographics.totalStudentsCount}
                          </td>
                          <td className="p-3 text-center font-black text-cyan-800">
                            {studentDemographics.totalBoysCount} ({studentDemographics.overallBoysPct}%)
                          </td>
                          <td className="p-3 text-center font-black text-rose-700">
                            {studentDemographics.totalGirlsCount} ({studentDemographics.overallGirlsPct}%)
                          </td>
                          <td colSpan={2} className="p-3 text-right font-sans text-[11px] text-emerald-800">
                            Overall Parity: {studentDemographics.overallBoysPct}% Boys : {studentDemographics.overallGirlsPct}% Girls
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Admin Actions & Trust Authority Notice - Clean White Container */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-amber-600" />
                      School Master Administrative Protocol &amp; Command Center
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                    Operated under <span className="font-semibold text-slate-900">SAILAJA SANKKALP TRUST</span> governance · <span className="font-mono text-slate-700">ASSEB Council Code: 035371</span>. All biometric attendance punches, faculty gradebooks, and admission ledgers are cryptographically authenticated and backed up to Firebase Firestore.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBroadcastingNotice(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <Bell className="w-4 h-4 text-slate-950" />
                  Broadcast Notice
                </button>
              </div>

              {/* Quick Navigation Tiles - Clean Light Theme */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('admissions')}
                  className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200 text-left transition-all hover:shadow-xs group cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                      <FileText className="w-4 h-4" />
                    </div>
                    {pendingAdmissions > 0 && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-md">
                        {pendingAdmissions} New
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors">Admissions Desk</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Review &amp; issue student IDs</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('hr_management')}
                  className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200 text-left transition-all hover:shadow-xs group cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded-md">
                      {hrStaff.length} Staff
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition-colors">HR &amp; Payroll</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Staff roster, salary &amp; leaves</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('documents_settings')}
                  className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200 text-left transition-all hover:shadow-xs group cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                      <IdCard className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-md">
                      Print/PDF
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">Docs &amp; ID Cards</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Certificates, marksheet, slips</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('fee_structures')}
                  className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200 text-left transition-all hover:shadow-xs group cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded-md">
                      {feeStructures.length} Classes
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">Fee Structures</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Tuition &amp; hostel matrix</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('wall_of_fame')}
                  className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200 text-left transition-all hover:shadow-xs group cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded-md">
                      {wallOfFame.length} Stars
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors">Wall of Fame</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Honor roll &amp; state rankers</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('biometrics')}
                  className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200 text-left transition-all hover:shadow-xs group cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                      <Fingerprint className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-md">
                      Optical Sync
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">Biometrics Terminal</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Punch logs &amp; attendance</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Admissions & Recent Biometrics Dual Card - Clean White Style */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Admissions */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-600" />
                    Latest Admission Applications
                  </h4>
                  <button
                    type="button"
                    onClick={() => setActiveTab('admissions')}
                    className="text-xs font-semibold text-amber-700 hover:text-amber-800 hover:underline"
                  >
                    View All ({admissions.length})
                  </button>
                </div>
                <div className="space-y-2.5">
                  {admissions.slice(0, 5).map((adm) => (
                    <div
                      key={adm.id}
                      className="p-3.5 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/80 flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-900">{adm.applicantName}</div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                          <span className="font-bold text-slate-700">{adm.applicationNo}</span>
                          <span>·</span>
                          <span>{adm.applyingForClass}</span>
                          {adm.stream && <span>({adm.stream})</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                            adm.applicationStatus === 'enrolled'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {adm.applicationStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                  {admissions.length === 0 && (
                    <div className="text-xs text-slate-500 py-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No applications logged yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Biometric Terminal Activity */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-emerald-600" />
                    Biometric Optical Scanner Feeds
                  </h4>
                  <button
                    type="button"
                    onClick={() => setActiveTab('biometrics')}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                  >
                    View All ({biometricLogs.length})
                  </button>
                </div>
                <div className="space-y-2.5">
                  {biometricLogs.slice(0, 5).map((b) => (
                    <div
                      key={b.id}
                      className="p-3.5 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/80 flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-900">{b.staffName}</div>
                        <div className="text-[11px] text-slate-500">
                          {b.designation} · <span className="font-medium text-slate-700">{b.department}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-0.5">
                        <span className="font-mono text-emerald-700 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {b.punchTimeLabel}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {b.punchType} · {b.confidenceScore}% verified
                        </div>
                      </div>
                    </div>
                  ))}
                  {biometricLogs.length === 0 && (
                    <div className="text-xs text-slate-500 py-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No biometric punches recorded yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Institutional Compliance & Governance Seal Bar - Clean White */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold text-sm">
                  SSN
                </div>
                <div>
                  <div className="font-bold text-slate-900">Sankardev Shiksha Niketan, Gohpur</div>
                  <div className="text-[11px] text-slate-500 font-mono">Bapadev Kshetra, Solengi · Affiliation: Sonitpur-2023/FR-25/10 · UDISE: 18110300101</div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-medium">
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  Academic Session: 2026–27
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Statutory Audits Verified
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 1A-2. STUDENT FEE TRANSACTIONS, AUTO-REPORTS & PRINTING TERMINAL */}
        {activeTab === 'fee_transactions' && (
          <StudentFeeTransactionManager
            payments={payments}
            users={users}
            admissions={admissions}
            feeStructures={feeStructures}
            schoolSettings={schoolSettings}
            onAddPaymentReceipt={onAddPaymentReceipt}
            onUpdatePaymentReceipt={onUpdatePaymentReceipt}
            onDeletePaymentReceipt={onDeletePaymentReceipt}
          />
        )}

        {/* 1B. FEE STRUCTURE DIRECTORY (REAL-TIME CLOUD MANAGEMENT SYSTEM) */}
        {activeTab === 'fee_structures' && (
          <FeeStructureDirectoryManager
            feeStructures={feeStructures}
            onAddFeeStructure={onAddFeeStructure}
            onUpdateFeeStructure={onUpdateFeeStructure}
            onDeleteFeeStructure={onDeleteFeeStructure}
            onNavigateToStudentAdmission={() => setActiveTab('student_admission')}
          />
        )}

        {/* 1C. DEPARTMENT DIRECTORY MANAGER (REAL-TIME CRUD) */}
        {activeTab === 'departments' && (
          <DepartmentDirectoryManager
            departments={departments}
            onAddDepartment={onAddDepartment}
            onUpdateDepartment={onUpdateDepartment}
            onDeleteDepartment={onDeleteDepartment}
          />
        )}

        {/* 1D. WALL OF FAME & HONOR ROLL MANAGER */}
        {activeTab === 'wall_of_fame' && (
          <WallOfFameDirectoryManager
            wallOfFame={wallOfFame}
            onAddWallOfFame={onAddWallOfFame}
            onUpdateWallOfFame={onUpdateWallOfFame}
            onDeleteWallOfFame={onDeleteWallOfFame}
          />
        )}

        {/* 1E. HR, STAFF DIRECTORY, PAYROLL & LEAVE MANAGEMENT */}
        {activeTab === 'hr_management' && (
          <HrManagementDirectory
            hrStaff={hrStaff}
            hrPayroll={hrPayroll}
            hrLeaves={hrLeaves}
            schoolSettings={schoolSettings}
            onAddStaff={onAddStaff}
            onUpdateStaff={onUpdateStaff}
            onDeleteStaff={onDeleteStaff}
            onAddPayroll={onAddPayroll}
            onUpdatePayroll={onUpdatePayroll}
            onDeletePayroll={onDeletePayroll}
            onAddLeave={onAddLeave}
            onUpdateLeave={onUpdateLeave}
            onDeleteLeave={onDeleteLeave}
          />
        )}

        {/* 1F. INSTITUTIONAL DOCUMENTS, CERTIFICATES, MARKSHEETS, PAYMENT SLIPS & GLOBAL SETTINGS */}
        {activeTab === 'documents_settings' && (
          <InstitutionalDocumentManager
            students={users.filter((u) => u.role === 'student')}
            grades={grades}
            feeStructures={feeStructures}
            certificates={certificates}
            payments={payments}
            schoolSettings={schoolSettings}
            onAddCertificate={onAddCertificate}
            onUpdateCertificate={onUpdateCertificate}
            onAddPaymentReceipt={onAddPaymentReceipt}
            onUpdateSchoolSettings={onUpdateSchoolSettings}
          />
        )}

        {/* STUDENT ADMISSION FORM (RESIDENTIAL SCHOOL ENROLLMENT) */}
        {activeTab === 'student_admission' && (
          <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-amber-600" />
                    New Student Admission &amp; Residency Registration
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Sankardev Shishu Vidya Niketan, Solengi is a compulsory residency institution. Register scholar profile, class enrollment, and hostel dorm allocation.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('admissions')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  View Admissions List
                </button>
              </div>

              <form onSubmit={handleStudentAdmissionSubmit} className="space-y-5">
                {/* Student Photo Upload & Preview Section */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    Student Photo *
                  </label>
                  <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                    <div className="flex-1 space-y-2.5 w-full">
                      <div className="inline-flex p-1 rounded-lg bg-slate-200/80 border border-slate-300 gap-1">
                        <button
                          type="button"
                          onClick={() => setStudentAdmissionForm({ ...studentAdmissionForm, photoType: 'url' })}
                          className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                            studentAdmissionForm.photoType === 'url' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          URL
                        </button>
                        <button
                          type="button"
                          onClick={() => setStudentAdmissionForm({ ...studentAdmissionForm, photoType: 'file' })}
                          className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                            studentAdmissionForm.photoType === 'file' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          File
                        </button>
                      </div>

                      {studentAdmissionForm.photoType === 'url' ? (
                        <div>
                          <input
                            type="url"
                            value={studentAdmissionForm.studentPhoto}
                            onChange={(e) => setStudentAdmissionForm({ ...studentAdmissionForm, studentPhoto: e.target.value })}
                            placeholder="Paste image link here..."
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-amber-500 font-mono"
                          />
                          <p className="text-[10px] text-slate-500 mt-1">JPG/PNG/WEBP · Max size: 2MB</p>
                        </div>
                      ) : (
                        <div>
                          <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-slate-400 bg-white hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700">
                            <Upload className="w-4 h-4 text-slate-500" />
                            <span>Choose image file (Max size: 2MB)</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.size > 2 * 1024 * 1024) {
                                    alert('File size exceeds 2MB limit.');
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onload = (uploadEvent) => {
                                    setStudentAdmissionForm({
                                      ...studentAdmissionForm,
                                      studentPhoto: (uploadEvent.target?.result as string) || '',
                                    });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                          <p className="text-[10px] text-slate-500 mt-1">JPG/PNG/WEBP · Max size: 2MB</p>
                        </div>
                      )}
                    </div>

                    <div className="w-24 h-28 rounded-lg border border-slate-300 bg-white overflow-hidden flex flex-col items-center justify-center relative shrink-0 shadow-2xs">
                      {studentAdmissionForm.studentPhoto ? (
                        <>
                          <img src={studentAdmissionForm.studentPhoto} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setStudentAdmissionForm({ ...studentAdmissionForm, studentPhoto: '' })}
                            className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white p-1 rounded-full text-[10px]"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <div className="text-center p-2 text-slate-400 flex flex-col items-center justify-center">
                          <Camera className="w-5 h-5 mb-1 text-slate-300" />
                          <span className="text-[10px] font-semibold text-slate-400">No Preview</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Portal Login Credentials Section */}
                <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 shadow-sm border border-slate-800">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                    <Key className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-display font-bold uppercase tracking-wider text-white">
                      Portal Login Credentials (Auto-Sync with User Master)
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Login Username (Email)</label>
                      <div className="px-3 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 font-mono text-white flex items-center min-h-[36px]">
                        {studentAdmissionForm.email ? (
                          <span className="text-emerald-400 font-semibold">{studentAdmissionForm.email}</span>
                        ) : (
                          <span className="text-slate-400 italic">Waiting for email input...</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Set Portal Password *</label>
                      <div className="relative">
                        <input
                          type={studentAdmissionForm.showPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={studentAdmissionForm.portalPassword}
                          onChange={(e) => setStudentAdmissionForm({ ...studentAdmissionForm, portalPassword: e.target.value })}
                          placeholder="Min 6 characters"
                          className="w-full px-3 py-2 pr-9 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setStudentAdmissionForm({ ...studentAdmissionForm, showPassword: !studentAdmissionForm.showPassword })}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          {studentAdmissionForm.showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Scholar Full Name *</label>
                    <input
                      type="text"
                      required
                      value={studentAdmissionForm.applicantName}
                      onChange={(e) => setStudentAdmissionForm({ ...studentAdmissionForm, applicantName: e.target.value })}
                      placeholder="e.g. Priyam Saikia"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
                    <select
                      value={studentAdmissionForm.gender}
                      onChange={(e) => {
                        const newGender = e.target.value as 'Male' | 'Female';
                        setStudentAdmissionForm({
                          ...studentAdmissionForm,
                          gender: newGender,
                          hostelBlock: newGender === 'Female' ? 'Kaziranga Girls Hostel - Block A' : 'Brahmaputra Boys Hostel - Block A',
                        });
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 font-medium cursor-pointer"
                    >
                      <option value="Male">👦 Boy (Male)</option>
                      <option value="Female">👧 Girl (Female)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Applying For Class *</label>
                    <select
                      value={studentAdmissionForm.applyingForClass}
                      onChange={(e) => {
                        const val = e.target.value;
                        const match = feeStructures.find(
                          (f) =>
                            f.className.toLowerCase() === val.toLowerCase() ||
                            val.toLowerCase().includes(f.className.toLowerCase())
                        );
                        setStudentAdmissionForm({
                          ...studentAdmissionForm,
                          applyingForClass: val,
                          stream: match ? match.stream : studentAdmissionForm.stream,
                          feeAmount: match ? match.totalAnnualFee : studentAdmissionForm.feeAmount,
                        });
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 font-medium cursor-pointer"
                    >
                      {feeStructures.length > 0 ? (
                        feeStructures.map((f) => (
                          <option key={f.id} value={f.className}>
                            {f.className} ({f.stream}) — ₹{f.totalAnnualFee.toLocaleString('en-IN')}/yr
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="Class VI">Class VI</option>
                          <option value="Class VII">Class VII</option>
                          <option value="Class VIII">Class VIII</option>
                          <option value="Class IX">Class IX</option>
                          <option value="Class X">Class X</option>
                          <option value="Class XI (Science)">Class XI (Science Stream)</option>
                          <option value="Class XII (Science)">Class XII (Science Stream)</option>
                          <option value="Class XI (Arts)">Class XI (Arts Stream)</option>
                          <option value="Class XII (Arts)">Class XII (Arts Stream)</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Academic Stream</label>
                    <input
                      type="text"
                      value={studentAdmissionForm.stream}
                      onChange={(e) => setStudentAdmissionForm({ ...studentAdmissionForm, stream: e.target.value })}
                      placeholder="e.g. Science / General Foundation"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Guardian / Parent Name *</label>
                    <input
                      type="text"
                      required
                      value={studentAdmissionForm.guardianName}
                      onChange={(e) => setStudentAdmissionForm({ ...studentAdmissionForm, guardianName: e.target.value })}
                      placeholder="e.g. Bhaben Saikia"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={studentAdmissionForm.contactPhone}
                      onChange={(e) => setStudentAdmissionForm({ ...studentAdmissionForm, contactPhone: e.target.value })}
                      placeholder="+91 9954656161"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Portal Email Address</label>
                    <input
                      type="email"
                      value={studentAdmissionForm.email}
                      onChange={(e) => setStudentAdmissionForm({ ...studentAdmissionForm, email: e.target.value })}
                      placeholder="scholar@ssngohpur.ac.in"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Residential Address *</label>
                    <input
                      type="text"
                      required
                      value={studentAdmissionForm.address}
                      onChange={(e) => setStudentAdmissionForm({ ...studentAdmissionForm, address: e.target.value })}
                      placeholder="Village / Town, Post, District, PIN"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Previous School Attended</label>
                    <input
                      type="text"
                      value={studentAdmissionForm.previousSchool}
                      onChange={(e) => setStudentAdmissionForm({ ...studentAdmissionForm, previousSchool: e.target.value })}
                      placeholder="Previous Institution Name &amp; Board"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">Annual Tuition &amp; Boarding Fee (₹)</label>
                      <button
                        type="button"
                        onClick={() => setActiveTab('fee_structures')}
                        className="text-[10px] text-emerald-700 hover:underline flex items-center gap-0.5 cursor-pointer font-semibold"
                      >
                        <Receipt className="w-3 h-3" />
                        Fee Directory
                      </button>
                    </div>
                    <input
                      type="number"
                      value={studentAdmissionForm.feeAmount}
                      onChange={(e) => setStudentAdmissionForm({ ...studentAdmissionForm, feeAmount: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 font-mono font-bold"
                    />
                    <div className="text-[10px] text-slate-500 mt-1">
                      Auto-synced with real-time Fee Directory (Includes compulsory hostel &amp; Satvic mess).
                    </div>
                  </div>
                </div>

                {/* COMPULSORY RESIDENCY / HOSTEL ALLOCATION SECTION */}
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-700" />
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                      Compulsory Residency &amp; Hostel Allocation
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Hostel Block / Dormitory</label>
                      <select
                        value={studentAdmissionForm.hostelBlock}
                        onChange={(e) => setStudentAdmissionForm({ ...studentAdmissionForm, hostelBlock: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                      >
                        <option value="Brahmaputra Boys Hostel - Block A">Brahmaputra Boys Hostel - Block A</option>
                        <option value="Luit Boys Hostel - Block B">Luit Boys Hostel - Block B</option>
                        <option value="Kaziranga Girls Hostel - Block A">Kaziranga Girls Hostel - Block A</option>
                        <option value="Manas Girls Hostel - Block B">Manas Girls Hostel - Block B</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Room Assignment</label>
                      <input
                        type="text"
                        value={studentAdmissionForm.roomNumber}
                        onChange={(e) => setStudentAdmissionForm({ ...studentAdmissionForm, roomNumber: e.target.value })}
                        placeholder="e.g. Room 102"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Mess &amp; Dietary Preference</label>
                      <select
                        value={studentAdmissionForm.messPreference}
                        onChange={(e) => setStudentAdmissionForm({ ...studentAdmissionForm, messPreference: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                      >
                        <option value="Vegetarian">Vegetarian (Pure Satvic)</option>
                        <option value="Non-Vegetarian">Non-Vegetarian (Standard Mess)</option>
                        <option value="Special Dietary">Special Dietary Requirement</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveTab('admissions')}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingAdmissionForm}
                    className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center gap-2"
                  >
                    {isSubmittingAdmissionForm && <RefreshCw className="w-4 h-4 animate-spin" />}
                    <span>Submit &amp; Register Scholar</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. ADMISSIONS DESK */}
        {activeTab === 'admissions' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={admissionSearch}
                    onChange={(e) => setAdmissionSearch(e.target.value)}
                    placeholder="Search applicant or app #..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <select
                  value={admissionFilter}
                  onChange={(e) => setAdmissionFilter(e.target.value)}
                  className="py-1.5 px-3 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="verified">Verified</option>
                  <option value="enrolled">Enrolled</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="text-xs text-slate-400 font-mono">
                Showing {filteredAdmissions.length} of {admissions.length} Applications
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-medium uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">App No.</th>
                      <th className="py-3 px-4">Applicant</th>
                      <th className="py-3 px-4">Class &amp; Stream</th>
                      <th className="py-3 px-4">Guardian &amp; Contact</th>
                      <th className="py-3 px-4">Tuition Fee</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {filteredAdmissions.map((adm) => (
                      <tr key={adm.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-amber-300">{adm.applicationNo}</td>
                        <td className="py-3 px-4 font-medium text-white">{adm.applicantName}</td>
                        <td className="py-3 px-4 text-slate-300">
                          {adm.applyingForClass}
                          <span className="block text-[10px] text-slate-500">{adm.stream}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div>{adm.guardianName}</div>
                          <span className="font-mono text-[10px] text-slate-400">{adm.contactPhone}</span>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          ₹{adm.feeAmount.toLocaleString('en-IN')}
                          <span
                            className={`block text-[10px] font-semibold ${
                              adm.feeStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'
                            }`}
                          >
                            {adm.feeStatus.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              adm.applicationStatus === 'enrolled'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : adm.applicationStatus === 'rejected'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}
                          >
                            {adm.applicationStatus.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {adm.applicationStatus === 'enrolled' ? (
                              <button
                                type="button"
                                onClick={() => setViewingCredentialAdmission(adm)}
                                className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                                title="View and print official student portal credentials"
                              >
                                <Key className="w-3 h-3" />
                                <span>Credentials Slip</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateAdmissionStatus &&
                                  onUpdateAdmissionStatus(adm.id, 'enrolled', 'paid')
                                }
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                              >
                                Enroll &amp; Confirm
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setSelectedAdmission(adm)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors cursor-pointer"
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredAdmissions.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          No admission records matching current criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. GRADEBOOK AUDIT */}
        {activeTab === 'grades' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={gradeSearch}
                    onChange={(e) => setGradeSearch(e.target.value)}
                    placeholder="Search student, subject..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
                <select
                  value={gradeTermFilter}
                  onChange={(e) => setGradeTermFilter(e.target.value)}
                  className="py-1.5 px-3 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="all">All Exam Terms</option>
                  <option value="Unit Test I">Unit Test I</option>
                  <option value="Half Yearly">Half Yearly</option>
                  <option value="Unit Test II">Unit Test II</option>
                  <option value="Annual Final">Annual Final</option>
                  <option value="ASSEB Mock Board">ASSEB Mock Board</option>
                </select>
              </div>

              <div className="text-xs text-slate-400 font-mono">
                Showing {filteredGrades.length} of {grades.length} Grades
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-medium uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Class</th>
                      <th className="py-3 px-4">Exam Term</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Marks</th>
                      <th className="py-3 px-4">Grade &amp; GPA</th>
                      <th className="py-3 px-4">Division</th>
                      <th className="py-3 px-4">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {filteredGrades.map((g) => (
                      <tr key={g.id} className="hover:bg-slate-850/50">
                        <td className="py-3 px-4 font-semibold text-white">
                          {g.studentName}
                          <span className="block text-[10px] font-mono text-slate-400">{g.studentId}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{g.className}</td>
                        <td className="py-3 px-4 font-medium text-amber-300">{g.examTerm}</td>
                        <td className="py-3 px-4 text-slate-200">{g.subject}</td>
                        <td className="py-3 px-4 font-mono font-bold">
                          {g.marksObtained}/{g.maxMarks} ({g.percentage}%)
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <span className="px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-200 font-bold">
                            {g.letterGrade}
                          </span>
                          <span className="ml-1.5 text-slate-400">{g.gpa}</span>
                        </td>
                        <td className="py-3 px-4 text-emerald-400 font-medium">{g.division}</td>
                        <td className="py-3 px-4 text-slate-400 truncate max-w-xs">{g.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. BIOMETRICS TERMINAL API & CONFIGURATION SETTINGS */}
        {activeTab === 'biometrics' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Header banner */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Biometric Hardware Terminals: Optical Scanner #01 &amp; Passkey Gateway
                  </h3>
                  <p className="text-xs text-slate-500">
                    Model-wise API endpoints, baud rate, encryption protocol, and real-time synchronization settings.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>All Terminals Online</span>
                </span>
              </div>
            </div>

            {/* Terminal Selector Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {biometricTerminals.map((term) => {
                const isSelected = selectedTerminalId === term.id;
                return (
                  <button
                    key={term.id}
                    type="button"
                    onClick={() => {
                      setSelectedTerminalId(term.id);
                      setConfigForm({
                        model: term.model,
                        apiVersion: term.apiVersion,
                        endpointUrl: term.endpointUrl,
                        baudRate: term.baudRate,
                        sensitivity: term.sensitivity,
                        encryption: term.encryption,
                        webhookUrl: 'https://ssngohpur.ac.in/api/webhooks/biometric-sync',
                        apiKey: 'ssn_live_sec_9941a88301be47b',
                      });
                      setTerminalFeedback(null);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/80 border-amber-300 shadow-md ring-2 ring-amber-400/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800">
                        {term.apiVersion}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {term.status}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 mb-1">{term.name}</div>
                    <div className="text-xs text-slate-500 font-mono">{term.model}</div>
                    <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span>Last Ping: {term.lastPing}</span>
                      <span className="text-amber-700 font-semibold">{isSelected ? 'Configuring ⚡' : 'Select'}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Model-Wise API Configuration Form */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Model-Wise API &amp; Hardware Protocol Configuration
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Modify endpoint parameters, baud rates, encryption tunnels, and FIDO2 authentication keys.
                  </p>
                </div>
                <div className="text-xs font-mono text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                  Target: {biometricTerminals.find(t => t.id === selectedTerminalId)?.name}
                </div>
              </div>

              {terminalFeedback && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{terminalFeedback}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 block">Hardware Model Identifier</label>
                  <input
                    type="text"
                    value={configForm.model}
                    onChange={(e) => setConfigForm({ ...configForm, model: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 block">API Protocol Version</label>
                  <select
                    value={configForm.apiVersion}
                    onChange={(e) => setConfigForm({ ...configForm, apiVersion: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none"
                  >
                    <option value="v2.4-REST">v2.4-REST (Optical Scanner Standard)</option>
                    <option value="v3.0-FIDO">v3.0-FIDO (WebAuthn Passkey Gateway)</option>
                    <option value="v1.8-REST">v1.8-REST (IRIS Optical Sensor)</option>
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-semibold text-slate-700 block">Hardware Endpoint URL</label>
                  <input
                    type="url"
                    value={configForm.endpointUrl}
                    onChange={(e) => setConfigForm({ ...configForm, endpointUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 block">Baud Rate / Transfer Speed</label>
                  <select
                    value={configForm.baudRate}
                    onChange={(e) => setConfigForm({ ...configForm, baudRate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none font-mono"
                  >
                    <option value="115200 bps">115200 bps (Standard Optical)</option>
                    <option value="57600 bps">57600 bps (Low Latency)</option>
                    <option value="Gigabit LAN / BLE 5.2">Gigabit LAN / BLE 5.2 (Passkey Gateway)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 block">Biometric Sensitivity Threshold</label>
                  <select
                    value={configForm.sensitivity}
                    onChange={(e) => setConfigForm({ ...configForm, sensitivity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none"
                  >
                    <option value="98.5% (High Precision)">98.5% (High Precision)</option>
                    <option value="Biometric FIDO2 Level 2">Biometric FIDO2 Level 2 (Passkey Enclave)</option>
                    <option value="99.1% Sub-millimeter">99.1% Sub-millimeter (IRIS Sensor)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 block">Security Encryption Tunnel</label>
                  <input
                    type="text"
                    value={configForm.encryption}
                    onChange={(e) => setConfigForm({ ...configForm, encryption: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 block">API Secret Token / Key</label>
                  <input
                    type="password"
                    value={configForm.apiKey}
                    onChange={(e) => setConfigForm({ ...configForm, apiKey: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-500 font-mono">
                  Changes apply instantly to live hardware polling routines.
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isTestingTerminal}
                    onClick={() => {
                      setIsTestingTerminal(true);
                      setTerminalFeedback(null);
                      setTimeout(() => {
                        setIsTestingTerminal(false);
                        setTerminalFeedback(`Handshake successful with ${configForm.model} at ${configForm.endpointUrl} (Latency: 14ms).`);
                      }, 900);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTestingTerminal ? 'animate-spin' : ''}`} />
                    <span>Test Hardware Ping</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBiometricTerminals(prev =>
                        prev.map(t => (t.id === selectedTerminalId ? { ...t, ...configForm } : t))
                      );
                      setTerminalFeedback(`Successfully saved API configuration settings for ${configForm.model}.`);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save Hardware Config</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Live Terminal Punch Logs Table */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  Real-time Terminal Attendance &amp; Passkey Logs ({biometricLogs.length})
                </h4>
                <span className="text-xs text-slate-500 font-mono">Synchronized with Optical Scanner #01 &amp; Passkey Gateway</span>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Staff Member</th>
                        <th className="py-3 px-4">Designation &amp; Dept</th>
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3 px-4">Punch Type</th>
                        <th className="py-3 px-4">Verification Modality</th>
                        <th className="py-3 px-4">Confidence</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      {biometricLogs.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {b.staffName}
                            <span className="block text-[10px] font-mono text-slate-500">{b.staffId}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {b.designation}
                            <span className="block text-[10px] text-slate-400">{b.department}</span>
                          </td>
                          <td className="py-3 px-4 font-mono text-amber-700 font-semibold">{b.punchTimeLabel}</td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">{b.punchType}</td>
                          <td className="py-3 px-4 text-slate-700">{b.verificationMethod}</td>
                          <td className="py-3 px-4 font-mono text-emerald-700 font-bold">{b.confidenceScore}%</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {b.attendanceStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. SKILL MILESTONES */}
        {activeTab === 'skills' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-medium uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Class</th>
                      <th className="py-3 px-4">Skill Domain</th>
                      <th className="py-3 px-4">Milestone Title</th>
                      <th className="py-3 px-4">XP Points</th>
                      <th className="py-3 px-4">Proficiency</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {skills.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-850/50">
                        <td className="py-3 px-4 font-semibold text-white">{s.studentName}</td>
                        <td className="py-3 px-4 text-slate-300">{s.className}</td>
                        <td className="py-3 px-4 text-amber-300 font-medium">{s.skillDomain}</td>
                        <td className="py-3 px-4 text-slate-200">{s.skillTitle}</td>
                        <td className="py-3 px-4 font-mono font-bold text-purple-400">+{s.xpPoints} XP</td>
                        <td className="py-3 px-4 font-mono">{s.proficiency}%</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800 uppercase">
                            {s.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 7. NOTICE BROADCASTER */}
        {activeTab === 'notifications' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-white">Institutional Bulletin &amp; Broadcast Terminal</h4>
                <p className="text-xs text-slate-400">Issue official circulars to teachers, scholars, or guardians.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsBroadcastingNotice(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                New Circular
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notifications.map((n) => (
                <div key={n.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-amber-300">
                      {n.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Target: {n.targetRole}</span>
                  </div>
                  <h5 className="text-sm font-bold text-white">{n.title}</h5>
                  <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
                  <div className="text-[10px] text-slate-500 pt-1 font-mono">Issued by: {n.senderName}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. STATUTORY & TRUST AUDIT */}
        {activeTab === 'statutory' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-400" />
                Statutory &amp; Institutional Governance Register
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sankardev Shiksha Niketan, Gohpur is governed under the permanent trust charter of SAILAJA SANKKALP TRUST. The institution complies with ASSEB Assam, UGC NEP-2020 guidelines, and statutory educational mandates.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400">School Affiliation Code</div>
                  <div className="text-sm font-bold font-mono text-amber-400">ASSEB/2026/GOHPUR-035371</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400">Governance Trust</div>
                  <div className="text-sm font-bold text-white">SAILAJA SANKKALP TRUST</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400">Founding Chairman</div>
                  <div className="text-sm font-bold text-white">Mr. Uday Aditya Goswami</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>

      {/* Broadcast Notice Modal */}
      {isBroadcastingNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600" />
                Broadcast Institutional Circular
              </h3>
              <button
                type="button"
                onClick={() => setIsBroadcastingNotice(false)}
                className="text-slate-400 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendNoticeSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-700 font-semibold block">Notice Title *</label>
                <input
                  type="text"
                  value={newNoticeTitle}
                  onChange={(e) => setNewNoticeTitle(e.target.value)}
                  placeholder="e.g. Schedule for Annual Board Examinations 2026-27"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Target Role</label>
                  <select
                    value={newNoticeTarget}
                    onChange={(e) => setNewNoticeTarget(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none"
                  >
                    <option value="all">Everyone</option>
                    <option value="teacher">Teachers Only</option>
                    <option value="student">Students Only</option>
                    <option value="parent">Parents Only</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Category</label>
                  <select
                    value={newNoticeCategory}
                    onChange={(e) => setNewNoticeCategory(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Biometric">Biometric</option>
                    <option value="Admission">Admission</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Priority</label>
                  <select
                    value={newNoticePriority}
                    onChange={(e) => setNewNoticePriority(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold block">Notice Body Message *</label>
                <textarea
                  value={newNoticeMsg}
                  onChange={(e) => setNewNoticeMsg(e.target.value)}
                  rows={4}
                  placeholder="Enter official circular details..."
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBroadcastingNotice(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingNotice}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSendingNotice ? 'Broadcasting...' : 'Broadcast Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register / Edit User Modal */}
      {isAddingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-600" />
                {editingUserId ? 'Edit Institutional Member' : 'Register New Institutional Member'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingUser(false)}
                className="text-slate-400 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUserFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold block">Full Name *</label>
                  <input
                    type="text"
                    value={userForm.fullName}
                    onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                    placeholder="e.g. Dr. Ananta Saikia"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold block">Portal Email *</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="user@ssngohpur.ac.in"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold block">User Role *</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none"
                  >
                    <option value="student">Student / Scholar</option>
                    <option value="teacher">Teacher / Educator</option>
                    <option value="parent">Parent / Guardian</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold block">Gender</label>
                  <select
                    value={userForm.gender || 'Male'}
                    onChange={(e) => setUserForm({ ...userForm, gender: e.target.value as 'Male' | 'Female' })}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none cursor-pointer"
                  >
                    <option value="Male">👦 Male (Boy / Men)</option>
                    <option value="Female">👧 Female (Girl / Women)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold block">Roll / Employee No *</label>
                  <input
                    type="text"
                    value={userForm.rollOrEmpNo}
                    onChange={(e) => setUserForm({ ...userForm, rollOrEmpNo: e.target.value })}
                    placeholder="SSN-2026-001"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold block">Class / Department *</label>
                  <input
                    type="text"
                    value={userForm.departmentOrClass}
                    onChange={(e) => setUserForm({ ...userForm, departmentOrClass: e.target.value })}
                    placeholder="Class XII (Science)"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold block">Contact Phone *</label>
                  <input
                    type="text"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    placeholder="+91 9954656161"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold block">Residential Address *</label>
                <input
                  type="text"
                  value={userForm.address}
                  onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
                  placeholder="Solengi, Gohpur, Biswanath"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUser}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingUser ? 'Saving...' : editingUserId ? 'Update Member' : 'Register Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMISSION SCRUTINY & FINAL APPROVAL MODAL */}
      {selectedAdmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white border-2 border-slate-900 rounded-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 text-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col sm:flex-row items-start justify-between border-b border-slate-200 pb-4 gap-4">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-blue-900 font-bold">
                  SANKARDEV SHIKSHA NIKETAN · OFFICIAL ADMISSION SCRUTINY SYSTEM
                </div>
                <h3 className="text-xl font-display font-bold text-slate-950 flex items-center gap-2 mt-1">
                  <ShieldCheck className="w-5 h-5 text-blue-900" />
                  Application Scrutiny &amp; Approval: {selectedAdmission.applicationNo}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Review scholar credentials, verify physical document checklist, and execute final administrative admission decision for Session 2026–27.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    printDocument({
                      title: `SSN_Admission_${selectedAdmission.applicationNo}`,
                      filename: `SSN_Admission_${selectedAdmission.applicationNo}_${selectedAdmission.applicantName.replace(/\s+/g, '_')}`,
                    })
                  }
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAdmission(null)}
                  className="p-2 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Applicant Profile & Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center text-center space-y-3">
                <div className="w-28 h-32 rounded-lg border border-slate-300 bg-white overflow-hidden shadow-2xs flex items-center justify-center">
                  {selectedAdmission.studentPhoto ? (
                    <img src={selectedAdmission.studentPhoto} alt={selectedAdmission.applicantName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-slate-400 text-xs">No Photo</div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-950">{selectedAdmission.applicantName}</h4>
                  <p className="text-xs text-blue-900 font-semibold">{selectedAdmission.applyingForClass} · {selectedAdmission.stream}</p>
                </div>
                <div className="w-full pt-3 border-t border-slate-200 text-left space-y-1.5 text-xs text-slate-700">
                  <div><strong>Gender:</strong> {selectedAdmission.gender || 'N/A'}</div>
                  <div><strong>DOB:</strong> {selectedAdmission.dob || 'N/A'}</div>
                  <div><strong>Caste/Religion:</strong> {selectedAdmission.caste || 'Gen'} / {selectedAdmission.religion || 'Hindu'}</div>
                  <div><strong>Blood Group:</strong> {selectedAdmission.bloodGroup || 'N/A'}</div>
                  <div><strong>Hostel Req.:</strong> <span className="font-bold text-amber-800">{selectedAdmission.hostelRequired || 'Yes'}</span></div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                {/* Guardian & Contact Info */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-1.5">
                    Parent, Guardian &amp; Address Details
                  </h5>
                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-700">
                    <div><strong>Father Name:</strong> {selectedAdmission.fatherName || 'N/A'}</div>
                    <div><strong>Guardian Name:</strong> {selectedAdmission.guardianName} ({selectedAdmission.guardianRelation || 'Parent'})</div>
                    <div><strong>Contact Phone:</strong> <span className="font-mono">{selectedAdmission.contactPhone}</span></div>
                    <div><strong>Portal Email:</strong> <span className="font-mono">{selectedAdmission.contactEmail}</span></div>
                    <div className="col-span-2"><strong>Permanent Address:</strong> {selectedAdmission.permanentAddress || selectedAdmission.guardianAddress || 'Solengi, Gohpur'}</div>
                    <div className="col-span-2"><strong>Previous Institution:</strong> {selectedAdmission.previousSchool} ({selectedAdmission.percentageLastExam}% marks)</div>
                  </div>
                </div>

                {/* Scrutiny Document Checklist */}
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-700" />
                    <span>Admin Document Scrutiny Checklist</span>
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-blue-100">
                      <input
                        type="checkbox"
                        checked={scrutinyChecklist.birthCertificate}
                        onChange={(e) => setScrutinyChecklist({ ...scrutinyChecklist, birthCertificate: e.target.checked })}
                        className="rounded text-blue-900 focus:ring-blue-800"
                      />
                      <span className="font-medium text-slate-800">Birth Certificate Verified</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-blue-100">
                      <input
                        type="checkbox"
                        checked={scrutinyChecklist.marksheetTc}
                        onChange={(e) => setScrutinyChecklist({ ...scrutinyChecklist, marksheetTc: e.target.checked })}
                        className="rounded text-blue-900 focus:ring-blue-800"
                      />
                      <span className="font-medium text-slate-800">Marksheet &amp; Transfer Certificate (TC)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-blue-100">
                      <input
                        type="checkbox"
                        checked={scrutinyChecklist.conductCert}
                        onChange={(e) => setScrutinyChecklist({ ...scrutinyChecklist, conductCert: e.target.checked })}
                        className="rounded text-blue-900 focus:ring-blue-800"
                      />
                      <span className="font-medium text-slate-800">Conduct / Character Certificate</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-blue-100">
                      <input
                        type="checkbox"
                        checked={scrutinyChecklist.medicalFitness}
                        onChange={(e) => setScrutinyChecklist({ ...scrutinyChecklist, medicalFitness: e.target.checked })}
                        className="rounded text-blue-900 focus:ring-blue-800"
                      />
                      <span className="font-medium text-slate-800">Medical Fitness &amp; Vaccination Record</span>
                    </label>
                  </div>
                </div>

                {/* Fee & Hostel Allocation */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">Fee Assessment &amp; Status</div>
                    <div className="text-slate-600 mt-0.5">Total Annual Fee: <span className="font-mono font-bold text-slate-900">₹{selectedAdmission.feeAmount.toLocaleString('en-IN')}</span></div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      selectedAdmission.feeStatus === 'paid' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      Fee: {selectedAdmission.feeStatus.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Final Administrative Decision & Action Bar */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-600">
                Current Application Status: <strong className="uppercase text-blue-900">{selectedAdmission.applicationStatus}</strong>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={isScrutinySubmitting}
                  onClick={async () => {
                    if (onUpdateAdmissionStatus) {
                      setIsScrutinySubmitting(true);
                      await onUpdateAdmissionStatus(selectedAdmission.id, 'verified', selectedAdmission.feeStatus);
                      setIsScrutinySubmitting(false);
                      setSelectedAdmission({ ...selectedAdmission, applicationStatus: 'verified' });
                    }
                  }}
                  className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-900 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Verify Documents (Pass Scrutiny)
                </button>

                <button
                  type="button"
                  disabled={isScrutinySubmitting}
                  onClick={async () => {
                    if (onUpdateAdmissionStatus) {
                      setIsScrutinySubmitting(true);
                      await onUpdateAdmissionStatus(selectedAdmission.id, 'enrolled', 'paid');
                      setIsScrutinySubmitting(false);
                      setSelectedAdmission(null);
                    }
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve &amp; Enroll Scholar</span>
                </button>

                <button
                  type="button"
                  disabled={isScrutinySubmitting}
                  onClick={async () => {
                    if (onUpdateAdmissionStatus) {
                      setIsScrutinySubmitting(true);
                      await onUpdateAdmissionStatus(selectedAdmission.id, 'rejected', selectedAdmission.feeStatus);
                      setIsScrutinySubmitting(false);
                      setSelectedAdmission(null);
                    }
                  }}
                  className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Reject Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL SCHOLAR PORTAL CREDENTIAL SLIP MODAL */}
      {viewingCredentialAdmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[95vh] overflow-y-auto space-y-6 my-auto text-slate-900">
            <PrintActionToolbar
              documentTitle={`Scholar Credentials Slip: ${viewingCredentialAdmission.applicationNo}`}
              documentSubtitle={`Enrolled Scholar: ${viewingCredentialAdmission.applicantName} · Class: ${viewingCredentialAdmission.applyingForClass}`}
              badgeLabel="CONFIDENTIAL CREDENTIAL SLIP"
              badgeColor="bg-blue-100 text-blue-900 border-blue-300"
              filename={`SSN_Credentials_${viewingCredentialAdmission.applicationNo}_${viewingCredentialAdmission.applicantName.replace(/\s+/g, '_')}`}
              onClose={() => {
                setViewingCredentialAdmission(null);
                setCredentialCopied(false);
              }}
            />

            {/* Official Credentials Slip Body (Print Target) */}
            <div className="p-6 sm:p-8 border-2 border-slate-900 rounded-2xl bg-white space-y-5 print:border-2 print:border-slate-900 print:p-6">
              {/* Institutional Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-950 text-white flex items-center justify-center font-extrabold text-xl shadow-xs">
                    SSN
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-blue-900 uppercase tracking-wider">
                      SAILAJA SANKKALP TRUST
                    </div>
                    <h3 className="text-lg font-bold text-slate-950 leading-tight">
                      Sankardev Shiksha Niketan, Gohpur
                    </h3>
                    <p className="text-xs text-slate-500">
                      Bapadev Kshetra, Solengi, Biswanath · School Code: 035371 · Affiliation: ASSEB
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-block px-2.5 py-1 bg-blue-950 text-white font-mono font-bold text-xs rounded-md uppercase tracking-wider">
                    CONFIDENTIAL
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    ISSUED: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Scholar Information Profile */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-20 h-24 rounded-xl border-2 border-blue-900 overflow-hidden bg-slate-100 shrink-0 shadow-xs flex items-center justify-center">
                  {viewingCredentialAdmission.studentPhoto ? (
                    <img
                      src={viewingCredentialAdmission.studentPhoto}
                      alt={viewingCredentialAdmission.applicantName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <GraduationCap className="w-8 h-8 text-blue-900/60" />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs flex-1">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Enrolled Scholar</span>
                    <strong className="text-sm text-slate-950 font-display">{viewingCredentialAdmission.applicantName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Enrollment ID / App #</span>
                    <span className="font-mono font-bold text-blue-900">{viewingCredentialAdmission.applicationNo}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Class &amp; Stream</span>
                    <span className="font-medium text-slate-800">{viewingCredentialAdmission.applyingForClass} · {viewingCredentialAdmission.stream}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Guardian &amp; Contact</span>
                    <span className="font-medium text-slate-800">{viewingCredentialAdmission.guardianName} ({viewingCredentialAdmission.contactPhone})</span>
                  </div>
                </div>
              </div>

              {/* Secure Credentials Box */}
              <div className="p-4 sm:p-5 rounded-xl border-2 border-dashed border-blue-400 bg-blue-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-blue-800" />
                    <span>Single Sign-On Portal Credentials</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const text = `SSN Gohpur Scholar Login:\nPortal: https://smartschool.asomweb.com/\nUsername: ${viewingCredentialAdmission.portalLoginEmail || viewingCredentialAdmission.contactEmail || 'student@ssn.edu.in'}\nPassword: ${viewingCredentialAdmission.portalInitialPassword || 'SSN-STD@2026'}`;
                      navigator.clipboard.writeText(text);
                      setCredentialCopied(true);
                      setTimeout(() => setCredentialCopied(false), 3000);
                    }}
                    className="no-print px-3 py-1 bg-white hover:bg-slate-100 border border-blue-300 text-blue-900 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    {credentialCopied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <span>Copy Login Info</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-blue-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Official Scholar Login Email</span>
                    <span className="font-mono font-bold text-sm text-blue-950 break-all select-all">
                      {viewingCredentialAdmission.portalLoginEmail || viewingCredentialAdmission.contactEmail || 'student@ssn.edu.in'}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-blue-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Confidential Initial Password</span>
                    <span className="font-mono font-extrabold text-sm text-blue-950 tracking-wider select-all">
                      {viewingCredentialAdmission.portalInitialPassword || 'SSN-STD@2026'}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-blue-900 bg-white/70 p-2.5 rounded-lg border border-blue-200/80">
                  <strong>Access Gateway:</strong> <code>https://smartschool.asomweb.com/</code> · Select <strong>Student / Parent</strong> portal tab.
                </div>
              </div>

              {/* Instructions and Rules */}
              <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800 text-xs mb-1">Security &amp; Usage Directives:</div>
                <p>1. These credentials grant immediate access to the Scholar Gradebook, Attendance Logs, Skill XP, and Digital ID Pass.</p>
                <p>2. For safeguarding personal information, the scholar must reset their temporary password after their first successful sign-in.</p>
                <p>3. Do not disclose institutional passwords to any third parties. For support, contact the Computer Centre, Bapadev Kshetra.</p>
              </div>

              {/* Dual Authority Signature Block */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-6 text-xs avoid-break">
                <div className="text-left space-y-1">
                  <div className="font-serif italic font-bold text-slate-900">Uday Aditya Goswami</div>
                  <div className="border-t border-slate-300 pt-1 text-[10px] text-slate-500 font-semibold uppercase">System Administrator / IT Registrar</div>
                  <div className="text-[9px] text-slate-400 font-mono">Verified: {getInstitutionalVerificationTimestamp()}</div>
                </div>

                <div className="text-right space-y-1">
                  <div className="font-serif italic font-bold text-slate-900">Pabitra Borah</div>
                  <div className="border-t border-slate-300 pt-1 text-[10px] text-slate-500 font-semibold uppercase">Principal / Authority Seal</div>
                  <div className="text-[9px] text-slate-400 font-mono">Code: 035371 · Sankardev Shiksha Niketan</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 no-print">
              <button
                type="button"
                onClick={() => {
                  setViewingCredentialAdmission(null);
                  setCredentialCopied(false);
                }}
                className="px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
