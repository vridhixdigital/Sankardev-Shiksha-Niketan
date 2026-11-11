import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Printer,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileSpreadsheet,
  LayoutGrid,
  Table as TableIcon,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Coins,
  RefreshCw,
  X,
  CreditCard,
  DollarSign,
  GraduationCap,
} from 'lucide-react';
import {
  FeeStructureRecordDoc,
  calculateFeeStructureTotals,
} from '../../types/erp';
import { printDocument, formatCurrencyToWords, getInstitutionalVerificationTimestamp } from '../../utils/printDocument';
import { PrintActionToolbar } from '../common/PrintActionToolbar';

interface FeeStructureDirectoryManagerProps {
  feeStructures: FeeStructureRecordDoc[];
  onAddFeeStructure?: (fee: Partial<FeeStructureRecordDoc>) => Promise<void>;
  onUpdateFeeStructure?: (id: string, updates: Partial<FeeStructureRecordDoc>) => Promise<void>;
  onDeleteFeeStructure?: (id: string) => Promise<void>;
  onNavigateToStudentAdmission?: () => void;
}

const DEFAULT_FORM_STATE = {
  className: 'Class VI',
  academicSession: '2026-27',
  stream: 'General Foundation',
  admissionFee: 3500,
  tuitionFeeAnnual: 14400,
  hostelBoardingFee: 12000,
  messCateringFee: 14000,
  examAssessmentFee: 1200,
  computerLabFee: 800,
  libraryResourceFee: 500,
  culturalSportsFee: 800,
  developmentFund: 1000,
  medicalEmergencyFee: 500,
  biometricIdFee: 300,
  installmentPlan: 'Quarterly (4 Quarters)',
  concessionPolicy: '10% Sibling concession; Merit scholarship for top rankers.',
  lateFinePerDay: 25,
  status: 'active' as 'active' | 'draft' | 'archived',
  notes: 'Compulsory residency institution. Includes hostel boarding & Satvic mess catering.',
};

