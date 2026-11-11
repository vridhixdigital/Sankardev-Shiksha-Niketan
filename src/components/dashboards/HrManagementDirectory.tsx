import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  DollarSign,
  Calendar,
  FileText,
  Printer,
  CheckCircle2,
  XCircle,
  Clock,
  Briefcase,
  Building2,
  Phone,
  Mail,
  Edit3,
  Trash2,
  Plus,
  CreditCard,
  Award,
  Sparkles,
  Download,
  AlertCircle,
  IdCard,
} from 'lucide-react';
import { HrStaffDoc, HrPayrollDoc, HrLeaveDoc, SchoolAdminSettingsDoc } from '../../types/erp';
import { printDocument, formatCurrencyToWords, getInstitutionalVerificationTimestamp } from '../../utils/printDocument';
import { PrintActionToolbar } from '../common/PrintActionToolbar';

interface HrManagementDirectoryProps {
  hrStaff: HrStaffDoc[];
  hrPayroll: HrPayrollDoc[];
  hrLeaves: HrLeaveDoc[];
  schoolSettings?: SchoolAdminSettingsDoc;
  onAddStaff?: (staff: Partial<HrStaffDoc>) => Promise<void>;
  onUpdateStaff?: (id: string, updates: Partial<HrStaffDoc>) => Promise<void>;
  onDeleteStaff?: (id: string) => Promise<void>;
  onAddPayroll?: (payroll: Partial<HrPayrollDoc>) => Promise<void>;
  onUpdatePayroll?: (id: string, updates: Partial<HrPayrollDoc>) => Promise<void>;
  onDeletePayroll?: (id: string) => Promise<void>;
  onAddLeave?: (leave: Partial<HrLeaveDoc>) => Promise<void>;
  onUpdateLeave?: (id: string, updates: Partial<HrLeaveDoc>) => Promise<void>;
  onDeleteLeave?: (id: string) => Promise<void>;
}

