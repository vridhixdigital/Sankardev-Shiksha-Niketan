import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Printer,
  Plus,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Calendar,
  Building2,
  DollarSign,
  TrendingUp,
  CreditCard,
  Coins,
  ChevronRight,
  ChevronLeft,
  X,
  Eye,
  RefreshCw,
  Phone,
  Mail,
  User as UserIcon,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Download,
  Clock,
  QrCode,
  FileText,
  BadgeAlert,
  ArrowUpRight,
  Send,
  Copy,
} from 'lucide-react';
import {
  FeePaymentReceiptDoc,
  UserProfileDoc,
  AdmissionRecordDoc,
  FeeStructureRecordDoc,
  SchoolAdminSettingsDoc,
} from '../../types/erp';
import {
  printDocument,
  formatCurrencyToWords,
  getInstitutionalVerificationTimestamp,
} from '../../utils/printDocument';
import { PrintActionToolbar } from '../common/PrintActionToolbar';

export type FeeManagerSubView =
  | 'ledger'
  | 'auto_reports'
  | 'dues_register'
  | 'receipt_studio'
  | 'fee_matrix';

interface StudentFeeTransactionManagerProps {
  payments: FeePaymentReceiptDoc[];
  users: UserProfileDoc[];
  admissions: AdmissionRecordDoc[];
  feeStructures?: FeeStructureRecordDoc[];
  schoolSettings?: SchoolAdminSettingsDoc;
  onAddPaymentReceipt?: (payment: Partial<FeePaymentReceiptDoc>) => Promise<void>;
  onUpdatePaymentReceipt?: (id: string, updates: Partial<FeePaymentReceiptDoc>) => Promise<void>;
  onDeletePaymentReceipt?: (id: string) => Promise<void>;
}