export const FeeStructureDirectoryManager: React.FC<FeeStructureDirectoryManagerProps> = ({
  feeStructures,
  onAddFeeStructure,
  onUpdateFeeStructure,
  onDeleteFeeStructure,
  onNavigateToStudentAdmission,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [streamFilter, setStreamFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingFeeId, setEditingFeeId] = useState<string | null>(null);
  const [formData, setFormData] = useState(DEFAULT_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedVoucher, setSelectedVoucher] = useState<FeeStructureRecordDoc | null>(null);
  const [isMasterScheduleOpen, setIsMasterScheduleOpen] = useState(false);
  const [deleteConfirmFee, setDeleteConfirmFee] = useState<FeeStructureRecordDoc | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Dynamic live calculation of form totals
  const liveTotals = useMemo(() => {
    return calculateFeeStructureTotals({
      admissionFee: formData.admissionFee,
      tuitionFeeAnnual: formData.tuitionFeeAnnual,
      hostelBoardingFee: formData.hostelBoardingFee,
      messCateringFee: formData.messCateringFee,
      examAssessmentFee: formData.examAssessmentFee,
      computerLabFee: formData.computerLabFee,
      libraryResourceFee: formData.libraryResourceFee,
      culturalSportsFee: formData.culturalSportsFee,
      developmentFund: formData.developmentFund,
      medicalEmergencyFee: formData.medicalEmergencyFee,
      biometricIdFee: formData.biometricIdFee,
    });
  }, [formData]);

  // Filtered fee structures
  const filteredFees = useMemo(() => {
    return feeStructures.filter((fee) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        fee.className.toLowerCase().includes(q) ||
        fee.stream.toLowerCase().includes(q) ||
        fee.academicSession.toLowerCase().includes(q) ||
        (fee.notes && fee.notes.toLowerCase().includes(q));

      const matchStream =
        streamFilter === 'all' ||
        fee.stream.toLowerCase().includes(streamFilter.toLowerCase());

      const matchStatus =
        statusFilter === 'all' || fee.status === statusFilter;

      return matchSearch && matchStream && matchStatus;
    });
  }, [feeStructures, searchQuery, streamFilter, statusFilter]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalClasses = feeStructures.length;
    if (totalClasses === 0) {
      return { totalClasses: 0, avgAnnual: 0, avgHostel: 0, minAnnual: 0, maxAnnual: 0 };
    }
    const annualSum = feeStructures.reduce((acc, f) => acc + (f.totalAnnualFee || 0), 0);
    const hostelSum = feeStructures.reduce(
      (acc, f) => acc + (f.hostelBoardingFee || 0) + (f.messCateringFee || 0),
      0
    );
    const annualFees = feeStructures.map((f) => f.totalAnnualFee || 0);
    return {
      totalClasses,
      avgAnnual: Math.round(annualSum / totalClasses),
      avgHostel: Math.round(hostelSum / totalClasses),
      minAnnual: Math.min(...annualFees),
      maxAnnual: Math.max(...annualFees),
    };
  }, [feeStructures]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingFeeId(null);
    setFormData(DEFAULT_FORM_STATE);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (fee: FeeStructureRecordDoc) => {
    setEditingFeeId(fee.id);
    setFormData({
      className: fee.className,
      academicSession: fee.academicSession,
      stream: fee.stream,
      admissionFee: fee.admissionFee,
      tuitionFeeAnnual: fee.tuitionFeeAnnual,
      hostelBoardingFee: fee.hostelBoardingFee,
      messCateringFee: fee.messCateringFee,
      examAssessmentFee: fee.examAssessmentFee,
      computerLabFee: fee.computerLabFee,
      libraryResourceFee: fee.libraryResourceFee,
      culturalSportsFee: fee.culturalSportsFee,
      developmentFund: fee.developmentFund,
      medicalEmergencyFee: fee.medicalEmergencyFee,
      biometricIdFee: fee.biometricIdFee,
      installmentPlan: fee.installmentPlan,
      concessionPolicy: fee.concessionPolicy,
      lateFinePerDay: fee.lateFinePerDay,
      status: fee.status,
      notes: fee.notes || '',
    });
    setIsFormModalOpen(true);
  };

  // Submit Add or Edit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingFeeId && onUpdateFeeStructure) {
        await onUpdateFeeStructure(editingFeeId, {
          ...formData,
          totalAnnualFee: liveTotals.totalAnnualFee,
          quarterlyInstallment: liveTotals.quarterlyInstallment,
          tuitionFeeMonthly: liveTotals.tuitionFeeMonthly,
        });
      } else if (onAddFeeStructure) {
        await onAddFeeStructure({
          ...formData,
          totalAnnualFee: liveTotals.totalAnnualFee,
          quarterlyInstallment: liveTotals.quarterlyInstallment,
          tuitionFeeMonthly: liveTotals.tuitionFeeMonthly,
        });
      }
      setIsFormModalOpen(false);
    } catch (err) {
      console.error('Fee submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!deleteConfirmFee || !onDeleteFeeStructure) return;
    setIsDeleting(true);
    try {
      await onDeleteFeeStructure(deleteConfirmFee.id);
      setDeleteConfirmFee(null);
    } catch (err) {
      console.error('Delete fee error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* 1. Command Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Class-Wise Fee Structure Directory
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                  Real-time Database
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Session 2026–27 | Permanent registry of academic tuition, compulsory hostel residency, Satvic mess catering &amp; statutory heads.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => setIsMasterScheduleOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Print Full Schedule
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Class Fee Structure
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Configured Classes</span>
            <GraduationCap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900">
            {metrics.totalClasses} <span className="text-xs font-normal text-slate-500">Levels</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium">
            Class VI to XII &amp; B.A. Honours
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Avg. Annual Fee</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 font-mono">
            ₹{metrics.avgAnnual.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500">
            Quarterly Avg: ₹{Math.round(metrics.avgAnnual / 4).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Hostel &amp; Mess Boarding</span>
            <Building2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 font-mono">
            ₹{metrics.avgHostel.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-amber-700 font-medium">
            Compulsory residency boarding
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Cloud Database Sync</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Firestore Real-time
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            /fee_structures (Hardened Rules)
          </div>
        </div>
      </div>

      {/* 3. Search, Filter, and View Mode Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 w-full md:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search class name, stream, or session (e.g. Class IX, Science, 2026-27)..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={streamFilter}
            onChange={(e) => setStreamFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Streams</option>
            <option value="General">General / Foundation</option>
            <option value="Science">Science Stream</option>
            <option value="Arts">Arts / Humanities</option>
            <option value="Degree">B.A. Degree</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          {onNavigateToStudentAdmission && (
            <button
              type="button"
              onClick={onNavigateToStudentAdmission}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              Go to Admissions Desk
            </button>
          )}

          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Cards Detailed View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Matrix Spreadsheet View"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Display Content: Cards or Matrix */}
      {filteredFees.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 space-y-3">
          <Receipt className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Fee Structure Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No fee structure records match your current search query or filter. You can add a new class fee structure or adjust your filters.
          </p>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer mt-2"
          >
            <Plus className="w-4 h-4" />
            Add Class Fee Structure
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFees.map((fee) => (
            <div
              key={fee.id}
              className="rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-slate-100 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {fee.className}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {fee.stream}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {fee.academicSession}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                        fee.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : fee.status === 'draft'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {fee.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Total Annual Fee Banner */}
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50/60 border border-emerald-200/80 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                      Total Annual Fee
                    </div>
                    <div className="text-xl font-extrabold text-emerald-900 font-mono">
                      ₹{fee.totalAnnualFee.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-emerald-700">
                      {fee.installmentPlan}
                    </div>
                    <div className="text-xs font-bold text-emerald-950 font-mono">
                      ₹{fee.quarterlyInstallment.toLocaleString('en-IN')} / qtr
                    </div>
                  </div>
                </div>
              </div>

              {/* Fee Heads Breakdown */}
              <div className="p-5 space-y-2.5 text-xs">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span>Fee Category Heads</span>
                  <span className="text-[10px] font-mono text-slate-400">All-Inclusive</span>
                </div>

                <div className="space-y-1.5 text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                      Academic Tuition (Annual)
                    </span>
                    <span className="font-semibold text-slate-900 font-mono">
                      ₹{fee.tuitionFeeAnnual.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500 text-[11px] pl-5">
                    <span>Monthly Tuition Equivalent</span>
                    <span className="font-mono">₹{fee.tuitionFeeMonthly.toLocaleString('en-IN')}/mo</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-amber-500" />
                      Hostel Lodging &amp; Maintenance
                    </span>
                    <span className="font-semibold text-slate-900 font-mono">
                      ₹{fee.hostelBoardingFee.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-orange-500" />
                      Nutritional Satvic Mess (4 Meals)
                    </span>
                    <span className="font-semibold text-slate-900 font-mono">
                      ₹{fee.messCateringFee.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-purple-500" />
                      Admission &amp; Examination Fees
                    </span>
                    <span className="font-semibold text-slate-900 font-mono">
                      ₹{(fee.admissionFee + fee.examAssessmentFee).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      STEM Lab, Library &amp; Activities
                    </span>
                    <span className="font-semibold text-slate-900 font-mono">
                      ₹{(fee.computerLabFee + fee.libraryResourceFee + fee.culturalSportsFee).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
                      Dev Fund, Medical &amp; Biometric ID
                    </span>
                    <span className="font-semibold text-slate-900 font-mono">
                      ₹{(fee.developmentFund + fee.medicalEmergencyFee + fee.biometricIdFee).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Concession Note */}
                {fee.concessionPolicy && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 space-y-0.5 mt-2">
                    <span className="font-bold text-slate-800 block">Concession Rule:</span>
                    <p className="line-clamp-2">{fee.concessionPolicy}</p>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="p-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedVoucher(fee)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  Itemized Slip
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(fee)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                    title="Edit Fee Structure"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmFee(fee)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete Fee Structure"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* MATRIX TABLE VIEW */
        <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="p-3.5">Class &amp; Stream</th>
                  <th className="p-3.5">Session</th>
                  <th className="p-3.5 font-mono">Admission</th>
                  <th className="p-3.5 font-mono">Annual Tuition</th>
                  <th className="p-3.5 font-mono">Hostel Lodging</th>
                  <th className="p-3.5 font-mono">Mess Catering</th>
                  <th className="p-3.5 font-mono">Exam &amp; Lab</th>
                  <th className="p-3.5 font-mono">Total Annual</th>
                  <th className="p-3.5 font-mono">Quarterly</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{fee.className}</div>
                      <div className="text-[11px] text-slate-500">{fee.stream}</div>
                    </td>
                    <td className="p-3.5 text-slate-600 font-mono font-medium">{fee.academicSession}</td>
                    <td className="p-3.5 font-mono text-slate-700">₹{fee.admissionFee.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 font-mono text-slate-900 font-semibold">
                      ₹{fee.tuitionFeeAnnual.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 font-mono text-amber-800 font-medium">
                      ₹{fee.hostelBoardingFee.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 font-mono text-orange-800 font-medium">
                      ₹{fee.messCateringFee.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 font-mono text-slate-600">
                      ₹{(fee.examAssessmentFee + fee.computerLabFee).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 font-mono font-extrabold text-emerald-700 text-sm">
                      ₹{fee.totalAnnualFee.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 font-mono font-semibold text-slate-800">
                      ₹{fee.quarterlyInstallment.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                          fee.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : fee.status === 'draft'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {fee.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      <button
                        type="button"
                        onClick={() => setSelectedVoucher(fee)}
                        className="p-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer"
                        title="View Voucher"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(fee)}
                        className="p-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer"
                        title="Edit Structure"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmFee(fee)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                        title="Delete Structure"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. ADD / EDIT FEE STRUCTURE MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-600" />
                  {editingFeeId ? 'Update Class Fee Structure' : 'Add New Class Fee Structure'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time database record with automatic installment and total calculation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              {/* Basic Class Identifiers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Class Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    placeholder="e.g. Class VI / Class XI (Science)"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Academic Session *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.academicSession}
                    onChange={(e) => setFormData({ ...formData, academicSession: e.target.value })}
                    placeholder="2026-27"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Academic Stream *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.stream}
                    onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                    placeholder="General Foundation / Science"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Dynamic Live Totals Header Banner */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    Live Computed Annual Total
                  </span>
                  <div className="text-2xl font-black text-emerald-900 font-mono">
                    ₹{liveTotals.totalAnnualFee.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold text-emerald-950 font-mono">
                  <div>
                    <span className="text-[10px] text-emerald-700 block font-sans">Monthly Tuition</span>
                    ₹{liveTotals.tuitionFeeMonthly.toLocaleString('en-IN')}/mo
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-700 block font-sans">Quarterly Term</span>
                    ₹{liveTotals.quarterlyInstallment.toLocaleString('en-IN')}/qtr
                  </div>
                </div>
              </div>

              {/* Core Fee Heads Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  Itemized Fee Heads (INR ₹)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Admission / Registration Fee (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.admissionFee}
                      onChange={(e) => setFormData({ ...formData, admissionFee: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Annual Tuition Fee (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.tuitionFeeAnnual}
                      onChange={(e) => setFormData({ ...formData, tuitionFeeAnnual: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Compulsory Hostel Lodging (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.hostelBoardingFee}
                      onChange={(e) => setFormData({ ...formData, hostelBoardingFee: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Satvic Mess &amp; Catering (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.messCateringFee}
                      onChange={(e) => setFormData({ ...formData, messCateringFee: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Examinations &amp; Tests (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.examAssessmentFee}
                      onChange={(e) => setFormData({ ...formData, examAssessmentFee: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      STEM &amp; Computer Lab (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.computerLabFee}
                      onChange={(e) => setFormData({ ...formData, computerLabFee: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Library &amp; Study Materials (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.libraryResourceFee}
                      onChange={(e) => setFormData({ ...formData, libraryResourceFee: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Cultural, Sports &amp; Yoga (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.culturalSportsFee}
                      onChange={(e) => setFormData({ ...formData, culturalSportsFee: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Trust Development Fund (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.developmentFund}
                      onChange={(e) => setFormData({ ...formData, developmentFund: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Medical &amp; Infirmary (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.medicalEmergencyFee}
                      onChange={(e) => setFormData({ ...formData, medicalEmergencyFee: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Biometric ID &amp; Diary (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.biometricIdFee}
                      onChange={(e) => setFormData({ ...formData, biometricIdFee: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Per Day Late Fine (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.lateFinePerDay}
                      onChange={(e) => setFormData({ ...formData, lateFinePerDay: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Installment Plan and Policies */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Installment Schedule Plan
                  </label>
                  <select
                    value={formData.installmentPlan}
                    onChange={(e) => setFormData({ ...formData, installmentPlan: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 font-medium cursor-pointer"
                  >
                    <option value="Quarterly (4 Quarters)">Quarterly (4 Quarters / Installments)</option>
                    <option value="Monthly (10 Installments)">Monthly (10 Installments)</option>
                    <option value="Semester Wise (2 Terms)">Semester Wise (2 Terms / Bi-Annual)</option>
                    <option value="Full Annual One-Shot">Full Annual One-Shot (With 5% Rebate)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Structure Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 font-medium cursor-pointer"
                  >
                    <option value="active">Active (Officially Published)</option>
                    <option value="draft">Draft (Under Review)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Concession &amp; Scholarship Policy
                  </label>
                  <input
                    type="text"
                    value={formData.concessionPolicy}
                    onChange={(e) => setFormData({ ...formData, concessionPolicy: e.target.value })}
                    placeholder="e.g. 10% Sibling concession; Merit scholarship for >= 85% marks."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Administrative Guidelines &amp; Notes
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. Compulsory residency for Class VI. Includes dormitory bedding and meals."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 resize-none"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Saving to Database...
                    </>
                  ) : editingFeeId ? (
                    'Update Fee Structure'
                  ) : (
                    'Save to Real-time Database'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. ITEMIZED PRINTABLE VOUCHER / SLIP MODAL */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 md:p-8 space-y-6 print:p-0 print:border-none print:shadow-none">
            {/* Professional Print & Action Toolbar */}
            <div className="no-print">
              <PrintActionToolbar
                documentTitle={`Fee Voucher Schedule: ${selectedVoucher.className} (${selectedVoucher.academicSession})`}
                badgeLabel="Official Class Fee Voucher"
                filename={`SSN_Fee_Voucher_${selectedVoucher.className.replace(/\s+/g, '_')}_${selectedVoucher.academicSession}`}
                orientation="portrait"
                onClose={() => setSelectedVoucher(null)}
              />
            </div>

            {/* Official Slip Content */}
            <div className="p-6 border border-slate-200 rounded-xl space-y-5 bg-white text-slate-900">
              {/* Institutional Header */}
              <div className="text-center space-y-1 border-b border-slate-200 pb-4">
                <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                  SAILAJA SANKKALP TRUST
                </div>
                <h1 className="text-lg font-black text-slate-900 uppercase tracking-wide">
                  Sankardev Shishu Vidya Niketan, Solengi
                </h1>
                <p className="text-[11px] text-slate-600">
                  Bapadev Kshetra, Solengi, P.O: Govinda Elengisatra, Gohpur, Biswanath, Assam – 784168
                </p>
                <div className="inline-block mt-1 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                  Official Class Fee Schedule &amp; Residential Voucher (Session 2026–27)
                </div>
              </div>

              {/* Class Summary Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl text-xs border border-slate-200 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-sans">Class Level</span>
                  <span className="font-bold text-slate-900">{selectedVoucher.className}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-sans">Stream</span>
                  <span className="font-bold text-slate-900">{selectedVoucher.stream}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-sans">Session</span>
                  <span className="font-bold text-slate-900">{selectedVoucher.academicSession}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-sans">Installments</span>
                  <span className="font-bold text-emerald-800">{selectedVoucher.installmentPlan}</span>
                </div>
              </div>

              {/* Itemized Heads Table */}
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-700 text-[11px] font-bold">
                    <th className="py-2 text-left">Sl.</th>
                    <th className="py-2 text-left">Fee Head Description</th>
                    <th className="py-2 text-left">Frequency</th>
                    <th className="py-2 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr>
                    <td className="py-1.5 text-slate-400">01</td>
                    <td className="py-1.5 font-sans font-medium text-slate-800">Admission / Enrollment Fee</td>
                    <td className="py-1.5 font-sans text-slate-500">One-Time</td>
                    <td className="py-1.5 text-right font-bold text-slate-900">₹{selectedVoucher.admissionFee.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-slate-400">02</td>
                    <td className="py-1.5 font-sans font-medium text-slate-800">
                      Academic Instruction &amp; Tuition
                      <span className="block text-[10px] text-slate-500">₹{selectedVoucher.tuitionFeeMonthly.toLocaleString('en-IN')}/month</span>
                    </td>
                    <td className="py-1.5 font-sans text-slate-500">Annual</td>
                    <td className="py-1.5 text-right font-bold text-slate-900">₹{selectedVoucher.tuitionFeeAnnual.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="bg-amber-50/40">
                    <td className="py-1.5 text-slate-400">03</td>
                    <td className="py-1.5 font-sans font-medium text-amber-900">
                      Hostel Boarding &amp; Lodging (Compulsory Residency)
                    </td>
                    <td className="py-1.5 font-sans text-slate-500">Annual</td>
                    <td className="py-1.5 text-right font-bold text-amber-900">₹{selectedVoucher.hostelBoardingFee.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="bg-orange-50/40">
                    <td className="py-1.5 text-slate-400">04</td>
                    <td className="py-1.5 font-sans font-medium text-orange-900">
                      Satvic Mess Boarding (4 Pure Vegetarian Meals Daily)
                    </td>
                    <td className="py-1.5 font-sans text-slate-500">Annual</td>
                    <td className="py-1.5 text-right font-bold text-orange-900">₹{selectedVoucher.messCateringFee.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-slate-400">05</td>
                    <td className="py-1.5 font-sans font-medium text-slate-800">Term &amp; Board Mock Examinations</td>
                    <td className="py-1.5 font-sans text-slate-500">Annual</td>
                    <td className="py-1.5 text-right text-slate-800">₹{selectedVoucher.examAssessmentFee.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-slate-400">06</td>
                    <td className="py-1.5 font-sans font-medium text-slate-800">Digital Computing &amp; Science Lab</td>
                    <td className="py-1.5 font-sans text-slate-500">Annual</td>
                    <td className="py-1.5 text-right text-slate-800">₹{selectedVoucher.computerLabFee.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-slate-400">07</td>
                    <td className="py-1.5 font-sans font-medium text-slate-800">Library &amp; Study Repository</td>
                    <td className="py-1.5 font-sans text-slate-500">Annual</td>
                    <td className="py-1.5 text-right text-slate-800">₹{selectedVoucher.libraryResourceFee.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-slate-400">08</td>
                    <td className="py-1.5 font-sans font-medium text-slate-800">Sankariya Cultural, Yoga &amp; Sports</td>
                    <td className="py-1.5 font-sans text-slate-500">Annual</td>
                    <td className="py-1.5 text-right text-slate-800">₹{selectedVoucher.culturalSportsFee.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-slate-400">09</td>
                    <td className="py-1.5 font-sans font-medium text-slate-800">Campus Infrastructure &amp; Trust Fund</td>
                    <td className="py-1.5 font-sans text-slate-500">Annual</td>
                    <td className="py-1.5 text-right text-slate-800">₹{selectedVoucher.developmentFund.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-slate-400">10</td>
                    <td className="py-1.5 font-sans font-medium text-slate-800">Resident Medical Infirmary &amp; First Aid</td>
                    <td className="py-1.5 font-sans text-slate-500">Annual</td>
                    <td className="py-1.5 text-right text-slate-800">₹{selectedVoucher.medicalEmergencyFee.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-slate-400">11</td>
                    <td className="py-1.5 font-sans font-medium text-slate-800">Biometric RFID Passkey &amp; Diary</td>
                    <td className="py-1.5 font-sans text-slate-500">Annual</td>
                    <td className="py-1.5 text-right text-slate-800">₹{selectedVoucher.biometricIdFee.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-900 bg-slate-50 font-mono text-sm">
                    <td colSpan={3} className="py-2.5 font-bold text-slate-900 font-sans text-right pr-4">
                      TOTAL COMPOSITE ANNUAL FEE:
                    </td>
                    <td className="py-2.5 text-right font-black text-emerald-800">
                      ₹{selectedVoucher.totalAnnualFee.toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr className="border-t border-slate-200 text-xs text-slate-700">
                    <td colSpan={3} className="py-2 font-bold text-right pr-4 font-sans">
                      Per Quarter Installment (4 Quarters):
                    </td>
                    <td className="py-2 text-right font-bold text-slate-900 font-mono">
                      ₹{selectedVoucher.quarterlyInstallment.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Fee in Words Callout */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs space-y-0.5">
                <span className="text-[10px] font-bold text-emerald-950 uppercase tracking-wider block">
                  Total Composite Annual Fee (In Words):
                </span>
                <span className="font-serif italic font-bold text-emerald-900 text-sm block">
                  {formatCurrencyToWords(selectedVoucher.totalAnnualFee)}
                </span>
              </div>

              {/* Bank Account Details for Fee Remittance */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-800 block">Bank Account for Fee Payment:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] text-slate-600">
                  <div>A/C: Sankardev Shishu Vidya Niketan</div>
                  <div>Bank: State Bank of India</div>
                  <div>A/C No: 38472910482</div>
                  <div>IFSC: SBIN0002061 (Gohpur)</div>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-8 grid grid-cols-3 text-center text-xs text-slate-600 font-sans">
                <div className="border-t border-slate-300 pt-1">Accounts Officer</div>
                <div className="border-t border-slate-300 pt-1">Admissions Desk</div>
                <div className="border-t border-slate-300 pt-1 font-bold text-slate-900">
                  Principal / Head of Trust
                </div>
              </div>

              {/* Digital Verification Line */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Ref: SSN/FEES/{selectedVoucher.id || '2026-27'}</span>
                <span>{getInstitutionalVerificationTimestamp()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. FULL INSTITUTIONAL MASTER FEE SCHEDULE MODAL */}
      {isMasterScheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 md:p-8 space-y-6">
            <div className="no-print">
              <PrintActionToolbar
                documentTitle="Master Institutional Fee Matrix (Session 2026–27)"
                badgeLabel="Master Institutional Matrix"
                filename="SSN_Gohpur_Master_Fee_Matrix_2026_27"
                orientation="landscape"
                onClose={() => setIsMasterScheduleOpen(false)}
              />
            </div>

            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  SAILAJA SANKKALP TRUST
                </div>
                <h2 className="text-lg font-black text-slate-900 uppercase">
                  Sankardev Shishu Vidya Niketan, Solengi · Gohpur
                </h2>
                <p className="text-xs text-slate-600">
                  Class-Wise Comprehensive Fee Schedule for Academic Session 2026–27 (Compulsory Residential Setup)
                </p>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold text-[11px] border-b border-slate-200">
                      <th className="p-3">Class</th>
                      <th className="p-3">Stream</th>
                      <th className="p-3 text-right">Tuition (Yr)</th>
                      <th className="p-3 text-right">Hostel (Yr)</th>
                      <th className="p-3 text-right">Mess (Yr)</th>
                      <th className="p-3 text-right">Other Heads</th>
                      <th className="p-3 text-right">Total Annual Fee</th>
                      <th className="p-3 text-right">Per Quarter (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {feeStructures.map((f) => {
                      const otherHeads =
                        f.admissionFee +
                        f.examAssessmentFee +
                        f.computerLabFee +
                        f.libraryResourceFee +
                        f.culturalSportsFee +
                        f.developmentFund +
                        f.medicalEmergencyFee +
                        f.biometricIdFee;
                      return (
                        <tr key={f.id} className="hover:bg-slate-50">
                          <td className="p-3 font-sans font-bold text-slate-900">{f.className}</td>
                          <td className="p-3 font-sans text-slate-600">{f.stream}</td>
                          <td className="p-3 text-right text-slate-800">₹{f.tuitionFeeAnnual.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-right text-amber-800">₹{f.hostelBoardingFee.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-right text-orange-800">₹{f.messCateringFee.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-right text-slate-600">₹{otherHeads.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-right font-black text-emerald-800">
                            ₹{f.totalAnnualFee.toLocaleString('en-IN')}
                          </td>
                          <td className="p-3 text-right font-bold text-slate-900">
                            ₹{f.quarterlyInstallment.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="text-[11px] text-slate-500 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200 font-sans">
                <span className="font-bold text-slate-800">Important Statutory Notice:</span>
                <p>
                  1. Admission to Sankardev Shishu Vidya Niketan is on a compulsory residential basis. All students reside in designated hostels with 4 vegetarian Satvic meals daily.
                </p>
                <p>
                  2. Installments are payable by the 10th of each quarter (April, July, October, January). Late fees of ₹25–₹35 per day apply after the due date.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. DELETE CONFIRMATION SAFEGUARD MODAL */}
      {deleteConfirmFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 rounded-full bg-rose-50 border border-rose-200">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Delete Fee Structure?</h4>
                <p className="text-xs text-slate-500">This action will permanently delete the record.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to permanently remove the fee structure record for{' '}
              <strong className="text-slate-900 font-semibold">{deleteConfirmFee.className}</strong> ({deleteConfirmFee.stream}, Session {deleteConfirmFee.academicSession}) from the real-time database?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmFee(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Permanently Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