export const HrManagementDirectory: React.FC<HrManagementDirectoryProps> = ({
  hrStaff,
  hrPayroll,
  hrLeaves,
  schoolSettings,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
  onAddPayroll,
  onUpdatePayroll,
  onDeletePayroll,
  onAddLeave,
  onUpdateLeave,
  onDeleteLeave,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'staff' | 'payroll' | 'leaves' | 'id_cards'>('staff');

  // Search & Filter state
  const [staffSearch, setStaffSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [payrollMonthFilter, setPayrollMonthFilter] = useState('all');
  const [payrollStatusFilter, setPayrollStatusFilter] = useState('all');

  // Modals state
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<HrStaffDoc | null>(null);

  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<HrPayrollDoc | null>(null);

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState<HrLeaveDoc | null>(null);

  const [selectedPayslipForPrint, setSelectedPayslipForPrint] = useState<HrPayrollDoc | null>(null);
  const [selectedStaffForIdCard, setSelectedStaffForIdCard] = useState<HrStaffDoc | null>(null);

  // Staff Form State
  const [staffForm, setStaffForm] = useState({
    employeeId: '',
    fullName: '',
    designation: '',
    department: 'Department of Science & Computing',
    qualification: '',
    dateOfJoining: '2024-04-01',
    employmentType: 'Permanent' as HrStaffDoc['employmentType'],
    phone: '',
    email: '',
    panNumber: '',
    bankAccountNo: '',
    bankName: 'State Bank of India, Gohpur',
    ifscCode: 'SBIN0002061',
    basicSalary: 45000,
    daPercent: 12,
    hraAmount: 6750,
    specialAllowance: 3500,
    epfDeduction: 2700,
    profTax: 200,
    status: 'active' as HrStaffDoc['status'],
    photoUrl: '',
    address: 'Bapadev Kshetra, Solengi, Gohpur',
    emergencyContact: '+91 9954656161',
    portalLoginEmail: '',
    portalInitialPassword: '',
  });

  // Payroll Generation Form State
  const [payrollForm, setPayrollForm] = useState({
    month: 'March 2026',
    staffId: '',
    daysWorked: 30,
    totalDays: 30,
    leaveDeduction: 0,
    paymentStatus: 'paid' as HrPayrollDoc['paymentStatus'],
    paymentMode: 'Bank Transfer' as HrPayrollDoc['paymentMode'],
    transactionRef: 'NEFT-SSN-' + Math.floor(100000 + Math.random() * 900000),
    paymentDate: new Date().toISOString().slice(0, 10),
  });

  // Leave Form State
  const [leaveForm, setLeaveForm] = useState({
    staffId: '',
    leaveType: 'Casual Leave (CL)' as HrLeaveDoc['leaveType'],
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    totalDays: 1,
    reason: '',
    substituteTeacher: '',
    status: 'pending' as HrLeaveDoc['status'],
    reviewRemarks: '',
  });

  // Departments list from staff
  const departmentsList = useMemo(() => {
    const set = new Set(hrStaff.map((s) => s.department));
    return Array.from(set);
  }, [hrStaff]);

  // Months list from payroll
  const payrollMonthsList = useMemo(() => {
    const set = new Set(hrPayroll.map((p) => p.month));
    return Array.from(set);
  }, [hrPayroll]);

  // Filtered staff
  const filteredStaff = useMemo(() => {
    return hrStaff.filter((s) => {
      const matchSearch =
        !staffSearch.trim() ||
        s.fullName.toLowerCase().includes(staffSearch.toLowerCase()) ||
        s.employeeId.toLowerCase().includes(staffSearch.toLowerCase()) ||
        s.designation.toLowerCase().includes(staffSearch.toLowerCase());
      const matchDept = deptFilter === 'all' || s.department === deptFilter;
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchSearch && matchDept && matchStatus;
    });
  }, [hrStaff, staffSearch, deptFilter, statusFilter]);

  // Filtered payroll
  const filteredPayroll = useMemo(() => {
    return hrPayroll.filter((p) => {
      const matchMonth = payrollMonthFilter === 'all' || p.month === payrollMonthFilter;
      const matchStatus = payrollStatusFilter === 'all' || p.paymentStatus === payrollStatusFilter;
      return matchMonth && matchStatus;
    });
  }, [hrPayroll, payrollMonthFilter, payrollStatusFilter]);

  // Payroll Metrics
  const payrollMetrics = useMemo(() => {
    const totalGross = filteredPayroll.reduce((acc, p) => acc + (p.grossSalary || 0), 0);
    const totalNet = filteredPayroll.reduce((acc, p) => acc + (p.netSalary || 0), 0);
    const totalEpf = filteredPayroll.reduce((acc, p) => acc + (p.epfDeduction || 0), 0);
    const totalPtax = filteredPayroll.reduce((acc, p) => acc + (p.profTax || 0), 0);
    return { totalGross, totalNet, totalEpf, totalPtax };
  }, [filteredPayroll]);

  // Reset Staff Form
  const handleOpenAddStaff = () => {
    setEditingStaff(null);
    setStaffForm({
      employeeId: `SSN-FAC-${100 + hrStaff.length + 1}`,
      fullName: '',
      designation: 'Lecturer / PGT Faculty',
      department: departmentsList[0] || 'Department of Science & Computing',
      qualification: 'M.Sc. / M.A., B.Ed',
      dateOfJoining: new Date().toISOString().slice(0, 10),
      employmentType: 'Permanent',
      phone: '+91 ',
      email: '',
      panNumber: '',
      bankAccountNo: '',
      bankName: 'State Bank of India, Gohpur',
      ifscCode: 'SBIN0002061',
      basicSalary: 42000,
      daPercent: 12,
      hraAmount: 6300,
      specialAllowance: 3500,
      epfDeduction: 2520,
      profTax: 200,
      status: 'active',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      address: 'Bapadev Kshetra, Solengi, Gohpur',
      emergencyContact: '+91 9954656161',
      portalLoginEmail: '',
      portalInitialPassword: '',
    });
    setIsStaffModalOpen(true);
  };

  const handleOpenEditStaff = (staff: HrStaffDoc) => {
    setEditingStaff(staff);
    setStaffForm({
      employeeId: staff.employeeId,
      fullName: staff.fullName,
      designation: staff.designation,
      department: staff.department,
      qualification: staff.qualification,
      dateOfJoining: staff.dateOfJoining,
      employmentType: staff.employmentType,
      phone: staff.phone,
      email: staff.email,
      panNumber: staff.panNumber,
      bankAccountNo: staff.bankAccountNo,
      bankName: staff.bankName,
      ifscCode: staff.ifscCode,
      basicSalary: staff.basicSalary,
      daPercent: staff.daPercent,
      hraAmount: staff.hraAmount,
      specialAllowance: staff.specialAllowance,
      epfDeduction: staff.epfDeduction,
      profTax: staff.profTax,
      status: staff.status,
      photoUrl: staff.photoUrl || '',
      address: staff.address,
      emergencyContact: staff.emergencyContact,
      portalLoginEmail: staff.portalLoginEmail || staff.email || '',
      portalInitialPassword: staff.portalInitialPassword || '',
    });
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.fullName.trim() || !staffForm.employeeId.trim()) return;

    if (editingStaff && onUpdateStaff) {
      await onUpdateStaff(editingStaff.id, staffForm);
    } else if (!editingStaff && onAddStaff) {
      await onAddStaff(staffForm);
    }
    setIsStaffModalOpen(false);
  };

  // Open Payroll Generator
  const handleOpenAddPayroll = () => {
    const firstStaff = hrStaff[0];
    setEditingPayroll(null);
    setPayrollForm({
      month: 'April 2026',
      staffId: firstStaff ? firstStaff.id : '',
      daysWorked: 30,
      totalDays: 30,
      leaveDeduction: 0,
      paymentStatus: 'paid',
      paymentMode: 'Bank Transfer',
      transactionRef: 'NEFT-SSN-' + Math.floor(100000 + Math.random() * 900000),
      paymentDate: new Date().toISOString().slice(0, 10),
    });
    setIsPayrollModalOpen(true);
  };

  const handleSavePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetStaff = hrStaff.find((s) => s.id === payrollForm.staffId);
    if (!targetStaff) return;

    const daAmount = Math.round((targetStaff.basicSalary * targetStaff.daPercent) / 100);
    const grossSalary = targetStaff.basicSalary + daAmount + targetStaff.hraAmount + targetStaff.specialAllowance;
    const netSalary = grossSalary - targetStaff.epfDeduction - targetStaff.profTax - Number(payrollForm.leaveDeduction || 0);

    const payload: Partial<HrPayrollDoc> = {
      month: payrollForm.month,
      staffId: targetStaff.id,
      staffName: targetStaff.fullName,
      employeeId: targetStaff.employeeId,
      designation: targetStaff.designation,
      department: targetStaff.department,
      bankAccountNo: targetStaff.bankAccountNo,
      bankName: targetStaff.bankName,
      ifscCode: targetStaff.ifscCode,
      panNumber: targetStaff.panNumber,
      daysWorked: Number(payrollForm.daysWorked),
      totalDays: Number(payrollForm.totalDays),
      basicPay: targetStaff.basicSalary,
      daAmount,
      hraAmount: targetStaff.hraAmount,
      specialAllowance: targetStaff.specialAllowance,
      grossSalary,
      epfDeduction: targetStaff.epfDeduction,
      profTax: targetStaff.profTax,
      leaveDeduction: Number(payrollForm.leaveDeduction || 0),
      netSalary,
      paymentDate: payrollForm.paymentDate,
      paymentStatus: payrollForm.paymentStatus,
      paymentMode: payrollForm.paymentMode,
      transactionRef: payrollForm.transactionRef,
    };

    if (editingPayroll && onUpdatePayroll) {
      await onUpdatePayroll(editingPayroll.id, payload);
    } else if (!editingPayroll && onAddPayroll) {
      await onAddPayroll(payload);
    }
    setIsPayrollModalOpen(false);
  };

  // Open Leave Form
  const handleOpenAddLeave = () => {
    const firstStaff = hrStaff[0];
    setEditingLeave(null);
    setLeaveForm({
      staffId: firstStaff ? firstStaff.id : '',
      leaveType: 'Casual Leave (CL)',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date().toISOString().slice(0, 10),
      totalDays: 1,
      reason: 'Personal urgent family commitment at native village.',
      substituteTeacher: '',
      status: 'pending',
      reviewRemarks: '',
    });
    setIsLeaveModalOpen(true);
  };

  const handleSaveLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetStaff = hrStaff.find((s) => s.id === leaveForm.staffId);
    if (!targetStaff) return;

    const payload: Partial<HrLeaveDoc> = {
      staffId: targetStaff.id,
      staffName: targetStaff.fullName,
      designation: targetStaff.designation,
      department: targetStaff.department,
      leaveType: leaveForm.leaveType,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      totalDays: Number(leaveForm.totalDays) || 1,
      reason: leaveForm.reason,
      substituteTeacher: leaveForm.substituteTeacher,
      status: leaveForm.status,
      appliedAt: new Date().toISOString().slice(0, 10),
      reviewRemarks: leaveForm.reviewRemarks,
      reviewedBy: 'Mr. Uday Aditya Goswami (Chairman)',
    };

    if (editingLeave && onUpdateLeave) {
      await onUpdateLeave(editingLeave.id, payload);
    } else if (!editingLeave && onAddLeave) {
      await onAddLeave(payload);
    }
    setIsLeaveModalOpen(false);
  };

  const handleApproveLeave = async (leave: HrLeaveDoc) => {
    if (onUpdateLeave) {
      await onUpdateLeave(leave.id, {
        status: 'approved',
        reviewedBy: 'Chairman / Principal',
        reviewRemarks: 'Sanctioned with substitute duty coverage verified.',
      });
    }
  };

  const handleRejectLeave = async (leave: HrLeaveDoc) => {
    const remarks = prompt('Enter reason for leave rejection:');
    if (remarks !== null && onUpdateLeave) {
      await onUpdateLeave(leave.id, {
        status: 'rejected',
        reviewedBy: 'Chairman / Principal',
        reviewRemarks: remarks || 'Declined due to ongoing ASSEB practical examinations.',
      });
    }
  };

  const handleUpdatePaymentStatus = async (payroll: HrPayrollDoc, newStatus: HrPayrollDoc['paymentStatus']) => {
    if (onUpdatePayroll) {
      await onUpdatePayroll(payroll.id, {
        paymentStatus: newStatus,
        paymentDate: new Date().toISOString().slice(0, 10),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/30 border border-blue-400/40 rounded-full w-fit text-xs font-semibold uppercase tracking-wider mb-2">
              <Briefcase className="w-3.5 h-3.5 text-blue-300" />
              Human Resources &amp; Institutional Personnel
            </div>
            <h2 className="text-2xl font-bold tracking-tight">HR Personnel, Payroll &amp; Faculty Master</h2>
            <p className="text-blue-100 text-sm mt-1 max-w-2xl">
              Complete faculty roster, salary structure, real-time EPF &amp; tax deductions, printable bank payslips, academic leave sanctioning, and institutional photo ID cards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenAddStaff}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Add Staff
            </button>
            <button
              onClick={handleOpenAddPayroll}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              <DollarSign className="w-4 h-4" />
              Generate Payslip
            </button>
            <button
              onClick={handleOpenAddLeave}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              Apply Leave
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-700/60 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('staff')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'staff'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Staff Directory ({hrStaff.length})
          </button>
          <button
            onClick={() => setActiveSubTab('payroll')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'payroll'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Payroll &amp; Salary Slips ({hrPayroll.length})
          </button>
          <button
            onClick={() => setActiveSubTab('leaves')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'leaves'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Leave Management ({hrLeaves.length})
          </button>
          <button
            onClick={() => setActiveSubTab('id_cards')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'id_cards'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <IdCard className="w-3.5 h-3.5" />
            Staff Photo ID Cards
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: STAFF ROSTER MASTER */}
      {activeSubTab === 'staff' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
                placeholder="Search staff by name, ID or post..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
              >
                <option value="all">All Departments</option>
                {departmentsList.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="on_leave">On Leave</option>
                <option value="resigned">Resigned</option>
                <option value="retired">Retired</option>
              </select>
            </div>
          </div>

          {/* Staff Roster Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStaff.map((staff) => (
              <div
                key={staff.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-2xs">
                    <img
                      src={staff.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                      alt={staff.fullName}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md">
                        {staff.employeeId}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          staff.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : staff.status === 'on_leave'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {staff.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mt-1 truncate">{staff.fullName}</h4>
                    <p className="text-xs text-slate-600 font-medium truncate">{staff.designation}</p>
                    <p className="text-[11px] text-slate-400 truncate">{staff.department}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Joining Date:</span>
                    <span className="font-medium text-slate-800">{staff.dateOfJoining}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Monthly Basic:</span>
                    <span className="font-bold text-slate-900">₹{staff.basicSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bank / A/C:</span>
                    <span className="font-mono text-[11px]">{staff.bankAccountNo.slice(-6).padStart(staff.bankAccountNo.length, '•')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">PAN / EPF:</span>
                    <span className="font-mono text-[11px]">{staff.panNumber || 'NA'} · ₹{staff.epfDeduction}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setSelectedStaffForIdCard(staff);
                      setActiveSubTab('id_cards');
                    }}
                    className="text-xs text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <IdCard className="w-3.5 h-3.5" />
                    ID Card
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditStaff(staff)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Staff Record"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {onDeleteStaff && (
                      <button
                        onClick={() => {
                          if (confirm(`Remove staff ${staff.fullName} from personnel roster?`)) {
                            onDeleteStaff(staff.id);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Staff"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: PAYROLL & SALARY SLIPS */}
      {activeSubTab === 'payroll' && (
        <div className="space-y-6">
          {/* Summary Metric Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Gross Salaries</span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">₹{payrollMetrics.totalGross.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-emerald-600">Net Disbursement</span>
              <p className="text-xl font-extrabold text-emerald-700 mt-1">₹{payrollMetrics.totalNet.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-blue-600">EPF Corpus Withheld</span>
              <p className="text-xl font-extrabold text-blue-700 mt-1">₹{payrollMetrics.totalEpf.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-amber-600">Professional Tax</span>
              <p className="text-xl font-extrabold text-amber-700 mt-1">₹{payrollMetrics.totalPtax.toLocaleString()}</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={payrollMonthFilter}
                onChange={(e) => setPayrollMonthFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold"
              >
                <option value="all">All Months</option>
                {payrollMonthsList.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={payrollStatusFilter}
                onChange={(e) => setPayrollStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
              >
                <option value="all">All Payment Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
              </select>
            </div>

            <button
              onClick={handleOpenAddPayroll}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Generate Monthly Payslip
            </button>
          </div>

          {/* Payroll Vouchers Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Staff &amp; Emp ID</th>
                    <th className="p-3.5">Month</th>
                    <th className="p-3.5">Basic Pay</th>
                    <th className="p-3.5">DA + HRA + Spl</th>
                    <th className="p-3.5">Gross Pay</th>
                    <th className="p-3.5">EPF / Tax</th>
                    <th className="p-3.5">Net Salary</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayroll.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{item.staffName}</div>
                        <div className="text-[11px] font-mono text-blue-700">{item.employeeId} · {item.designation}</div>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-800">{item.month}</td>
                      <td className="p-3.5 font-mono">₹{item.basicPay.toLocaleString()}</td>
                      <td className="p-3.5 font-mono text-slate-600">
                        ₹{(item.daAmount + item.hraAmount + item.specialAllowance).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-900">₹{item.grossSalary.toLocaleString()}</td>
                      <td className="p-3.5 font-mono text-rose-600">
                        -₹{(item.epfDeduction + item.profTax + item.leaveDeduction).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-mono font-extrabold text-emerald-700 text-sm">
                        ₹{item.netSalary.toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            item.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : item.paymentStatus === 'processing'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {item.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        <button
                          onClick={() => setSelectedPayslipForPrint(item)}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                          title="Print / View Official PDF Payslip"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Payslip
                        </button>
                        {item.paymentStatus !== 'paid' && (
                          <button
                            onClick={() => handleUpdatePaymentStatus(item, 'paid')}
                            className="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg font-bold text-[11px] cursor-pointer"
                          >
                            Mark Paid
                          </button>
                        )}
                        {onDeletePayroll && (
                          <button
                            onClick={() => {
                              if (confirm('Delete this payroll record?')) {
                                onDeletePayroll(item.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredPayroll.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        No payroll vouchers found for the selected period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: LEAVE MANAGEMENT & DUTY SANCTIONS */}
      {activeSubTab === 'leaves' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Faculty Leave Requests &amp; Academic Duties</h3>
              <p className="text-xs text-slate-500">Review, scrutinize, and sanction faculty casual, medical, and academic duty leaves.</p>
            </div>
            <button
              onClick={handleOpenAddLeave}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Apply Leave
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hrLeaves.map((leave) => (
              <div
                key={leave.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                      {leave.leaveType}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1.5">{leave.staffName}</h4>
                    <p className="text-xs text-slate-500">{leave.designation} · {leave.department}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                      leave.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : leave.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {leave.status}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5 text-slate-700">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">Duration:</span>
                    <span>{leave.startDate} to {leave.endDate} ({leave.totalDays} days)</span>
                  </div>
                  <div className="text-slate-600 italic">
                    "{leave.reason}"
                  </div>
                  {leave.substituteTeacher && (
                    <div className="text-[11px] text-blue-800 font-semibold pt-1 border-t border-slate-200/60">
                      Substitute Duty: {leave.substituteTeacher}
                    </div>
                  )}
                  {leave.reviewRemarks && (
                    <div className="text-[11px] text-emerald-800 font-medium">
                      Admin Remarks: {leave.reviewRemarks}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">Applied: {leave.appliedAt}</span>
                  <div className="flex items-center gap-1.5">
                    {leave.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApproveLeave(leave)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectLeave(leave)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </>
                    )}
                    {onDeleteLeave && (
                      <button
                        onClick={() => {
                          if (confirm('Delete this leave application?')) {
                            onDeleteLeave(leave.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: STAFF PHOTO ID CARDS */}
      {activeSubTab === 'id_cards' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Official Institutional Staff Photo ID Card</h3>
              <p className="text-xs text-slate-500">Generate, inspect, and print dual-sided institutional security credentials.</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedStaffForIdCard?.id || hrStaff[0]?.id || ''}
                onChange={(e) => {
                  const target = hrStaff.find((s) => s.id === e.target.value);
                  if (target) setSelectedStaffForIdCard(target);
                }}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                {hrStaff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.employeeId})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  const cardStaff = selectedStaffForIdCard || hrStaff[0];
                  printDocument({
                    title: `SSN_StaffID_${cardStaff?.employeeId || 'Card'}`,
                    filename: `SSN_StaffID_${(cardStaff?.fullName || 'Staff').replace(/\s+/g, '_')}_${cardStaff?.employeeId || ''}`,
                  });
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Print ID Card
              </button>
            </div>
          </div>

          {/* ID Card Preview */}
          {(() => {
            const cardStaff = selectedStaffForIdCard || hrStaff[0];
            if (!cardStaff) return null;
            return (
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-6">
                {/* Front Side */}
                <div className="w-80 h-[480px] rounded-3xl bg-white border-2 border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between relative p-6 text-center">
                  <div className="space-y-1 border-b border-slate-200 pb-3">
                    <div className="text-[10px] font-bold text-blue-900 uppercase tracking-wider">
                      {schoolSettings?.trustName || 'SAILAJA SANKKALP TRUST'}
                    </div>
                    <h4 className="text-xs font-extrabold text-slate-900 leading-tight">
                      SANKARDEV SHIKSHA NIKETAN, GOHPUR
                    </h4>
                    <p className="text-[9px] text-slate-500">School Code: 035371 · Bapadev Kshetra, Solengi</p>
                  </div>

                  <div className="flex flex-col items-center space-y-2 py-2">
                    <div className="w-24 h-28 rounded-xl overflow-hidden border-2 border-blue-900 bg-slate-100 shadow-sm">
                      <img
                        src={cardStaff.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                        alt={cardStaff.fullName}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <h5 className="font-extrabold text-slate-900 text-base leading-snug">{cardStaff.fullName}</h5>
                    <div className="px-3 py-1 bg-blue-100 text-blue-900 text-xs font-bold rounded-full">
                      {cardStaff.designation}
                    </div>
                    <div className="text-[11px] text-slate-600 font-semibold">{cardStaff.department}</div>
                  </div>

                  <div className="space-y-1 text-left text-[11px] text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">ID No:</span>
                      <span className="font-bold text-slate-900">{cardStaff.employeeId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Blood Group:</span>
                      <span className="font-bold text-rose-700">O+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Valid Till:</span>
                      <span className="font-bold">31-03-2027</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-end">
                    <div className="text-[8px] font-mono text-slate-400">STAFF CREDENTIAL</div>
                    <div className="text-center">
                      <div className="font-serif italic text-xs font-bold text-blue-950">Uday A. Goswami</div>
                      <div className="text-[8px] font-bold text-slate-500 uppercase">Chairman / Authority</div>
                    </div>
                  </div>
                </div>

                {/* Back Side */}
                <div className="w-80 h-[480px] rounded-3xl bg-slate-900 text-white shadow-xl overflow-hidden flex flex-col justify-between p-6 text-center border-2 border-slate-800">
                  <div className="space-y-1 border-b border-slate-700 pb-3">
                    <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      TERMS &amp; SECURITY PROTOCOLS
                    </h5>
                    <p className="text-[9px] text-slate-300">Property of Sankardev Shiksha Niketan</p>
                  </div>

                  <div className="space-y-3 text-left text-[11px] text-slate-300 py-2">
                    <p>• This credential card is non-transferable and must be prominently displayed while on Bapadev Kshetra campus.</p>
                    <p>• Grants authorized access to faculty research wings, science laboratories, academic chambers, and hostels.</p>
                    <p>• If found, kindly return to: Office of the Principal, SSN Gohpur, Biswanath - 784168.</p>
                    <div className="pt-2 border-t border-slate-700 text-[10px] space-y-1">
                      <div><strong>Emergency Contact:</strong> {cardStaff.emergencyContact}</div>
                      <div><strong>Office Phone:</strong> +91 99546 56161</div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-800 rounded-xl flex items-center justify-center space-x-2">
                    <div className="w-full text-center font-mono text-[9px] tracking-widest text-slate-400">
                      ||| |||| | ||||| || |||||| | ||| ||||
                      <div className="text-[8px] text-slate-500 mt-0.5">{cardStaff.employeeId} · ASSEB VERIFIED</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* OFFICIAL PRINTABLE PAYSLIP MODAL */}
      {selectedPayslipForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[95vh] overflow-y-auto space-y-6 my-auto">
            <PrintActionToolbar
              documentTitle={`Salary Statement: ${selectedPayslipForPrint.month}`}
              documentSubtitle={`Faculty/Staff: ${selectedPayslipForPrint.staffName} (${selectedPayslipForPrint.employeeId}) · ${selectedPayslipForPrint.designation}`}
              badgeLabel="STATUTORY SALARY DISBURSEMENT"
              badgeColor="bg-blue-100 text-blue-900 border-blue-300"
              filename={`SSN_Payslip_${selectedPayslipForPrint.month.replace(/\s+/g, '_')}_${selectedPayslipForPrint.staffName.replace(/\s+/g, '_')}`}
              onClose={() => setSelectedPayslipForPrint(null)}
            />

            {/* Official Stamped Payslip Body (Print Target) */}
            <div className="p-6 border-2 border-slate-900 rounded-2xl bg-white space-y-5 print:border-2 print:border-slate-900 print:p-6">
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-950 text-white flex items-center justify-center font-extrabold text-xl shadow-xs">
                    SSN
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-blue-900 uppercase tracking-wider">
                      {schoolSettings?.trustName || 'SAILAJA SANKKALP TRUST'}
                    </div>
                    <h3 className="text-lg font-bold text-slate-950 leading-tight">
                      Sankardev Shiksha Niketan, Gohpur
                    </h3>
                    <p className="text-xs text-slate-500">
                      Bapadev Kshetra, Solengi, Biswanath · School Code: 035371 · Affiliated to ASSEB
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-blue-950">VOUCHER: {selectedPayslipForPrint.transactionRef}</div>
                  <div className="text-[11px] text-slate-500">Period: {selectedPayslipForPrint.month}</div>
                </div>
              </div>

              {/* Employee Meta Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-200 font-medium">
                <div><strong>Employee Name:</strong> {selectedPayslipForPrint.staffName}</div>
                <div><strong>Employee ID:</strong> <span className="font-mono font-bold text-blue-900">{selectedPayslipForPrint.employeeId}</span></div>
                <div><strong>Designation:</strong> {selectedPayslipForPrint.designation}</div>
                <div><strong>Department:</strong> {selectedPayslipForPrint.department}</div>
                <div><strong>Bank A/C:</strong> <span className="font-mono">{selectedPayslipForPrint.bankAccountNo}</span></div>
                <div><strong>Bank &amp; IFSC:</strong> {selectedPayslipForPrint.bankName} ({selectedPayslipForPrint.ifscCode})</div>
                <div><strong>PAN Number:</strong> <span className="font-mono">{selectedPayslipForPrint.panNumber}</span></div>
                <div><strong>Attendance Log:</strong> <span className="font-bold text-emerald-800">{selectedPayslipForPrint.daysWorked} / {selectedPayslipForPrint.totalDays} Days Worked</span></div>
              </div>

              {/* Side-by-Side Breakdown Table */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                {/* Earnings */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-emerald-50 text-emerald-950 font-bold p-2.5 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    Gross Earnings
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex justify-between">
                      <span>Basic Salary:</span>
                      <span className="font-mono font-semibold">₹{selectedPayslipForPrint.basicPay.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dearness Allowance (DA):</span>
                      <span className="font-mono font-semibold">₹{selectedPayslipForPrint.daAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>House Rent Allowance (HRA):</span>
                      <span className="font-mono font-semibold">₹{selectedPayslipForPrint.hraAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Special Allowance:</span>
                      <span className="font-mono font-semibold">₹{selectedPayslipForPrint.specialAllowance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-slate-900">
                      <span>Total Gross:</span>
                      <span className="font-mono text-emerald-700 font-extrabold">₹{selectedPayslipForPrint.grossSalary.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-rose-50 text-rose-950 font-bold p-2.5 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    Statutory Deductions
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex justify-between">
                      <span>EPF Contribution:</span>
                      <span className="font-mono font-semibold">₹{selectedPayslipForPrint.epfDeduction.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Professional Tax:</span>
                      <span className="font-mono font-semibold">₹{selectedPayslipForPrint.profTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Leave Loss of Pay:</span>
                      <span className="font-mono font-semibold">₹{selectedPayslipForPrint.leaveDeduction.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-6 border-t border-slate-200 font-bold text-slate-900">
                      <span>Total Deductions:</span>
                      <span className="font-mono text-rose-700 font-extrabold">
                        ₹{(selectedPayslipForPrint.epfDeduction + selectedPayslipForPrint.profTax + selectedPayslipForPrint.leaveDeduction).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Payout Banner */}
              <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between print:bg-slate-100 print:text-slate-900 print:border print:border-slate-300">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block print:text-slate-600">NET SALARY DISBURSED</span>
                  <p className="text-xl font-extrabold text-emerald-400 font-mono print:text-emerald-800">
                    ₹{selectedPayslipForPrint.netSalary.toLocaleString()}
                  </p>
                </div>
                <div className="text-right text-xs">
                  <span className="text-slate-400 print:text-slate-600">Disbursement Status:</span>
                  <span className="ml-2 font-bold uppercase text-emerald-300 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800 print:bg-emerald-100 print:text-emerald-900">
                    {selectedPayslipForPrint.paymentStatus}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1 print:text-slate-600">
                    Via {selectedPayslipForPrint.paymentMode} on {selectedPayslipForPrint.paymentDate}
                  </div>
                </div>
              </div>

              {/* Amount in words */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-serif">
                <strong>Net Disbursed in Words:</strong> {formatCurrencyToWords(selectedPayslipForPrint.netSalary)}
              </div>

              {/* Signatures */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-4 text-center text-xs avoid-break">
                <div>
                  <div className="font-serif italic font-bold text-slate-900">{schoolSettings?.principalName || 'Pabitra Borah'}</div>
                  <div className="border-t border-slate-300 pt-1 text-[10px] text-slate-500 font-semibold uppercase">Principal / Authority</div>
                </div>
                <div>
                  <div className="font-serif italic font-bold text-slate-900">Dhireswar Borkotoky</div>
                  <div className="border-t border-slate-300 pt-1 text-[10px] text-slate-500 font-semibold uppercase">Bursar / Accountant</div>
                </div>
                <div>
                  <div className="font-serif italic font-bold text-slate-900">{selectedPayslipForPrint.staffName}</div>
                  <div className="border-t border-slate-300 pt-1 text-[10px] text-slate-500 font-semibold uppercase">Employee Signature</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 no-print">
              <button
                type="button"
                onClick={() => setSelectedPayslipForPrint(null)}
                className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAFF CREATE / EDIT MODAL */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 mb-6">
              <h3 className="font-bold text-slate-900 text-base">
                {editingStaff ? 'Edit Staff Profile' : 'Add New Faculty / Personnel'}
              </h3>
              <button onClick={() => setIsStaffModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={staffForm.employeeId}
                    onChange={(e) => setStaffForm({ ...staffForm, employeeId: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={staffForm.fullName}
                    onChange={(e) => setStaffForm({ ...staffForm, fullName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Designation *</label>
                  <input
                    type="text"
                    required
                    value={staffForm.designation}
                    onChange={(e) => setStaffForm({ ...staffForm, designation: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
                  <input
                    type="text"
                    required
                    value={staffForm.department}
                    onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    value={staffForm.qualification}
                    onChange={(e) => setStaffForm({ ...staffForm, qualification: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Type</label>
                  <select
                    value={staffForm.employmentType}
                    onChange={(e) => setStaffForm({ ...staffForm, employmentType: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Permanent">Permanent</option>
                    <option value="Contractual">Contractual</option>
                    <option value="Probation">Probation</option>
                    <option value="Visiting">Visiting</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h5 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  Salary Structure &amp; Banking
                </h5>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Basic Salary (₹)</label>
                    <input
                      type="number"
                      required
                      value={staffForm.basicSalary}
                      onChange={(e) => setStaffForm({ ...staffForm, basicSalary: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">DA (%)</label>
                    <input
                      type="number"
                      value={staffForm.daPercent}
                      onChange={(e) => setStaffForm({ ...staffForm, daPercent: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">HRA (₹)</label>
                    <input
                      type="number"
                      value={staffForm.hraAmount}
                      onChange={(e) => setStaffForm({ ...staffForm, hraAmount: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Special Allow. (₹)</label>
                    <input
                      type="number"
                      value={staffForm.specialAllowance}
                      onChange={(e) => setStaffForm({ ...staffForm, specialAllowance: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">EPF Deduction (₹)</label>
                    <input
                      type="number"
                      value={staffForm.epfDeduction}
                      onChange={(e) => setStaffForm({ ...staffForm, epfDeduction: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-rose-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Prof Tax (₹)</label>
                    <input
                      type="number"
                      value={staffForm.profTax}
                      onChange={(e) => setStaffForm({ ...staffForm, profTax: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-rose-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Bank A/C Number</label>
                    <input
                      type="text"
                      value={staffForm.bankAccountNo}
                      onChange={(e) => setStaffForm({ ...staffForm, bankAccountNo: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={staffForm.ifscCode}
                      onChange={(e) => setStaffForm({ ...staffForm, ifscCode: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Portal Login Credentials Section */}
              <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-3">
                <h5 className="font-bold text-xs uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                  <span>Portal Login Credentials &amp; Authentication</span>
                </h5>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Staff Portal Login Email *</label>
                    <input
                      type="email"
                      required
                      value={staffForm.portalLoginEmail}
                      onChange={(e) => setStaffForm({ ...staffForm, portalLoginEmail: e.target.value })}
                      placeholder="faculty.physics@ssngohpur.ac.in"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Initial Portal Password *</label>
                    <input
                      type="text"
                      required
                      value={staffForm.portalInitialPassword}
                      onChange={(e) => setStaffForm({ ...staffForm, portalInitialPassword: e.target.value })}
                      placeholder="SSN-FAC@1234"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-blue-800"
                    />
                  </div>
                </div>
              </div>

              {/* Passport Photo Upload from Local Computer */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Passport Photo (Upload from Local Computer)</label>
                <div className="flex items-center gap-3">
                  {staffForm.photoUrl ? (
                    <div className="w-14 h-14 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 shrink-0 shadow-2xs">
                      <img src={staffForm.photoUrl} alt="Passport Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 bg-slate-50 shrink-0 text-[10px]">
                      No Photo
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (uploadEvent) => {
                          const base64Str = uploadEvent.target?.result as string;
                          if (base64Str) {
                            setStaffForm({ ...staffForm, photoUrl: base64Str });
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white rounded-xl shadow-md cursor-pointer"
                >
                  {editingStaff ? 'Update Staff Record' : 'Save & Register Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAYROLL GENERATION MODAL */}
      {isPayrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">Generate Monthly Staff Payslip</h3>
              <button onClick={() => setIsPayrollModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2">
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePayroll} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Staff Member *</label>
                <select
                  required
                  value={payrollForm.staffId}
                  onChange={(e) => setPayrollForm({ ...payrollForm, staffId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  {hrStaff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.employeeId}) · ₹{s.basicSalary.toLocaleString()} Basic
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pay Month *</label>
                  <input
                    type="text"
                    required
                    value={payrollForm.month}
                    onChange={(e) => setPayrollForm({ ...payrollForm, month: e.target.value })}
                    placeholder="e.g. April 2026"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={payrollForm.paymentDate}
                    onChange={(e) => setPayrollForm({ ...payrollForm, paymentDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Days Worked</label>
                  <input
                    type="number"
                    value={payrollForm.daysWorked}
                    onChange={(e) => setPayrollForm({ ...payrollForm, daysWorked: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Days</label>
                  <input
                    type="number"
                    value={payrollForm.totalDays}
                    onChange={(e) => setPayrollForm({ ...payrollForm, totalDays: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Leave Deduct (₹)</label>
                  <input
                    type="number"
                    value={payrollForm.leaveDeduction}
                    onChange={(e) => setPayrollForm({ ...payrollForm, leaveDeduction: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-rose-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Disbursement Mode</label>
                  <select
                    value={payrollForm.paymentMode}
                    onChange={(e) => setPayrollForm({ ...payrollForm, paymentMode: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Bank Transfer">Bank Transfer (Direct)</option>
                    <option value="NEFT">NEFT</option>
                    <option value="RTGS">RTGS</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Status</label>
                  <select
                    value={payrollForm.paymentStatus}
                    onChange={(e) => setPayrollForm({ ...payrollForm, paymentStatus: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-800"
                  >
                    <option value="paid">Paid &amp; Disbursed</option>
                    <option value="processing">Processing</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Ref / UTR</label>
                <input
                  type="text"
                  value={payrollForm.transactionRef}
                  onChange={(e) => setPayrollForm({ ...payrollForm, transactionRef: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsPayrollModalOpen(false)}
                  className="px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md cursor-pointer"
                >
                  Generate &amp; Save Payslip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LEAVE APPLICATION MODAL */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">Submit / Record Staff Leave</h3>
              <button onClick={() => setIsLeaveModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLeave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Staff Member *</label>
                <select
                  required
                  value={leaveForm.staffId}
                  onChange={(e) => setLeaveForm({ ...leaveForm, staffId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  {hrStaff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Leave Classification *</label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value as any })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="Casual Leave (CL)">Casual Leave (CL)</option>
                  <option value="Medical / Sick Leave (ML)">Medical / Sick Leave (ML)</option>
                  <option value="Earned Leave (EL)">Earned Leave (EL)</option>
                  <option value="Duty / Academic Leave">Duty / Academic Leave (ASSEB Evaluation)</option>
                  <option value="Maternity / Paternity">Maternity / Paternity</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Days</label>
                  <input
                    type="number"
                    min={1}
                    value={leaveForm.totalDays}
                    onChange={(e) => setLeaveForm({ ...leaveForm, totalDays: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Substitute Faculty Assigned</label>
                <input
                  type="text"
                  value={leaveForm.substituteTeacher}
                  onChange={(e) => setLeaveForm({ ...leaveForm, substituteTeacher: e.target.value })}
                  placeholder="e.g. Assigned Colleague / Department Faculty"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Leave *</label>
                <textarea
                  required
                  rows={2}
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="Detail the reason for leave..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow-md cursor-pointer"
                >
                  Submit Leave Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