export const StudentFeeTransactionManager: React.FC<StudentFeeTransactionManagerProps> = ({
  payments = [],
  users = [],
  admissions = [],
  feeStructures = [],
  schoolSettings,
  onAddPaymentReceipt,
  onUpdatePaymentReceipt,
  onDeletePaymentReceipt,
}) => {
  // Navigation State
  const [activeSubView, setActiveSubView] = useState<FeeManagerSubView>('ledger');
  const [isSubSidebarCollapsed, setIsSubSidebarCollapsed] = useState(false);
  const [isMobileSubSidebarOpen, setIsMobileSubSidebarOpen] = useState(false);

  // Search & Filter State for Ledger
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [selectedTermFilter, setSelectedTermFilter] = useState('all');
  const [selectedModeFilter, setSelectedModeFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  // Modal States
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedReceiptForPrint, setSelectedReceiptForPrint] = useState<FeePaymentReceiptDoc | null>(null);
  const [selectedDuesNoticeScholar, setSelectedDuesNoticeScholar] = useState<{
    id: string;
    studentName: string;
    rollNo: string;
    className: string;
    guardianName: string;
    contactPhone: string;
    totalDue: number;
    pendingTerm: string;
  } | null>(null);

  // Report Specific Filter State
  const [reportDateRange, setReportDateRange] = useState<'today' | 'current_month' | 'full_session'>('full_session');
  const [activeReportTab, setActiveReportTab] = useState<'daily_scroll' | 'class_matrix' | 'head_distribution' | 'mode_reconciliation'>('class_matrix');

  // Scholar options derived from users + admissions
  const enrolledStudents = useMemo(() => {
    const list: { id: string; name: string; rollNo: string; className: string; stream: string; guardian: string; phone: string }[] = [];
    
    // Students from UserProfileDoc
    users.filter((u) => u.role === 'student').forEach((u) => {
      list.push({
        id: u.id,
        name: u.fullName,
        rollNo: u.rollOrEmpNo,
        className: u.departmentOrClass,
        stream: u.departmentOrClass.includes('Science') ? 'Science' : u.departmentOrClass.includes('Arts') ? 'Arts' : 'General',
        guardian: u.guardianOrLinkedName || 'Guardian',
        phone: u.phone || '+91 9954656161',
      });
    });

    // Enrolled students from admissions who might not yet have user profile
    admissions.filter((a) => a.applicationStatus === 'enrolled').forEach((a) => {
      if (!list.some((existing) => existing.name.toLowerCase() === a.applicantName.toLowerCase())) {
        list.push({
          id: a.id,
          name: a.applicantName,
          rollNo: a.applicationNo,
          className: a.applyingForClass,
          stream: a.stream,
          guardian: a.guardianName,
          phone: a.contactPhone,
        });
      }
    });

    return list;
  }, [users, admissions]);

  // Form State for Recording New Fee Payment
  const [receiptForm, setReceiptForm] = useState({
    studentId: '',
    studentName: '',
    rollNo: '',
    className: 'Class VI',
    stream: 'General Foundation',
    receiptNo: `SSN-RCP-2026-0${payments.length + 51}`,
    paymentDate: new Date().toISOString().slice(0, 10),
    paymentForTerm: 'Quarter 1' as FeePaymentReceiptDoc['paymentForTerm'],
    admissionFee: 5000,
    tuitionFee: 4950,
    hostelMessFee: 11000,
    labExamFee: 650,
    developmentFee: 1000,
    otherFine: 0,
    amountPaid: 22600,
    paymentMode: 'UPI / Online' as FeePaymentReceiptDoc['paymentMode'],
    transactionRef: 'UPI-SSN-' + Math.floor(1000000000 + Math.random() * 9000000000),
    cashierName: 'Sri Dhireswar Borkotoky (Bursar)',
    remarks: 'Quarter settlement received via electronic payment into Trust A/C.',
  });

  const [isSubmittingReceipt, setIsSubmittingReceipt] = useState(false);
  const [copiedTxnId, setCopiedTxnId] = useState<string | null>(null);

  // Auto-calculated totals in record modal
  const formCalculatedTotal = useMemo(() => {
    return (
      (Number(receiptForm.admissionFee) || 0) +
      (Number(receiptForm.tuitionFee) || 0) +
      (Number(receiptForm.hostelMessFee) || 0) +
      (Number(receiptForm.labExamFee) || 0) +
      (Number(receiptForm.developmentFee) || 0) +
      (Number(receiptForm.otherFine) || 0)
    );
  }, [receiptForm]);

  const formCalculatedBalance = useMemo(() => {
    const total = formCalculatedTotal;
    const paid = Number(receiptForm.amountPaid) || 0;
    return Math.max(0, total - paid);
  }, [formCalculatedTotal, receiptForm.amountPaid]);

  // Handle auto-populating fees when selecting a scholar
  const handleSelectScholarInForm = (scholarId: string) => {
    const scholar = enrolledStudents.find((s) => s.id === scholarId);
    if (!scholar) return;

    // Try finding matching fee structure for this class
    const matchingStructure = feeStructures.find((f) =>
      scholar.className.toLowerCase().includes(f.className.toLowerCase())
    );

    const tuition = matchingStructure ? Math.round(matchingStructure.tuitionFeeAnnual / 4) : 4950;
    const hostel = matchingStructure ? Math.round((matchingStructure.hostelBoardingFee + matchingStructure.messCateringFee) / 4) : 11000;
    const lab = matchingStructure ? Math.round(matchingStructure.examAssessmentFee / 4) : 650;
    const dev = matchingStructure ? Math.round(matchingStructure.developmentFund / 4) : 1000;
    const adm = 0; // recurring quarterly payment

    const total = tuition + hostel + lab + dev + adm;

    setReceiptForm((prev) => ({
      ...prev,
      studentId: scholar.id,
      studentName: scholar.name,
      rollNo: scholar.rollNo,
      className: scholar.className,
      stream: scholar.stream,
      admissionFee: adm,
      tuitionFee: tuition,
      hostelMessFee: hostel,
      labExamFee: lab,
      developmentFee: dev,
      amountPaid: total,
    }));
  };

  // Submit new fee receipt
  const handleSubmitReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptForm.studentName || !receiptForm.receiptNo) return;
    setIsSubmittingReceipt(true);

    try {
      const payload: Partial<FeePaymentReceiptDoc> = {
        receiptNo: receiptForm.receiptNo,
        paymentDate: receiptForm.paymentDate,
        studentId: receiptForm.studentId || `std_${Date.now()}`,
        studentName: receiptForm.studentName,
        rollNo: receiptForm.rollNo,
        className: receiptForm.className,
        stream: receiptForm.stream,
        paymentForTerm: receiptForm.paymentForTerm,
        feeBreakdown: {
          admissionFee: Number(receiptForm.admissionFee) || 0,
          tuitionFee: Number(receiptForm.tuitionFee) || 0,
          hostelMessFee: Number(receiptForm.hostelMessFee) || 0,
          labExamFee: Number(receiptForm.labExamFee) || 0,
          developmentFee: Number(receiptForm.developmentFee) || 0,
          otherFine: Number(receiptForm.otherFine) || 0,
        },
        totalAmount: formCalculatedTotal,
        amountPaid: Number(receiptForm.amountPaid) || 0,
        balanceDue: formCalculatedBalance,
        paymentMode: receiptForm.paymentMode,
        transactionRef: receiptForm.transactionRef,
        cashierName: receiptForm.cashierName,
        remarks: receiptForm.remarks,
        status: 'completed',
      };

      if (onAddPaymentReceipt) {
        await onAddPaymentReceipt(payload);
      }

      setIsRecordModalOpen(false);
      // Open print preview for immediate receipt issuance
      setSelectedReceiptForPrint(payload as FeePaymentReceiptDoc);
    } catch (err) {
      console.error('Error recording fee payment:', err);
    } finally {
      setIsSubmittingReceipt(false);
    }
  };

  // Filtered Payments for Ledger
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchSearch =
        !searchQuery.trim() ||
        p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.receiptNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.transactionRef && p.transactionRef.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.className.toLowerCase().includes(searchQuery.toLowerCase());

      const matchClass = selectedClassFilter === 'all' || p.className.includes(selectedClassFilter);
      const matchTerm = selectedTermFilter === 'all' || p.paymentForTerm === selectedTermFilter;
      const matchMode = selectedModeFilter === 'all' || p.paymentMode === selectedModeFilter;
      const matchStatus =
        selectedStatusFilter === 'all' ||
        (selectedStatusFilter === 'completed' && (p.balanceDue === 0 || p.status === 'completed')) ||
        (selectedStatusFilter === 'has_balance' && p.balanceDue > 0) ||
        (selectedStatusFilter === 'cancelled' && p.status === 'cancelled');

      return matchSearch && matchClass && matchTerm && matchMode && matchStatus;
    });
  }, [payments, searchQuery, selectedClassFilter, selectedTermFilter, selectedModeFilter, selectedStatusFilter]);

  // Overall Financial Metrics
  const totalBilled = useMemo(() => payments.reduce((acc, p) => acc + (p.totalAmount || 0), 0), [payments]);
  const totalCollected = useMemo(() => payments.reduce((acc, p) => acc + (p.amountPaid || 0), 0), [payments]);
  const totalOutstandingBalance = useMemo(() => payments.reduce((acc, p) => acc + (p.balanceDue || 0), 0), [payments]);
  const collectionVelocityPercent = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 100;

  // Breakdown by mode
  const modeTotals = useMemo(() => {
    const res = { upi: 0, bank: 0, cash: 0, cheque: 0 };
    payments.forEach((p) => {
      const amt = p.amountPaid || 0;
      if (p.paymentMode.includes('UPI')) res.upi += amt;
      else if (p.paymentMode.includes('Bank') || p.paymentMode.includes('NEFT')) res.bank += amt;
      else if (p.paymentMode.includes('Cash')) res.cash += amt;
      else res.cheque += amt;
    });
    return res;
  }, [payments]);

  // Breakdown by head
  const headTotals = useMemo(() => {
    const res = { admission: 0, tuition: 0, hostelMess: 0, labExam: 0, dev: 0, fines: 0 };
    payments.forEach((p) => {
      if (p.feeBreakdown) {
        res.admission += p.feeBreakdown.admissionFee || 0;
        res.tuition += p.feeBreakdown.tuitionFee || 0;
        res.hostelMess += p.feeBreakdown.hostelMessFee || 0;
        res.labExam += p.feeBreakdown.labExamFee || 0;
        res.dev += p.feeBreakdown.developmentFee || 0;
        res.fines += p.feeBreakdown.otherFine || 0;
      }
    });
    return res;
  }, [payments]);

  // Class-wise Realization Matrix
  const classMatrixData = useMemo(() => {
    const classes = [
      'Class VI',
      'Class VII',
      'Class VIII',
      'Class IX',
      'Class X',
      'Class XI (Science)',
      'Class XI (Arts)',
      'Class XII (Science)',
      'Class XII (Arts)',
      '4-Year B.A. Honours',
    ];

    return classes.map((cls) => {
      const classPayments = payments.filter((p) => p.className.toLowerCase().includes(cls.toLowerCase()));
      const billed = classPayments.reduce((s, p) => s + (p.totalAmount || 0), 0);
      const paid = classPayments.reduce((s, p) => s + (p.amountPaid || 0), 0);
      const dues = classPayments.reduce((s, p) => s + (p.balanceDue || 0), 0);
      const scholarCount = enrolledStudents.filter((s) => s.className.toLowerCase().includes(cls.toLowerCase())).length || classPayments.length;
      const rate = billed > 0 ? Math.round((paid / billed) * 100) : paid > 0 ? 100 : 0;

      return {
        className: cls,
        scholars: scholarCount,
        billed,
        paid,
        dues,
        rate,
      };
    });
  }, [payments, enrolledStudents]);

  // Defaulters List
  const defaultersList = useMemo(() => {
    // Scholars with positive balance in payments or admitted with fee pending
    const list: {
      id: string;
      studentName: string;
      rollNo: string;
      className: string;
      guardianName: string;
      contactPhone: string;
      totalDue: number;
      pendingTerm: string;
      lastPaymentDate?: string;
    }[] = [];

    // From payments with balanceDue > 0
    payments.filter((p) => p.balanceDue > 0).forEach((p) => {
      const matchScholar = enrolledStudents.find((s) => s.id === p.studentId || s.name === p.studentName);
      list.push({
        id: p.id,
        studentName: p.studentName,
        rollNo: p.rollNo,
        className: p.className,
        guardianName: matchScholar?.guardian || 'Guardian',
        contactPhone: matchScholar?.phone || '+91 9954656161',
        totalDue: p.balanceDue,
        pendingTerm: p.paymentForTerm,
        lastPaymentDate: p.paymentDate,
      });
    });

    // From admissions pending payment
    admissions.filter((a) => a.feeStatus === 'pending').forEach((a) => {
      if (!list.some((existing) => existing.studentName.toLowerCase() === a.applicantName.toLowerCase())) {
        list.push({
          id: a.id,
          studentName: a.applicantName,
          rollNo: a.applicationNo,
          className: a.applyingForClass,
          guardianName: a.guardianName,
          contactPhone: a.contactPhone,
          totalDue: a.feeAmount || 35000,
          pendingTerm: 'Admission & Enrollment Fee',
          lastPaymentDate: 'Pending Clearance',
        });
      }
    });

    return list;
  }, [payments, admissions, enrolledStudents]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTxnId(id);
    setTimeout(() => setCopiedTxnId(null), 2500);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isMobileSubSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileSubSidebarOpen(false)}
        />
      )}

      {/* TOP EXECUTIVE KPI HEADER */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 shrink-0 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileSubSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
            title="Open Fee Menu"
          >
            <Filter className="w-4 h-4" />
          </button>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-500 text-white flex items-center justify-center shadow-xs">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Student Fee Transactions &amp; Financial Ledger
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200 uppercase tracking-wide">
                Live Audit Desk
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Sankardev Shiksha Niketan · Affiliation No: 035371 · Session 2026–27
            </p>
          </div>
        </div>

        {/* Executive Realization Summary Strip */}
        <div className="flex items-center gap-3 md:gap-5 overflow-x-auto text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Realized</span>
            <span className="font-mono font-bold text-emerald-700 text-sm">
              ₹{totalCollected.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Outstanding Dues</span>
            <span className="font-mono font-bold text-rose-600 text-sm">
              ₹{totalOutstandingBalance.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hidden sm:block">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Recovery Velocity</span>
            <span className="font-mono font-bold text-slate-800 text-sm">
              {collectionVelocityPercent}%
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (enrolledStudents.length > 0) {
                handleSelectScholarInForm(enrolledStudents[0].id);
              }
              setIsRecordModalOpen(true);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* DUAL PANE WORKSPACE: SUB-SIDEBAR + CONTENT CANVAS */}
      <div className="flex-1 flex overflow-hidden">
        {/* DEDICATED FEE MANAGEMENT SUB-SIDEBAR */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 lg:z-auto bg-white border-r border-slate-200 flex flex-col shrink-0 transition-all duration-300 shadow-xl lg:shadow-none ${
            isMobileSubSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
          } ${isSubSidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}`}
        >
          {/* Sub-Sidebar Header */}
          <div className="p-3 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/50">
            {!isSubSidebarCollapsed ? (
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block truncate">
                  Fee Command Suite
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {payments.length} Registered Txns
                </span>
              </div>
            ) : (
              <div className="w-full flex justify-center text-slate-400">
                <Coins className="w-4 h-4 text-emerald-600" />
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsSubSidebarCollapsed(!isSubSidebarCollapsed)}
              className="hidden lg:flex p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
              title={isSubSidebarCollapsed ? 'Expand Menu' : 'Collapse Menu'}
            >
              {isSubSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setIsMobileSubSidebarOpen(false)}
              className="lg:hidden p-1 rounded-lg text-slate-500 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {[
              {
                id: 'ledger' as FeeManagerSubView,
                label: 'All Transactions Ledger',
                icon: Receipt,
                badge: `${payments.length}`,
                badgeColor: 'bg-emerald-100 text-emerald-800',
                desc: 'Real-time cashier register',
              },
              {
                id: 'auto_reports' as FeeManagerSubView,
                label: 'Financial Auto-Reports',
                icon: FileSpreadsheet,
                badge: 'Audit',
                badgeColor: 'bg-blue-100 text-blue-800',
                desc: 'Matrix, daily scroll & heads',
              },
              {
                id: 'dues_register' as FeeManagerSubView,
                label: 'Outstanding Dues & Defaulters',
                icon: AlertTriangle,
                badge: `${defaultersList.length}`,
                badgeColor: 'bg-rose-100 text-rose-800',
                desc: 'Demand notices & arrears',
              },
              {
                id: 'receipt_studio' as FeeManagerSubView,
                label: 'Stamped Money Receipt Studio',
                icon: Printer,
                badge: 'PDF',
                badgeColor: 'bg-amber-100 text-amber-800',
                desc: 'Official stamped dual-slips',
              },
              {
                id: 'fee_matrix' as FeeManagerSubView,
                label: 'Approved Class Fee Slabs',
                icon: DollarSign,
                badge: `${feeStructures.length}`,
                badgeColor: 'bg-slate-100 text-slate-700',
                desc: 'Annual & hostel breakdowns',
              },
            ].map((nav) => {
              const Icon = nav.icon;
              const isActive = activeSubView === nav.id;
              return (
                <button
                  key={nav.id}
                  type="button"
                  onClick={() => {
                    setActiveSubView(nav.id);
                    setIsMobileSubSidebarOpen(false);
                  }}
                  title={isSubSidebarCollapsed ? nav.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent font-medium'
                  } ${isSubSidebarCollapsed ? 'justify-center px-2' : ''}`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-emerald-700 scale-110' : 'text-slate-400'
                    }`}
                  />
                  {!isSubSidebarCollapsed && (
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="truncate">{nav.label}</span>
                        {nav.badge && (
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold shrink-0 ${nav.badgeColor}`}
                          >
                            {nav.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-normal truncate mt-0.5">
                        {nav.desc}
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sub-Sidebar Quick Actions Footer */}
          {!isSubSidebarCollapsed && (
            <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2 shrink-0 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Bank Trust Account</span>
                <span className="font-mono text-slate-800 text-[11px] block font-semibold truncate">
                  SBI A/C: 38472910482
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  IFSC: SBIN0002061 (Gohpur)
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  printDocument({
                    title: 'SSN_Gohpur_Master_Fee_Ledger_Audit_2026_27',
                    orientation: 'landscape',
                  })
                }
                className="w-full py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Master Register</span>
              </button>
            </div>
          )}
        </aside>

        {/* WORKSPACE MAIN VIEW AREA */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* ========================================================================= */}
          {/* VIEW 1: ALL TRANSACTIONS LEDGER & CASHIER COUNTER */}
          {/* ========================================================================= */}
          {activeSubView === 'ledger' && (
            <div className="space-y-5 animate-in fade-in">
              {/* Filter & Search Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                  {/* Search Bar */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by student name, roll number, receipt number or transaction reference..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        printDocument({
                          title: `SSN_Student_Fee_Transactions_Register_${new Date().toISOString().slice(0, 10)}`,
                          orientation: 'landscape',
                        })
                      }
                      className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>Print Ledger</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (enrolledStudents.length > 0) {
                          handleSelectScholarInForm(enrolledStudents[0].id);
                        }
                        setIsRecordModalOpen(true);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New Receipt</span>
                    </button>
                  </div>
                </div>

                {/* Granular Filter Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Class Filter</label>
                    <select
                      value={selectedClassFilter}
                      onChange={(e) => setSelectedClassFilter(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                    >
                      <option value="all">All Classes</option>
                      <option value="Class VI">Class VI</option>
                      <option value="Class VII">Class VII</option>
                      <option value="Class VIII">Class VIII</option>
                      <option value="Class IX">Class IX</option>
                      <option value="Class X">Class X</option>
                      <option value="Class XI">Class XI</option>
                      <option value="Class XII">Class XII</option>
                      <option value="B.A.">B.A. Honours</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Term Filter</label>
                    <select
                      value={selectedTermFilter}
                      onChange={(e) => setSelectedTermFilter(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                    >
                      <option value="all">All Terms</option>
                      <option value="Quarter 1">Quarter 1</option>
                      <option value="Quarter 2">Quarter 2</option>
                      <option value="Quarter 3">Quarter 3</option>
                      <option value="Quarter 4">Quarter 4</option>
                      <option value="Annual Composite">Annual Composite</option>
                      <option value="Admission & Enrollment">Admission &amp; Enrollment</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Payment Mode</label>
                    <select
                      value={selectedModeFilter}
                      onChange={(e) => setSelectedModeFilter(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                    >
                      <option value="all">All Modes</option>
                      <option value="UPI / Online">UPI / Online</option>
                      <option value="Bank Transfer / NEFT">Bank Transfer / NEFT</option>
                      <option value="Cash">Cash Counter</option>
                      <option value="Cheque / DD">Cheque / DD</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Settlement Status</label>
                    <select
                      value={selectedStatusFilter}
                      onChange={(e) => setSelectedStatusFilter(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                    >
                      <option value="all">All Statuses</option>
                      <option value="completed">Zero Balance (Cleared)</option>
                      <option value="has_balance">Partially Paid (Has Due)</option>
                      <option value="cancelled">Cancelled / Void</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Transactions Ledger Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span>Transaction Records ({filteredPayments.length})</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Showing real-time records synced to official Trust ledger
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600 border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3">Receipt No</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Scholar &amp; Roll</th>
                        <th className="p-3">Class &amp; Stream</th>
                        <th className="p-3">Term</th>
                        <th className="p-3 text-right">Billed (₹)</th>
                        <th className="p-3 text-right">Paid (₹)</th>
                        <th className="p-3 text-right">Balance (₹)</th>
                        <th className="p-3">Payment Mode</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPayments.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="p-8 text-center text-slate-400">
                            <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                            <p className="font-semibold text-slate-600">No transaction records match your filters.</p>
                            <p className="text-xs text-slate-400 mt-1">Try clearing your search query or selecting &quot;All Classes&quot;.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredPayments.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 font-mono font-bold text-blue-900 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span>{p.receiptNo}</span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(p.receiptNo, p.id)}
                                  className="text-slate-400 hover:text-slate-600 p-0.5"
                                  title="Copy receipt number"
                                >
                                  {copiedTxnId === p.id ? (
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="p-3 text-slate-700 whitespace-nowrap font-medium">
                              {p.paymentDate}
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-slate-900">{p.studentName}</div>
                              <div className="text-[11px] font-mono text-slate-500">{p.rollNo}</div>
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              <div className="font-semibold text-slate-800">{p.className}</div>
                              <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{p.stream || 'Standard'}</div>
                            </td>
                            <td className="p-3 font-semibold text-slate-800 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-bold">
                                {p.paymentForTerm}
                              </span>
                            </td>
                            <td className="p-3 text-right font-mono font-medium text-slate-700">
                              ₹{p.totalAmount.toLocaleString('en-IN')}
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-emerald-700">
                              ₹{p.amountPaid.toLocaleString('en-IN')}
                            </td>
                            <td className="p-3 text-right font-mono font-bold whitespace-nowrap">
                              {p.balanceDue > 0 ? (
                                <span className="text-rose-600 font-bold">₹{p.balanceDue.toLocaleString('en-IN')}</span>
                              ) : (
                                <span className="text-emerald-600 font-medium text-[11px]">Nil (Paid)</span>
                              )}
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold inline-flex items-center gap-1 ${
                                  p.paymentMode.includes('UPI')
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                    : p.paymentMode.includes('Bank')
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {p.paymentMode}
                              </span>
                            </td>
                            <td className="p-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedReceiptForPrint(p)}
                                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Print Stamped Money Receipt"
                                >
                                  <Printer className="w-3 h-3 text-blue-700" />
                                  <span>Receipt</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot className="bg-slate-50/90 border-t-2 border-slate-300 font-mono text-xs font-bold">
                      <tr>
                        <td colSpan={5} className="p-3 text-slate-800 uppercase font-sans text-right">
                          Ledger Totals ({filteredPayments.length} txns):
                        </td>
                        <td className="p-3 text-right text-slate-900">
                          ₹{filteredPayments.reduce((s, p) => s + (p.totalAmount || 0), 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 text-right text-emerald-800 font-black">
                          ₹{filteredPayments.reduce((s, p) => s + (p.amountPaid || 0), 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 text-right text-rose-700 font-black">
                          ₹{filteredPayments.reduce((s, p) => s + (p.balanceDue || 0), 0).toLocaleString('en-IN')}
                        </td>
                        <td colSpan={2}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 2: AUTO-REPORTS & FINANCIAL AUDIT MATRICES */}
          {/* ========================================================================= */}
          {activeSubView === 'auto_reports' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Report Category Switcher & Print Controls */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-900 uppercase">
                      Automated Financial Audit
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs font-semibold text-slate-700">Official SSN Gohpur Books</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-950">
                    Institutional Fee Realization &amp; Collections Report
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      printDocument({
                        title: `SSN_Institutional_Financial_Report_${activeReportTab.toUpperCase()}_${new Date().toISOString().slice(0, 10)}`,
                        orientation: 'landscape',
                      })
                    }
                    className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Current Audit Report</span>
                  </button>
                </div>
              </div>

              {/* Sub-Tabs for Reports */}
              <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
                {[
                  { id: 'class_matrix', label: 'Class Realization Matrix', icon: Building2 },
                  { id: 'daily_scroll', label: 'Daily Cashier Scroll', icon: Calendar },
                  { id: 'head_distribution', label: 'Fee Head Breakdown', icon: DollarSign },
                  { id: 'mode_reconciliation', label: 'Gateway & Bank Reconciliation', icon: CreditCard },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeReportTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveReportTab(tab.id as any)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        isActive
                          ? 'bg-blue-900 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* REPORT A: CLASS REALIZATION MATRIX */}
              {activeReportTab === 'class_matrix' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-4 p-5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Class-Wise Fee Recovery &amp; Realization Matrix</h4>
                      <p className="text-xs text-slate-500">Comparison of expected fee collections vs actual realized payments across all classes.</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      Overall Recovery: {collectionVelocityPercent}%
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-700 text-[10px]">
                        <tr>
                          <th className="p-3">Class Level</th>
                          <th className="p-3 text-center">Enrolled Scholars</th>
                          <th className="p-3 text-right">Expected Revenue (₹)</th>
                          <th className="p-3 text-right">Collected to Date (₹)</th>
                          <th className="p-3 text-right">Pending Dues (₹)</th>
                          <th className="p-3 text-center">Recovery Velocity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {classMatrixData.map((row) => (
                          <tr key={row.className} className="hover:bg-slate-50/80">
                            <td className="p-3 font-bold text-slate-900">{row.className}</td>
                            <td className="p-3 text-center font-mono font-semibold">{row.scholars}</td>
                            <td className="p-3 text-right font-mono font-medium text-slate-700">
                              ₹{row.billed.toLocaleString('en-IN')}
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-emerald-700">
                              ₹{row.paid.toLocaleString('en-IN')}
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-rose-600">
                              ₹{row.dues.toLocaleString('en-IN')}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2 max-w-[140px] mx-auto">
                                <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      row.rate >= 90
                                        ? 'bg-emerald-600'
                                        : row.rate >= 60
                                        ? 'bg-amber-500'
                                        : 'bg-rose-500'
                                    }`}
                                    style={{ width: `${Math.min(100, row.rate)}%` }}
                                  />
                                </div>
                                <span className="font-mono font-bold text-[11px] w-8 text-right">
                                  {row.rate}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-50/90 border-t-2 border-slate-300 font-mono text-xs font-bold">
                        <tr>
                          <td className="p-3 font-sans text-slate-900">INSTITUTIONAL COMPOSITE TOTAL:</td>
                          <td className="p-3 text-center">
                            {classMatrixData.reduce((s, r) => s + r.scholars, 0)}
                          </td>
                          <td className="p-3 text-right text-slate-900">
                            ₹{totalBilled.toLocaleString('en-IN')}
                          </td>
                          <td className="p-3 text-right text-emerald-800 font-black">
                            ₹{totalCollected.toLocaleString('en-IN')}
                          </td>
                          <td className="p-3 text-right text-rose-700 font-black">
                            ₹{totalOutstandingBalance.toLocaleString('en-IN')}
                          </td>
                          <td className="p-3 text-center font-black text-emerald-700">
                            {collectionVelocityPercent}%
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* REPORT B: DAILY CASHIER SCROLL */}
              {activeReportTab === 'daily_scroll' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-4 p-5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Cashier Daily Collection Scroll &amp; Audit Log</h4>
                      <p className="text-xs text-slate-500">Itemized day-by-day cash, digital and bank transaction entries.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Render by unique payment dates */}
                    {Array.from(new Set(payments.map((p) => p.paymentDate)))
                      .sort()
                      .reverse()
                      .map((dateStr) => {
                        const dayPayments = payments.filter((p) => p.paymentDate === dateStr);
                        const dayTotal = dayPayments.reduce((s, p) => s + (p.amountPaid || 0), 0);
                        const dayCash = dayPayments.filter((p) => p.paymentMode.includes('Cash')).reduce((s, p) => s + (p.amountPaid || 0), 0);
                        const dayDigital = dayTotal - dayCash;

                        return (
                          <div key={dateStr} className="border border-slate-200 rounded-xl overflow-hidden">
                            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2 font-bold text-slate-900">
                                <Calendar className="w-4 h-4 text-emerald-600" />
                                <span>Date: {dateStr}</span>
                                <span className="text-[11px] font-normal text-slate-500">({dayPayments.length} transactions)</span>
                              </div>
                              <div className="flex items-center gap-4 font-mono text-xs">
                                <span className="text-slate-600">Cash: ₹{dayCash.toLocaleString('en-IN')}</span>
                                <span className="text-purple-700 font-semibold">Digital: ₹{dayDigital.toLocaleString('en-IN')}</span>
                                <span className="font-bold text-emerald-800">Total: ₹{dayTotal.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                            <div className="divide-y divide-slate-100 text-xs">
                              {dayPayments.map((p) => (
                                <div key={p.id} className="p-3 flex items-center justify-between hover:bg-slate-50/50">
                                  <div className="flex items-center gap-3">
                                    <span className="font-mono font-bold text-blue-900 text-[11px]">{p.receiptNo}</span>
                                    <span className="font-bold text-slate-800">{p.studentName}</span>
                                    <span className="text-slate-400 font-mono text-[11px]">{p.rollNo} · {p.className}</span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 font-medium text-slate-700">
                                      {p.paymentMode}
                                    </span>
                                    <span className="font-mono font-bold text-emerald-800 text-sm">
                                      ₹{p.amountPaid.toLocaleString('en-IN')}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* REPORT C: FEE HEAD DISTRIBUTION */}
              {activeReportTab === 'head_distribution' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                    <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
                      Head-Wise Revenue Allocation Breakdown
                    </h4>
                    <div className="space-y-3 text-xs">
                      {[
                        { label: 'Academic Tuition Fees', amt: headTotals.tuition, color: 'bg-blue-600' },
                        { label: 'Hostel Boarding & Mess', amt: headTotals.hostelMess, color: 'bg-emerald-600' },
                        { label: 'Admission / Enrollment', amt: headTotals.admission, color: 'bg-purple-600' },
                        { label: 'Science Lab & Examination', amt: headTotals.labExam, color: 'bg-amber-600' },
                        { label: 'Campus Development Fund', amt: headTotals.dev, color: 'bg-teal-600' },
                        { label: 'Fines & Late Charges', amt: headTotals.fines, color: 'bg-rose-600' },
                      ].map((item) => {
                        const pct = totalCollected > 0 ? Math.round((item.amt / totalCollected) * 100) : 0;
                        return (
                          <div key={item.label} className="space-y-1">
                            <div className="flex justify-between items-center font-medium">
                              <span className="text-slate-700">{item.label}</span>
                              <span className="font-mono font-bold text-slate-900">
                                ₹{item.amt.toLocaleString('en-IN')} ({pct}%)
                              </span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full ${item.color} rounded-full`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                    <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
                      Institutional Trust Fund Audit Notes
                    </h4>
                    <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 space-y-2">
                      <p className="font-semibold">Statutory Compliance Note:</p>
                      <p className="leading-relaxed">
                        Under ASSEB Code 035371 and SAILAJA SANKKALP TRUST regulations, all mess catering fees are strictly ring-fenced for the procurement of fresh daily Satvic produce and resident scholar nourishment. Tuition allocations sustain certified faculty salaries.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Gross Realized Collections:</span>
                        <span className="font-mono font-bold text-emerald-800">₹{totalCollected.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Verified By:</span>
                        <span className="font-semibold text-slate-800">Mr. Uday Aditya Goswami (Chairman)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* REPORT D: MODE RECONCILIATION */}
              {activeReportTab === 'mode_reconciliation' && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
                  <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
                    Payment Gateway &amp; Banking Reconciliation
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs space-y-1">
                      <span className="text-purple-700 font-bold uppercase block text-[10px]">UPI / Online Gateway</span>
                      <span className="font-mono font-black text-purple-900 text-base">
                        ₹{modeTotals.upi.toLocaleString('en-IN')}
                      </span>
                      <p className="text-[11px] text-purple-600">Settled via SmartSchool Gateway</p>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs space-y-1">
                      <span className="text-blue-700 font-bold uppercase block text-[10px]">Bank NEFT / RTGS</span>
                      <span className="font-mono font-black text-blue-900 text-base">
                        ₹{modeTotals.bank.toLocaleString('en-IN')}
                      </span>
                      <p className="text-[11px] text-blue-600">Credited to SBI Gohpur A/C</p>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1">
                      <span className="text-amber-700 font-bold uppercase block text-[10px]">Physical Cash Counter</span>
                      <span className="font-mono font-black text-amber-900 text-base">
                        ₹{modeTotals.cash.toLocaleString('en-IN')}
                      </span>
                      <p className="text-[11px] text-amber-600">Vault register signed by Bursar</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 text-xs space-y-1">
                      <span className="text-slate-700 font-bold uppercase block text-[10px]">Cheque / DD</span>
                      <span className="font-mono font-black text-slate-900 text-base">
                        ₹{modeTotals.cheque.toLocaleString('en-IN')}
                      </span>
                      <p className="text-[11px] text-slate-500">Clearing through Trust Account</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 3: OUTSTANDING DUES & DEFAULTER REGISTER */}
          {/* ========================================================================= */}
          {activeSubView === 'dues_register' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 text-rose-800 uppercase">
                      Arrears &amp; Recovery Desk
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs font-semibold text-slate-700">Official Arrears Log</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    Outstanding Student Dues &amp; Pending Balance Register
                  </h3>
                  <p className="text-xs text-slate-500">
                    Scholars with pending fee balances across academic quarters and residential boarding fees.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      printDocument({
                        title: `SSN_Defaulters_And_Pending_Dues_Roster_${new Date().toISOString().slice(0, 10)}`,
                        orientation: 'landscape',
                      })
                    }
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Dues Roster</span>
                  </button>
                </div>
              </div>

              {/* Defaulters Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600 border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3">Scholar &amp; Roll No</th>
                        <th className="p-3">Class Level</th>
                        <th className="p-3">Guardian Name</th>
                        <th className="p-3">Contact Mobile</th>
                        <th className="p-3">Pending Term</th>
                        <th className="p-3 text-right">Outstanding Amount (₹)</th>
                        <th className="p-3 text-right">Demand Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {defaultersList.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-emerald-600">
                            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                            <p className="font-bold text-base">All Student Fees Fully Settled!</p>
                            <p className="text-xs text-slate-500 mt-1">There are currently zero outstanding dues across all classes.</p>
                          </td>
                        </tr>
                      ) : (
                        defaultersList.map((d) => (
                          <tr key={d.id} className="hover:bg-rose-50/40 transition-colors">
                            <td className="p-3">
                              <div className="font-bold text-slate-900">{d.studentName}</div>
                              <div className="font-mono text-slate-400 text-[11px]">{d.rollNo}</div>
                            </td>
                            <td className="p-3 font-semibold text-slate-800">{d.className}</td>
                            <td className="p-3 text-slate-700">{d.guardianName}</td>
                            <td className="p-3 font-mono">
                              <a
                                href={`tel:${d.contactPhone}`}
                                className="text-blue-900 hover:underline flex items-center gap-1 font-semibold"
                              >
                                <Phone className="w-3 h-3 text-slate-400" />
                                {d.contactPhone}
                              </a>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[10px]">
                                {d.pendingTerm}
                              </span>
                            </td>
                            <td className="p-3 text-right font-mono font-black text-rose-600 text-sm">
                              ₹{d.totalDue.toLocaleString('en-IN')}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedDuesNoticeScholar(d)}
                                className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <FileText className="w-3 h-3" />
                                <span>Print Demand Slip</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot className="bg-rose-50/60 border-t-2 border-rose-300 font-mono text-xs font-bold text-rose-950">
                      <tr>
                        <td colSpan={5} className="p-3 text-right font-sans uppercase">
                          Total Arrears Pending Recovery:
                        </td>
                        <td className="p-3 text-right font-black text-base text-rose-700">
                          ₹{defaultersList.reduce((s, d) => s + d.totalDue, 0).toLocaleString('en-IN')}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 4: STAMPED MONEY RECEIPT STUDIO */}
          {/* ========================================================================= */}
          {activeSubView === 'receipt_studio' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 uppercase">
                    Official Printing Desk
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    Stamped Fee Payment Money Receipts Studio
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dual-copy institutional slips (Student Copy + Office Ledger Copy) with security microprint, QR code, and currency in words.
                  </p>
                </div>
              </div>

              {/* Grid of Receipts Ready for Print */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all space-y-3 cursor-pointer group"
                    onClick={() => setSelectedReceiptForPrint(p)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-blue-900 group-hover:text-blue-700">
                        {p.receiptNo}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">{p.paymentDate}</span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm truncate">{p.studentName}</h4>
                      <p className="text-xs text-slate-500 font-mono">{p.rollNo} · {p.className}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Amount Paid</span>
                        <span className="font-mono font-bold text-emerald-700 text-sm">
                          ₹{p.amountPaid.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 font-bold text-[11px] flex items-center gap-1">
                        <Printer className="w-3 h-3" />
                        Print Receipt
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 5: APPROVED FEE SLABS REFERENCE */}
          {/* ========================================================================= */}
          {activeSubView === 'fee_matrix' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <h3 className="text-base font-bold text-slate-900">Approved Institutional Fee Schedule (Session 2026–27)</h3>
                <p className="text-xs text-slate-500">Official tuition, residential hostel and mess charges ratified by the Sailaja Sankkalp Trust.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feeStructures.map((fee) => (
                  <div key={fee.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="font-bold text-sm text-slate-900">{fee.className}</span>
                      <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        ₹{fee.totalAnnualFee.toLocaleString('en-IN')} / Year
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-600">
                      <div>Tuition (Monthly): ₹{fee.tuitionFeeMonthly}</div>
                      <div>Tuition (Annual): ₹{fee.tuitionFeeAnnual}</div>
                      <div>Hostel Boarding: ₹{fee.hostelBoardingFee}</div>
                      <div>Satvic Mess: ₹{fee.messCateringFee}</div>
                      <div>Exam Assessment: ₹{fee.examAssessmentFee}</div>
                      <div>Trust Development: ₹{fee.developmentFund}</div>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 font-sans">Quarterly Installment:</span>
                      <span className="font-mono font-bold text-slate-900">₹{fee.quarterlyInstallment.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: RECORD NEW FEE PAYMENT RECEIPT */}
      {/* ========================================================================= */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 md:p-8 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block">
                  Official Cashier Terminal
                </span>
                <h3 className="text-lg font-bold text-slate-900">Record Student Fee Payment &amp; Issue Receipt</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRecordModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReceipt} className="space-y-4 text-xs">
              {/* Scholar Picker */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Scholar / Student *</label>
                <select
                  required
                  value={receiptForm.studentId}
                  onChange={(e) => handleSelectScholarInForm(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="">-- Choose Enrolled Scholar --</option>
                  {enrolledStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.rollNo}) · {s.className}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment For Academic Term *</label>
                  <select
                    value={receiptForm.paymentForTerm}
                    onChange={(e) => setReceiptForm({ ...receiptForm, paymentForTerm: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    <option value="Quarter 1">Quarter 1 (Apr–Jun)</option>
                    <option value="Quarter 2">Quarter 2 (Jul–Sep)</option>
                    <option value="Quarter 3">Quarter 3 (Oct–Dec)</option>
                    <option value="Quarter 4">Quarter 4 (Jan–Mar)</option>
                    <option value="Annual Composite">Annual Composite (Full Session)</option>
                    <option value="Admission & Enrollment">Admission &amp; Enrollment</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Receipt Number *</label>
                  <input
                    type="text"
                    required
                    value={receiptForm.receiptNo}
                    onChange={(e) => setReceiptForm({ ...receiptForm, receiptNo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-blue-900"
                  />
                </div>
              </div>

              {/* Fee Breakdown Box */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Itemized Fee Heads Breakdown (₹)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Admission Fee</label>
                    <input
                      type="number"
                      value={receiptForm.admissionFee}
                      onChange={(e) => setReceiptForm({ ...receiptForm, admissionFee: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Tuition Fee</label>
                    <input
                      type="number"
                      value={receiptForm.tuitionFee}
                      onChange={(e) => setReceiptForm({ ...receiptForm, tuitionFee: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Hostel &amp; Mess</label>
                    <input
                      type="number"
                      value={receiptForm.hostelMessFee}
                      onChange={(e) => setReceiptForm({ ...receiptForm, hostelMessFee: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Lab &amp; Mock Exam</label>
                    <input
                      type="number"
                      value={receiptForm.labExamFee}
                      onChange={(e) => setReceiptForm({ ...receiptForm, labExamFee: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Development Fund</label>
                    <input
                      type="number"
                      value={receiptForm.developmentFee}
                      onChange={(e) => setReceiptForm({ ...receiptForm, developmentFee: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Late Fine / Penalty</label>
                    <input
                      type="number"
                      value={receiptForm.otherFine}
                      onChange={(e) => setReceiptForm({ ...receiptForm, otherFine: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-medium"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-700">Total Billed:</span>
                  <span className="font-mono text-sm text-slate-900">₹{formCalculatedTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Amount Paid & Live Currency Words */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount Actually Paid (₹) *</label>
                  <input
                    type="number"
                    required
                    value={receiptForm.amountPaid}
                    onChange={(e) => setReceiptForm({ ...receiptForm, amountPaid: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-emerald-50/50 border border-emerald-300 rounded-xl font-mono font-black text-sm text-emerald-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Balance Due (Remaining)</label>
                  <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-sm text-rose-600">
                    ₹{formCalculatedBalance.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Amount in words live box */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Amount In Words:</span>
                <span className="font-serif italic font-bold text-slate-900">
                  {formatCurrencyToWords(Number(receiptForm.amountPaid) || 0)}
                </span>
              </div>

              {/* Payment Mode & Reference */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Mode *</label>
                  <select
                    value={receiptForm.paymentMode}
                    onChange={(e) => setReceiptForm({ ...receiptForm, paymentMode: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="UPI / Online">UPI / Online Gateway</option>
                    <option value="Bank Transfer / NEFT">Bank Transfer / NEFT / RTGS</option>
                    <option value="Cash">Cash Counter</option>
                    <option value="Cheque / DD">Cheque / Demand Draft</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Transaction Ref / UTR *</label>
                  <input
                    type="text"
                    required
                    value={receiptForm.transactionRef}
                    onChange={(e) => setReceiptForm({ ...receiptForm, transactionRef: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReceipt}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingReceipt ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Save &amp; Generate Stamped Receipt</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: PRINT OFFICIAL STAMPED DUAL-COPY MONEY RECEIPT */}
      {/* ========================================================================= */}
      {selectedReceiptForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-3xl max-h-[94vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 md:p-8 space-y-6 print:p-0 print:border-none print:shadow-none my-6">
            <PrintActionToolbar
              documentTitle={`Official Fee Receipt: ${selectedReceiptForPrint.receiptNo} - ${selectedReceiptForPrint.studentName}`}
              badgeLabel="Official Money Receipt"
              filename={`SSN_Fee_Receipt_${selectedReceiptForPrint.receiptNo}_${selectedReceiptForPrint.studentName.replace(/\s+/g, '_')}`}
              orientation="portrait"
              onClose={() => setSelectedReceiptForPrint(null)}
            />

            {/* DUAL-COPY PRINTABLE RECEIPT CONTAINER */}
            <div className="space-y-8 print:space-y-8">
              {/* COPY 1: STUDENT / PARENT COPY */}
              <div className="p-6 border-2 border-slate-800 rounded-2xl bg-white space-y-4 relative overflow-hidden">
                <div className="absolute top-2 right-3 text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                  [ PARENT / STUDENT COPY ]
                </div>

                {/* Institutional Header */}
                <div className="text-center space-y-1 border-b-2 border-slate-900 pb-3">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-slate-600">
                    SAILAJA SANKKALP TRUST
                  </div>
                  <h1 className="text-xl font-black text-slate-950 uppercase tracking-tight font-display">
                    SANKARDEV SHIKSHA NIKETAN, GOHPUR
                  </h1>
                  <p className="text-[11px] text-slate-600">
                    Bapadev Kshetra, Solengi, P.O: Govinda Elengisatra, Biswanath, Assam – 784168 · School Code: 035371
                  </p>
                  <div className="inline-block px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-900 text-[11px] font-bold border border-emerald-300 mt-1 uppercase">
                    Official Fee Payment Receipt &amp; Acknowledgment Voucher
                  </div>
                </div>

                {/* Receipt Meta Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl text-xs border border-slate-200 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-sans">Receipt No</span>
                    <span className="font-bold text-blue-950 text-sm">{selectedReceiptForPrint.receiptNo}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-sans">Date of Payment</span>
                    <span className="font-bold text-slate-900">{selectedReceiptForPrint.paymentDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-sans">Scholar Roll No</span>
                    <span className="font-bold text-slate-900">{selectedReceiptForPrint.rollNo}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-sans">Payment Term</span>
                    <span className="font-bold text-emerald-800">{selectedReceiptForPrint.paymentForTerm}</span>
                  </div>
                </div>

                {/* Student Details */}
                <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                  <div>
                    <span className="text-slate-500 block">Student Full Name:</span>
                    <span className="font-bold text-slate-950 text-sm">{selectedReceiptForPrint.studentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Class &amp; Stream:</span>
                    <span className="font-semibold text-slate-900">{selectedReceiptForPrint.className} ({selectedReceiptForPrint.stream || 'Standard'})</span>
                  </div>
                </div>

                {/* Breakdown Table */}
                <table className="w-full text-xs border-collapse font-sans">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-700 text-[11px] font-bold">
                      <th className="py-1 text-left">Sl.</th>
                      <th className="py-1 text-left">Particulars / Fee Head Description</th>
                      <th className="py-1 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    <tr>
                      <td className="py-1 text-slate-400">01</td>
                      <td className="py-1 font-sans text-slate-800">Admission / Re-enrollment Fee</td>
                      <td className="py-1 text-right">₹{(selectedReceiptForPrint.feeBreakdown?.admissionFee || 0).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-slate-400">02</td>
                      <td className="py-1 font-sans text-slate-800">Academic Tuition Instruction</td>
                      <td className="py-1 text-right">₹{(selectedReceiptForPrint.feeBreakdown?.tuitionFee || 0).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-slate-400">03</td>
                      <td className="py-1 font-sans text-slate-800">Residential Hostel Boarding &amp; Satvic Mess</td>
                      <td className="py-1 text-right">₹{(selectedReceiptForPrint.feeBreakdown?.hostelMessFee || 0).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-slate-400">04</td>
                      <td className="py-1 font-sans text-slate-800">Science Labs &amp; Term Assessment</td>
                      <td className="py-1 text-right">₹{(selectedReceiptForPrint.feeBreakdown?.labExamFee || 0).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-slate-400">05</td>
                      <td className="py-1 font-sans text-slate-800">Campus Trust Development &amp; Infirmary</td>
                      <td className="py-1 text-right">₹{(selectedReceiptForPrint.feeBreakdown?.developmentFee || 0).toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-900 bg-slate-50 font-mono text-xs">
                      <td colSpan={2} className="py-1.5 font-bold text-slate-900 font-sans text-right pr-4">
                        TOTAL AMOUNT RECEIVED:
                      </td>
                      <td className="py-1.5 text-right font-black text-emerald-800 text-sm">
                        ₹{selectedReceiptForPrint.amountPaid.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {/* Amount in words */}
                <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs">
                  <span className="text-[10px] font-bold text-emerald-950 uppercase tracking-wider block">
                    Amount Received In Words:
                  </span>
                  <span className="font-serif italic font-bold text-emerald-900 text-sm">
                    {formatCurrencyToWords(selectedReceiptForPrint.amountPaid)}
                  </span>
                </div>

                {/* Mode & Transaction Details */}
                <div className="flex items-center justify-between text-xs text-slate-600 font-mono pt-1">
                  <div>
                    Payment Mode: <strong className="font-sans text-slate-900">{selectedReceiptForPrint.paymentMode}</strong> · Ref: <strong>{selectedReceiptForPrint.transactionRef}</strong>
                  </div>
                  <div>
                    Balance Due: <strong className="text-rose-600">₹{selectedReceiptForPrint.balanceDue.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                {/* Signatures */}
                <div className="pt-6 grid grid-cols-2 text-center text-xs text-slate-600 font-sans">
                  <div className="border-t border-slate-300 pt-1">
                    <span className="font-medium">{selectedReceiptForPrint.cashierName || 'Accounts Bursar'}</span>
                    <span className="block text-[10px] text-slate-400">Cashier / Bursar Signature</span>
                  </div>
                  <div className="border-t border-slate-300 pt-1 font-bold text-slate-900">
                    Principal / Chairman Seal
                    <span className="block text-[10px] font-normal text-slate-400">Sailaja Sankkalp Trust</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>SSN/ACCTS/RCP/{selectedReceiptForPrint.receiptNo}</span>
                  <span>{getInstitutionalVerificationTimestamp()}</span>
                </div>
              </div>

              {/* COPY 2: INSTITUTIONAL OFFICE / AUDIT RECORD COPY */}
              <div className="p-6 border-2 border-dashed border-slate-400 rounded-2xl bg-slate-50/30 space-y-3 relative overflow-hidden">
                <div className="absolute top-2 right-3 text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
                  [ INSTITUTIONAL AUDIT &amp; OFFICE COPY ]
                </div>

                <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                  <div>
                    <h3 className="font-bold text-slate-950 text-sm uppercase">Sankardev Shiksha Niketan, Gohpur</h3>
                    <p className="text-[10px] text-slate-500 font-mono">Accounts Office Archive · Bapadev Kshetra, Solengi</p>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <span className="font-bold text-blue-950 block">{selectedReceiptForPrint.receiptNo}</span>
                    <span className="text-slate-500 text-[10px]">{selectedReceiptForPrint.paymentDate}</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Scholar</span>
                    <strong className="text-slate-900">{selectedReceiptForPrint.studentName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Roll / Class</span>
                    <span className="font-mono text-slate-700">{selectedReceiptForPrint.rollNo} · {selectedReceiptForPrint.className}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Term &amp; Mode</span>
                    <span className="font-semibold text-slate-700">{selectedReceiptForPrint.paymentForTerm} · {selectedReceiptForPrint.paymentMode}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-sans">Amount Received</span>
                    <span className="font-mono font-black text-emerald-800 text-sm">₹{selectedReceiptForPrint.amountPaid.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-300 flex items-center justify-between text-xs text-slate-600">
                  <div className="text-[10px] font-mono text-slate-500">
                    Ref: {selectedReceiptForPrint.transactionRef} · Balance: ₹{selectedReceiptForPrint.balanceDue}
                  </div>
                  <div className="text-[11px] font-bold text-slate-800">
                    Accounts Office Entry Verified
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: PRINT FORMAL DUES CLEARANCE NOTICE / DEMAND LETTER */}
      {/* ========================================================================= */}
      {selectedDuesNoticeScholar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 md:p-8 space-y-6 print:p-0 print:border-none print:shadow-none my-6">
            <PrintActionToolbar
              documentTitle={`Official Dues Notice: ${selectedDuesNoticeScholar.studentName}`}
              badgeLabel="Formal Demand Letter"
              filename={`SSN_Dues_Demand_Notice_${selectedDuesNoticeScholar.studentName.replace(/\s+/g, '_')}`}
              orientation="portrait"
              onClose={() => setSelectedDuesNoticeScholar(null)}
            />

            {/* Printable Institutional Demand Letter */}
            <div className="p-8 border border-slate-300 rounded-2xl bg-white space-y-5 text-slate-800 text-xs leading-relaxed">
              {/* Institution Letterhead */}
              <div className="text-center space-y-1 border-b-2 border-slate-900 pb-4">
                <div className="text-[11px] font-bold uppercase tracking-widest text-slate-600">
                  SAILAJA SANKKALP TRUST
                </div>
                <h2 className="text-xl font-black text-slate-950 uppercase font-display tracking-tight">
                  SANKARDEV SHIKSHA NIKETAN, GOHPUR
                </h2>
                <p className="text-[11px] text-slate-600">
                  Bapadev Kshetra, Solengi, P.O: Govinda Elengisatra, Biswanath, Assam – 784168
                </p>
                <p className="text-[10px] font-mono text-slate-500">
                  School Code: 035371 · ASSEB Affiliation No: 035371 · Contact: +91 9954656161
                </p>
              </div>

              {/* Reference & Date */}
              <div className="flex items-center justify-between font-mono text-[11px] text-slate-600">
                <span>Ref No: SSN/ACCTS/DEMAND/2026/0{Math.floor(100 + Math.random() * 900)}</span>
                <span>Date: {new Date().toISOString().slice(0, 10)}</span>
              </div>

              {/* Recipient Box */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div>To,</div>
                <div className="font-bold text-slate-900 text-sm">
                  The Parent / Guardian of {selectedDuesNoticeScholar.studentName} ({selectedDuesNoticeScholar.guardianName})
                </div>
                <div>Scholar Roll No: <strong>{selectedDuesNoticeScholar.rollNo}</strong> · Class: <strong>{selectedDuesNoticeScholar.className}</strong></div>
                <div>Contact Mobile: <strong>{selectedDuesNoticeScholar.contactPhone}</strong></div>
              </div>

              {/* Subject */}
              <div className="font-bold text-slate-950 text-sm uppercase underline">
                Subject: Formal Intimation of Outstanding Institutional Fees &amp; Hostel Arrears (Session 2026–27)
              </div>

              {/* Body */}
              <p>
                Respected Parent / Guardian,
              </p>
              <p>
                This is a formal communication from the Office of Accounts and Finance, Sankardev Shiksha Niketan, Gohpur. As per our institutional records, the outstanding fee balance detailed below is currently pending against your ward for the ongoing academic session:
              </p>

              {/* Arrears Breakdown Table */}
              <div className="border border-slate-300 rounded-xl overflow-hidden font-mono">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Particulars</th>
                      <th className="p-2.5">Academic Term</th>
                      <th className="p-2.5 text-right">Outstanding Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2.5 font-sans font-medium text-slate-800">
                        Academic Tuition, Hostel Boarding &amp; Satvic Mess
                      </td>
                      <td className="p-2.5 font-bold text-slate-700">
                        {selectedDuesNoticeScholar.pendingTerm}
                      </td>
                      <td className="p-2.5 text-right font-black text-rose-700 text-sm">
                        ₹{selectedDuesNoticeScholar.totalDue.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* In Words */}
              <div className="p-2.5 rounded-lg bg-rose-50/60 border border-rose-200 text-xs">
                <span className="font-bold text-rose-950">Amount in Words: </span>
                <span className="font-serif italic font-bold text-rose-900">
                  {formatCurrencyToWords(selectedDuesNoticeScholar.totalDue)}
                </span>
              </div>

              {/* Bank Account Details */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">Bank Remittance Instructions:</span>
                <p className="text-[11px] text-slate-600">
                  You are kindly requested to clear the outstanding dues within 7 working days via Online UPI or direct Bank Transfer into the official school trust account:
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                  <div>A/C Name: <strong>Sankardev Shishu Vidya Niketan</strong></div>
                  <div>Bank: <strong>State Bank of India (Gohpur)</strong></div>
                  <div>A/C Number: <strong>38472910482</strong></div>
                  <div>IFSC Code: <strong>SBIN0002061</strong></div>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-8 grid grid-cols-2 text-center text-xs text-slate-600 font-sans">
                <div className="border-t border-slate-300 pt-1">
                  <span className="font-medium">Sri Dhireswar Borkotoky</span>
                  <span className="block text-[10px] text-slate-400">Accounts Officer / Bursar</span>
                </div>
                <div className="border-t border-slate-300 pt-1 font-bold text-slate-900">
                  Mr. Uday Aditya Goswami
                  <span className="block text-[10px] font-normal text-slate-400">Founder &amp; Chairman, Sailaja Sankkalp Trust</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
