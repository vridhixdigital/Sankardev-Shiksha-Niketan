import React, { useState, useMemo } from 'react';
import {
  FileText,
  Printer,
  Award,
  IdCard,
  CreditCard,
  Settings,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  Building2,
  ShieldCheck,
  Download,
  Eye,
  RefreshCw,
  Sparkles,
  BookOpen,
  GraduationCap,
  Save,
  QrCode,
} from 'lucide-react';
import { printDocument, formatCurrencyToWords, getInstitutionalVerificationTimestamp } from '../../utils/printDocument';
import { PrintActionToolbar } from '../common/PrintActionToolbar';
import {
  UserProfileDoc,
  GradeRecordDoc,
  FeeStructureRecordDoc,
  StudentCertificateDoc,
  FeePaymentReceiptDoc,
  SchoolAdminSettingsDoc,
} from '../../types/erp';

interface InstitutionalDocumentManagerProps {
  students: UserProfileDoc[];
  grades: GradeRecordDoc[];
  feeStructures: FeeStructureRecordDoc[];
  certificates: StudentCertificateDoc[];
  payments: FeePaymentReceiptDoc[];
  schoolSettings: SchoolAdminSettingsDoc;
  onAddCertificate?: (cert: Partial<StudentCertificateDoc>) => Promise<void>;
  onUpdateCertificate?: (id: string, updates: Partial<StudentCertificateDoc>) => Promise<void>;
  onAddPaymentReceipt?: (payment: Partial<FeePaymentReceiptDoc>) => Promise<void>;
  onUpdateSchoolSettings?: (settings: Partial<SchoolAdminSettingsDoc>) => Promise<void>;
}

export const InstitutionalDocumentManager: React.FC<InstitutionalDocumentManagerProps> = ({
  students,
  grades,
  feeStructures,
  certificates,
  payments,
  schoolSettings,
  onAddCertificate,
  onUpdateCertificate,
  onAddPaymentReceipt,
  onUpdateSchoolSettings,
}) => {
  const [activeModule, setActiveModule] = useState<'id_cards' | 'certificates' | 'marksheets' | 'fee_receipts' | 'settings'>('id_cards');

  // Filter & Search states
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedExamTerm, setSelectedExamTerm] = useState<string>('ASSEB Mock Board');

  // Certificate Modal State
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [selectedCertForPrint, setSelectedCertForPrint] = useState<StudentCertificateDoc | null>(null);
  const [certForm, setCertForm] = useState({
    certificateType: 'Bonafide Certificate' as StudentCertificateDoc['certificateType'],
    studentId: '',
    certificateNo: `SSN/CERT/2026/00${certificates.length + 1}`,
    academicSession: '2026–27',
    fatherName: '',
    motherName: '',
    dob: '2008-05-14',
    admissionDate: '2023-04-10',
    leavingDate: '',
    reasonForLeaving: '',
    conductRemarks: 'Exemplary character, disciplined resident scholar, and consistent academic topper.',
    issueDate: new Date().toISOString().slice(0, 10),
    issuedBy: 'Office of the Principal, SSN Gohpur',
  });

  // Fee Receipt Modal State
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceiptForPrint, setSelectedReceiptForPrint] = useState<FeePaymentReceiptDoc | null>(null);
  const [receiptForm, setReceiptForm] = useState({
    studentId: '',
    receiptNo: `SSN-RCP-2026-0${payments.length + 50}`,
    paymentDate: new Date().toISOString().slice(0, 10),
    paymentForTerm: 'Quarter 1' as FeePaymentReceiptDoc['paymentForTerm'],
    admissionFee: 5000,
    tuitionFee: 5700,
    hostelMessFee: 6000,
    labExamFee: 650,
    developmentFee: 1000,
    amountPaid: 18350,
    paymentMode: 'UPI / Online' as FeePaymentReceiptDoc['paymentMode'],
    transactionRef: 'UPI-SSN-' + Math.floor(1000000000 + Math.random() * 9000000000),
    cashierName: 'Sri Dhireswar Borkotoky (Bursar)',
    remarks: 'Settled via online UPI payment gateway into official Trust account.',
  });

  // Global Settings Form State
  const [settingsForm, setSettingsForm] = useState<SchoolAdminSettingsDoc>(schoolSettings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState(false);

  // Student list helper
  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  // Selected student grades
  const studentGrades = useMemo(() => {
    if (!selectedStudent) return [];
    return grades.filter((g) => {
      const matchTerm = selectedExamTerm === 'all' || g.examTerm === selectedExamTerm;
      const matchStudent =
        g.studentId === selectedStudent.rollOrEmpNo ||
        g.studentName.toLowerCase().includes(selectedStudent.fullName.toLowerCase());
      return matchTerm && matchStudent;
    });
  }, [grades, selectedStudent, selectedExamTerm]);

  // Handle Certificate Form Open
  const handleOpenCertModal = () => {
    const s = selectedStudent || students[0];
    setCertForm({
      certificateType: 'Bonafide Certificate',
      studentId: s ? s.id : '',
      certificateNo: `SSN/CERT/2026/00${certificates.length + 1}`,
      academicSession: schoolSettings.academicSession || '2026–27',
      fatherName: s?.guardianOrLinkedName || 'Sri Pradip Borah',
      motherName: 'Smt. Junali Borah',
      dob: '2008-05-14',
      admissionDate: '2023-04-10',
      leavingDate: '',
      reasonForLeaving: '',
      conductRemarks: 'Exemplary character, disciplined resident scholar, and consistent academic topper.',
      issueDate: new Date().toISOString().slice(0, 10),
      issuedBy: `Office of the Principal, ${schoolSettings.schoolName}`,
    });
    setIsCertModalOpen(true);
  };

  const handleSaveCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetStudent = students.find((s) => s.id === certForm.studentId) || selectedStudent;
    if (!targetStudent || !onAddCertificate) return;

    await onAddCertificate({
      certificateNo: certForm.certificateNo,
      certificateType: certForm.certificateType,
      studentId: targetStudent.rollOrEmpNo,
      studentName: targetStudent.fullName,
      rollNo: targetStudent.rollOrEmpNo,
      className: targetStudent.departmentOrClass,
      academicSession: certForm.academicSession,
      fatherName: certForm.fatherName,
      motherName: certForm.motherName,
      dob: certForm.dob,
      admissionDate: certForm.admissionDate,
      leavingDate: certForm.leavingDate,
      reasonForLeaving: certForm.reasonForLeaving,
      conductRemarks: certForm.conductRemarks,
      issueDate: certForm.issueDate,
      issuedBy: certForm.issuedBy,
      status: 'valid',
    });
    setIsCertModalOpen(false);
  };

  // Handle Fee Receipt Save
  const handleSaveReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetStudent = students.find((s) => s.id === receiptForm.studentId) || selectedStudent;
    if (!targetStudent || !onAddPaymentReceipt) return;

    const total =
      Number(receiptForm.admissionFee) +
      Number(receiptForm.tuitionFee) +
      Number(receiptForm.hostelMessFee) +
      Number(receiptForm.labExamFee) +
      Number(receiptForm.developmentFee);
    const balance = Math.max(0, total - Number(receiptForm.amountPaid));

    await onAddPaymentReceipt({
      receiptNo: receiptForm.receiptNo,
      paymentDate: receiptForm.paymentDate,
      studentId: targetStudent.rollOrEmpNo,
      studentName: targetStudent.fullName,
      rollNo: targetStudent.rollOrEmpNo,
      className: targetStudent.departmentOrClass,
      paymentForTerm: receiptForm.paymentForTerm,
      feeBreakdown: {
        admissionFee: Number(receiptForm.admissionFee),
        tuitionFee: Number(receiptForm.tuitionFee),
        hostelMessFee: Number(receiptForm.hostelMessFee),
        labExamFee: Number(receiptForm.labExamFee),
        developmentFee: Number(receiptForm.developmentFee),
        otherFine: 0,
      },
      totalAmount: total,
      amountPaid: Number(receiptForm.amountPaid),
      balanceDue: balance,
      paymentMode: receiptForm.paymentMode,
      transactionRef: receiptForm.transactionRef,
      cashierName: receiptForm.cashierName,
      remarks: receiptForm.remarks,
      status: 'completed',
    });
    setIsReceiptModalOpen(false);
  };

  // Handle Global Settings Save
  const handleSaveGlobalSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateSchoolSettings) return;
    setIsSavingSettings(true);
    try {
      await onUpdateSchoolSettings(settingsForm);
      setSettingsSavedSuccess(true);
      setTimeout(() => setSettingsSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update school settings:', err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Navigation Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/30 border border-amber-400/40 rounded-full w-fit text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Official Documentation &amp; Statutory Certification Desk
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Institutional Document &amp; Printing Suite</h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Real-time issuance of Student Photo ID Cards, Bonafide &amp; Transfer Certificates, ASSEB Marksheets, Fee Payment Money Receipts, and Global School Trust Settings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                printDocument({
                  title: `SSN_Institutional_Document_Suite_${activeModule.toUpperCase()}`,
                  orientation: activeModule === 'id_cards' ? 'landscape' : 'portrait',
                })
              }
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Current View
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveModule('id_cards')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeModule === 'id_cards'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <IdCard className="w-3.5 h-3.5" />
            Photo ID Cards
          </button>
          <button
            onClick={() => setActiveModule('certificates')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeModule === 'certificates'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Student Certificates ({certificates.length})
          </button>
          <button
            onClick={() => setActiveModule('marksheets')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeModule === 'marksheets'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Marksheets &amp; Report Cards
          </button>
          <button
            onClick={() => setActiveModule('fee_receipts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeModule === 'fee_receipts'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Fee Payment Receipts ({payments.length})
          </button>
          <button
            onClick={() => setActiveModule('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeModule === 'settings'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            School Admin Settings &amp; Trust Documents
          </button>
        </div>
      </div>

      {/* MODULE 1: STUDENT PHOTO ID CARDS */}
      {activeModule === 'id_cards' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Official Institutional Student Photo ID Cards</h3>
              <p className="text-xs text-slate-500">Dual-sided laminated standard CR80 identity credentials for residential scholars.</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.fullName} ({st.rollOrEmpNo}) · {st.departmentOrClass}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() =>
                  printDocument({
                    title: `SSN_StudentID_${selectedStudent?.rollOrEmpNo || 'Card'}`,
                    filename: `SSN_StudentID_${(selectedStudent?.fullName || 'Scholar').replace(/\s+/g, '_')}_${selectedStudent?.rollOrEmpNo || ''}`,
                  })
                }
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Scholar ID Card
              </button>
            </div>
          </div>

          {selectedStudent && (
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-6">
              {/* Front Side */}
              <div className="w-80 h-[480px] rounded-3xl bg-white border-2 border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between relative p-6 text-center">
                <div className="space-y-1 border-b border-slate-200 pb-3">
                  <div className="text-[10px] font-bold text-blue-900 uppercase tracking-wider">
                    {schoolSettings.trustName}
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-900 leading-tight">
                    {schoolSettings.schoolName}
                  </h4>
                  <p className="text-[9px] text-slate-500">
                    School Code: {schoolSettings.schoolCode} · Affiliation: {schoolSettings.affiliationNumber}
                  </p>
                </div>

                <div className="flex flex-col items-center space-y-2 py-2">
                  <div className="w-24 h-28 rounded-xl overflow-hidden border-2 border-amber-600 bg-slate-100 shadow-sm">
                    <img
                      src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80"
                      alt={selectedStudent.fullName}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <h5 className="font-extrabold text-slate-900 text-base leading-snug">{selectedStudent.fullName}</h5>
                  <div className="px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-full">
                    {selectedStudent.departmentOrClass}
                  </div>
                  <div className="text-[11px] text-slate-600 font-mono font-bold">
                    Roll No: {selectedStudent.rollOrEmpNo}
                  </div>
                </div>

                <div className="space-y-1 text-left text-[11px] text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Guardian:</span>
                    <span className="font-bold text-slate-900">{selectedStudent.guardianOrLinkedName || 'Pradip Borah'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Blood Group:</span>
                    <span className="font-bold text-rose-700">B+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Residency:</span>
                    <span className="font-bold text-blue-800">Brahmaputra Dorm Block</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Session:</span>
                    <span className="font-bold">{schoolSettings.academicSession}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-end">
                  <div className="text-[8px] font-mono text-slate-400">STUDENT IDENTITY</div>
                  <div className="text-center">
                    <div className="font-serif italic text-xs font-bold text-blue-950">{schoolSettings.principalName}</div>
                    <div className="text-[8px] font-bold text-slate-500 uppercase">Principal / Authority</div>
                  </div>
                </div>
              </div>

              {/* Back Side */}
              <div className="w-80 h-[480px] rounded-3xl bg-slate-900 text-white shadow-xl overflow-hidden flex flex-col justify-between p-6 text-center border-2 border-slate-800">
                <div className="space-y-1 border-b border-slate-700 pb-3">
                  <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    RESIDENTIAL SCHOLAR PROTOCOLS
                  </h5>
                  <p className="text-[9px] text-slate-300">Sankardev Shiksha Niketan Campus Guidelines</p>
                </div>

                <div className="space-y-3 text-left text-[11px] text-slate-300 py-2">
                  <p>• Compulsory ID credential for mess dining, library borrowing, science labs, and hostel entry.</p>
                  <p>• Satvic discipline, punctuality, and moral code must be upheld at all times.</p>
                  <p>• If lost or found, please deposit at School Office: Bapadev Kshetra, Solengi, Gohpur, Pin 784168.</p>
                  <div className="pt-2 border-t border-slate-700 text-[10px] space-y-1">
                    <div><strong>Emergency Contact:</strong> {selectedStudent.phone || '+91 9435081122'}</div>
                    <div><strong>Hostel Desk:</strong> +91 99546 56161</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-800 rounded-xl flex items-center justify-center space-x-2">
                  <div className="w-full text-center font-mono text-[9px] tracking-widest text-slate-400">
                    |||| || |||||| | ||| |||| ||||| || |||
                    <div className="text-[8px] text-slate-500 mt-0.5">{selectedStudent.rollOrEmpNo} · BARCODE AUTHENTICATED</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODULE 2: STUDENT CERTIFICATES (BONAFIDE, CHARACTER, TC, MERIT) */}
      {activeModule === 'certificates' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Official Student Certificates &amp; Bonafides</h3>
              <p className="text-xs text-slate-500">Issue Bonafide, Character, Transfer (TC), and Academic Merit Certificates with regal trust border.</p>
            </div>
            <button
              onClick={handleOpenCertModal}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Issue New Certificate
            </button>
          </div>

          {/* Certificate Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Cert No.</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Student Name</th>
                    <th className="p-3.5">Roll No &amp; Class</th>
                    <th className="p-3.5">Issue Date</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {certificates.map((cert) => (
                    <tr key={cert.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-blue-900">{cert.certificateNo}</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 font-bold rounded-lg text-[11px]">
                          {cert.certificateType}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">{cert.studentName}</td>
                      <td className="p-3.5">
                        <span className="font-mono">{cert.rollNo}</span> · {cert.className}
                      </td>
                      <td className="p-3.5 text-slate-600">{cert.issueDate}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] uppercase">
                          {cert.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedCertForPrint(cert)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Print Certificate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 3: MARKSHEETS & REPORT CARDS */}
      {activeModule === 'marksheets' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Official Academic Progress Report &amp; Marksheet</h3>
              <p className="text-xs text-slate-500">ASSEB board format progressive report card with subject metrics and distinction honors.</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.fullName} ({st.rollOrEmpNo})
                  </option>
                ))}
              </select>

              <select
                value={selectedExamTerm}
                onChange={(e) => setSelectedExamTerm(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="ASSEB Mock Board">ASSEB Mock Board Exam</option>
                <option value="Half Yearly">Half Yearly Exam</option>
                <option value="Unit Test 1">Unit Test 1</option>
                <option value="Annual Composite">Annual Composite Evaluation</option>
              </select>

              <button
                type="button"
                onClick={() =>
                  printDocument({
                    title: `SSN_Marksheet_${selectedStudent?.rollOrEmpNo || 'Record'}_${selectedExamTerm}`,
                    filename: `SSN_Marksheet_${(selectedStudent?.fullName || 'Scholar').replace(/\s+/g, '_')}_${selectedExamTerm.replace(/\s+/g, '_')}`,
                  })
                }
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Marksheet
              </button>
            </div>
          </div>

          {/* Marksheet Printable Document Container */}
          {selectedStudent && (
            <div className="bg-white p-8 md:p-12 rounded-3xl border-2 border-slate-800 shadow-xl max-w-4xl mx-auto space-y-8 print:border-none print:shadow-none">
              {/* Header */}
              <div className="text-center space-y-1.5 border-b-2 border-slate-900 pb-6 relative">
                <div className="text-xs font-extrabold text-blue-900 uppercase tracking-widest">
                  {schoolSettings.trustName}
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-extrabold text-slate-950 uppercase tracking-wide">
                  {schoolSettings.schoolName}
                </h2>
                <p className="text-xs text-slate-600 max-w-xl mx-auto">
                  {schoolSettings.address} · School Code: {schoolSettings.schoolCode} · Affiliated to ASSEB &amp; Gauhati University
                </p>
                <div className="inline-block px-4 py-1 bg-slate-900 text-white font-bold text-xs rounded-full uppercase tracking-wider mt-2">
                  OFFICIAL ACADEMIC PROGRESS REPORT · {selectedExamTerm.toUpperCase()}
                </div>
              </div>

              {/* Scholar Information Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200 font-medium">
                <div><strong>Scholar Name:</strong> <span className="block text-slate-900 font-bold">{selectedStudent.fullName}</span></div>
                <div><strong>Roll / ID No:</strong> <span className="block font-mono text-blue-800 font-bold">{selectedStudent.rollOrEmpNo}</span></div>
                <div><strong>Class &amp; Stream:</strong> <span className="block text-slate-900 font-bold">{selectedStudent.departmentOrClass}</span></div>
                <div><strong>Academic Year:</strong> <span className="block text-slate-900 font-bold">{schoolSettings.academicSession}</span></div>
              </div>

              {/* Subject Breakdown Table */}
              <div className="border border-slate-300 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Theory (80)</th>
                      <th className="p-3">Practical / Viva (20)</th>
                      <th className="p-3">Total (100)</th>
                      <th className="p-3">Grade</th>
                      <th className="p-3">Grade Point</th>
                      <th className="p-3 text-right">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {studentGrades.length > 0 ? (
                      studentGrades.map((g) => {
                        const marks = g.marksObtained;
                        const gradeLetter = marks >= 90 ? 'A+' : marks >= 80 ? 'A' : marks >= 70 ? 'B+' : 'B';
                        const gp = (marks / 10).toFixed(1);
                        return (
                          <tr key={g.id} className="hover:bg-slate-50 font-medium">
                            <td className="p-3 font-bold text-slate-900">{g.subject}</td>
                            <td className="p-3 font-mono">{Math.round(marks * 0.8)}</td>
                            <td className="p-3 font-mono">{Math.round(marks * 0.2)}</td>
                            <td className="p-3 font-mono font-bold text-blue-900">{marks}</td>
                            <td className="p-3 font-bold text-emerald-700">{gradeLetter}</td>
                            <td className="p-3 font-mono">{gp}</td>
                            <td className="p-3 text-right text-slate-600">
                              {marks >= 90 ? 'Star Distinction' : 'First Division'}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      // Mock demonstration subjects if specific marks not seeded
                      [
                        { sub: 'Physics', theory: 76, prac: 20, total: 96, grade: 'A+', gp: '9.6', rem: 'Star Distinction' },
                        { sub: 'Chemistry', theory: 74, prac: 18, total: 92, grade: 'A+', gp: '9.2', rem: 'Star Distinction' },
                        { sub: 'Mathematics', theory: 78, prac: 19, total: 97, grade: 'A+', gp: '9.7', rem: 'Outstanding' },
                        { sub: 'English & Literature', theory: 71, prac: 18, total: 89, grade: 'A', gp: '8.9', rem: 'Excellent' },
                        { sub: 'Assamese / MIL', theory: 73, prac: 19, total: 92, grade: 'A+', gp: '9.2', rem: 'Star Distinction' },
                      ].map((item) => (
                        <tr key={item.sub} className="hover:bg-slate-50 font-medium">
                          <td className="p-3 font-bold text-slate-900">{item.sub}</td>
                          <td className="p-3 font-mono">{item.theory}</td>
                          <td className="p-3 font-mono">{item.prac}</td>
                          <td className="p-3 font-mono font-bold text-blue-900">{item.total}</td>
                          <td className="p-3 font-bold text-emerald-700">{item.grade}</td>
                          <td className="p-3 font-mono">{item.gp}</td>
                          <td className="p-3 text-right text-slate-600">{item.rem}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-300 font-bold text-xs text-slate-900">
                    <tr>
                      <td className="p-3" colSpan={3}>Aggregate Percentage &amp; Result</td>
                      <td className="p-3 font-mono text-emerald-700 text-sm">93.2%</td>
                      <td className="p-3 font-bold text-emerald-800" colSpan={2}>CGPA: 9.32 / 10</td>
                      <td className="p-3 text-right uppercase text-blue-900">PASSED WITH DISTINCTION</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Assessment Remarks */}
              <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200/80 text-xs space-y-1">
                <span className="font-bold text-blue-950 uppercase tracking-wider text-[10px]">
                  Institutional Mentor Remarks
                </span>
                <p className="text-slate-700 leading-relaxed italic">
                  "Demonstrates noble character, keen intellectual agility, and strict dedication to Sankariya moral culture. Recommended for the Shankardev Shiksha Ratna Academic Trophy."
                </p>
              </div>

              {/* Signatures */}
              <div className="pt-10 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-xs">
                <div>
                  <div className="font-serif italic font-bold text-slate-900">Faculty Form Master</div>
                  <div className="border-t border-slate-300 pt-1 text-[10px] text-slate-500 font-semibold uppercase">Class Teacher / Mentor</div>
                </div>
                <div>
                  <div className="font-serif italic font-bold text-slate-900">Uday Aditya Goswami</div>
                  <div className="border-t border-slate-300 pt-1 text-[10px] text-slate-500 font-semibold uppercase">Controller of Examinations</div>
                </div>
                <div>
                  <div className="font-serif italic font-bold text-slate-900">{schoolSettings.principalName}</div>
                  <div className="border-t border-slate-300 pt-1 text-[10px] text-slate-500 font-semibold uppercase">Head of Institution</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODULE 4: FEE PAYMENT RECEIPTS */}
      {activeModule === 'fee_receipts' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Official Fee Payment Receipts &amp; Money Vouchers</h3>
              <p className="text-xs text-slate-500">Record payments and issue official school stamped money receipts for trust auditing.</p>
            </div>
            <button
              onClick={() => {
                const s = selectedStudent || students[0];
                setReceiptForm({
                  studentId: s ? s.id : '',
                  receiptNo: `SSN-RCP-2026-0${payments.length + 50}`,
                  paymentDate: new Date().toISOString().slice(0, 10),
                  paymentForTerm: 'Quarter 1',
                  admissionFee: 5000,
                  tuitionFee: 5700,
                  hostelMessFee: 6000,
                  labExamFee: 650,
                  developmentFee: 1000,
                  amountPaid: 18350,
                  paymentMode: 'UPI / Online',
                  transactionRef: 'UPI-SSN-' + Math.floor(1000000000 + Math.random() * 9000000000),
                  cashierName: 'Sri Dhireswar Borkotoky (Bursar)',
                  remarks: 'Settled via online UPI payment gateway into official Trust account.',
                });
                setIsReceiptModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Record New Fee Payment
            </button>
          </div>

          {/* Payment Receipts Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Receipt No</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Student &amp; Roll</th>
                    <th className="p-3.5">Term</th>
                    <th className="p-3.5">Total Bill</th>
                    <th className="p-3.5">Paid</th>
                    <th className="p-3.5">Balance</th>
                    <th className="p-3.5">Mode</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors font-medium">
                      <td className="p-3.5 font-mono font-bold text-blue-900">{p.receiptNo}</td>
                      <td className="p-3.5 text-slate-700">{p.paymentDate}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{p.studentName}</div>
                        <div className="text-[11px] font-mono text-slate-500">{p.rollNo} · {p.className}</div>
                      </td>
                      <td className="p-3.5 font-bold text-slate-800">{p.paymentForTerm}</td>
                      <td className="p-3.5 font-mono">₹{p.totalAmount.toLocaleString()}</td>
                      <td className="p-3.5 font-mono font-bold text-emerald-700">₹{p.amountPaid.toLocaleString()}</td>
                      <td className="p-3.5 font-mono text-rose-600">₹{p.balanceDue.toLocaleString()}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded-md font-semibold text-[10px]">
                          {p.paymentMode}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedReceiptForPrint(p)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 5: DYNAMIC GLOBAL SCHOOL ADMIN SETTINGS */}
      {activeModule === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Super Admin Global Institutional Settings</h3>
                <p className="text-xs text-slate-500">
                  Update institutional legal identity, school codes, affiliation numbers, and statutory document renewals. Changes reflect immediately in all generated ID cards, payslips, marksheets, and public pages.
                </p>
              </div>
              {settingsSavedSuccess && (
                <div className="px-4 py-2 bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Settings Successfully Saved to Cloud!
                </div>
              )}
            </div>

            <form onSubmit={handleSaveGlobalSettings} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Official School Name *</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.schoolName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, schoolName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Governing Trust *</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.trustName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, trustName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Current Academic Session *</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.academicSession}
                    onChange={(e) => setSettingsForm({ ...settingsForm, academicSession: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ASSEB / State Affiliation No. *</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.affiliationNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, affiliationNumber: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State School Code *</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.schoolCode}
                    onChange={(e) => setSettingsForm({ ...settingsForm, schoolCode: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">UDISE+ Code</label>
                  <input
                    type="text"
                    value={settingsForm.udiseCode}
                    onChange={(e) => setSettingsForm({ ...settingsForm, udiseCode: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Chairman Name *</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.chairmanName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, chairmanName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Principal / Head of Institution *</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.principalName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, principalName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bursar / Head Accountant *</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.headAccountantName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, headAccountantName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Campus Address *</label>
                <input
                  type="text"
                  required
                  value={settingsForm.address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              {/* Statutory Documents Section */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-700" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                      Institutional Statutory &amp; Safety Compliance Documents
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-500">Track clearance renewals</span>
                </div>

                <div className="space-y-3">
                  {settingsForm.statutoryDocuments.map((doc, idx) => (
                    <div key={doc.id} className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{doc.title}</div>
                        <div className="text-[11px] text-slate-500">Ref: {doc.docRefNumber} · Authority: {doc.issuingAuthority}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 font-mono text-[11px]">Valid: {doc.validFrom} to {doc.validUntil}</span>
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[10px] uppercase">
                          {doc.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-8 py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSavingSettings ? 'Saving Global Settings...' : 'Save & Publish Global Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE CERTIFICATE MODAL */}
      {selectedCertForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[95vh] overflow-y-auto space-y-6 my-auto">
            <PrintActionToolbar
              documentTitle={`Official ${selectedCertForPrint.certificateType}`}
              documentSubtitle={`Certificate No: ${selectedCertForPrint.certificateNo} · Scholar: ${selectedCertForPrint.studentName}`}
              badgeLabel="STATUTORY ACADEMIC CERTIFICATE"
              badgeColor="bg-amber-100 text-amber-900 border-amber-300"
              filename={`SSN_Certificate_${selectedCertForPrint.certificateNo}_${selectedCertForPrint.studentName.replace(/\s+/g, '_')}`}
              onClose={() => setSelectedCertForPrint(null)}
            />

            {/* Regal Certificate Body (Print Target) */}
            <div className="p-8 sm:p-12 border-8 border-double border-blue-950 rounded-2xl relative bg-amber-50/20 text-center space-y-6 print:border-8 print:border-double print:border-blue-950 print:bg-white print:p-8">
              {/* Header */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-widest text-blue-900">
                  {schoolSettings.trustName}
                </div>
                <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-950 uppercase tracking-tight">
                  {schoolSettings.schoolName}
                </h1>
                <p className="text-xs text-slate-600">
                  {schoolSettings.address} · School Code: {schoolSettings.schoolCode} · Affiliated to ASSEB
                </p>
                <div className="pt-2">
                  <span className="px-5 py-1.5 bg-blue-950 text-white font-serif font-bold text-xs sm:text-sm uppercase tracking-widest rounded-full inline-block shadow-xs">
                    {selectedCertForPrint.certificateType}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-slate-500 border-y border-slate-200 py-2">
                <span>Certificate Ref: <strong className="text-slate-900 font-bold">{selectedCertForPrint.certificateNo}</strong></span>
                <span>ASSEB Affiliation: <strong className="text-slate-900 font-bold">{schoolSettings.affiliationNumber}</strong></span>
              </div>

              {/* Certificate Text */}
              <div className="text-sm text-slate-800 leading-loose text-justify font-serif px-2 sm:px-6 space-y-4">
                <p>
                  This is to certify that <strong>{selectedCertForPrint.studentName}</strong>, bearing Roll No.{' '}
                  <strong>{selectedCertForPrint.rollNo}</strong>, son/daughter of{' '}
                  <strong>{selectedCertForPrint.fatherName || 'Guardian'}</strong> and{' '}
                  <strong>{selectedCertForPrint.motherName || 'Mother'}</strong>, is a bonafide residential scholar of{' '}
                  <strong>{selectedCertForPrint.className}</strong> in this esteemed institution for the Academic Session{' '}
                  <strong>{selectedCertForPrint.academicSession}</strong>.
                </p>
                <p>
                  Date of Birth recorded in institutional admission register is <strong>{selectedCertForPrint.dob || '14-05-2008'}</strong>.
                  During their tenure in Sankardev Shiksha Niketan, their conduct, academic zeal, and moral deportment have been{' '}
                  <strong>{selectedCertForPrint.conductRemarks}</strong>.
                </p>
                <p>We wish them glorious success and spiritual wisdom in all future academic pursuits.</p>
              </div>

              {/* Security Microprint & Authority Block */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-xs items-end avoid-break">
                <div className="text-left font-mono text-slate-500 space-y-1">
                  <div>Date of Issue: <strong className="text-slate-900">{selectedCertForPrint.issueDate}</strong></div>
                  <div className="text-[10px] text-slate-400">Institutional Authority Seal &amp; Registration Stamp</div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded border border-slate-200 text-[9px] font-mono mt-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Digitally Verifiable via SSN Smart ERP</span>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="font-serif italic font-bold text-base text-blue-950">{schoolSettings.principalName}</div>
                  <div className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">Principal / Head of Institution</div>
                  <div className="text-[9px] text-slate-500">{schoolSettings.schoolName}</div>
                </div>
              </div>
            </div>

            {/* Bottom Screen Close Action */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 no-print">
              <button
                type="button"
                onClick={() => setSelectedCertForPrint(null)}
                className="px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE FEE RECEIPT MODAL */}
      {selectedReceiptForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[95vh] overflow-y-auto space-y-6 my-auto">
            <PrintActionToolbar
              documentTitle={`Fee Receipt: ${selectedReceiptForPrint.receiptNo}`}
              documentSubtitle={`Scholar: ${selectedReceiptForPrint.studentName} (${selectedReceiptForPrint.rollNo}) · ${selectedReceiptForPrint.className}`}
              badgeLabel="OFFICIAL CASH & PAYMENT VOUCHER"
              badgeColor="bg-emerald-100 text-emerald-900 border-emerald-300"
              filename={`SSN_Receipt_${selectedReceiptForPrint.receiptNo}_${selectedReceiptForPrint.studentName.replace(/\s+/g, '_')}`}
              onClose={() => setSelectedReceiptForPrint(null)}
            />

            {/* Official Stamped Money Receipt Body */}
            <div className="p-6 border-2 border-slate-900 rounded-2xl bg-white space-y-4 print:border-2 print:border-slate-900 print:p-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <div className="text-[10px] font-bold text-blue-900 uppercase tracking-wider">{schoolSettings.trustName}</div>
                  <h3 className="text-lg font-bold text-slate-950 leading-tight">{schoolSettings.schoolName}</h3>
                  <p className="text-[10px] text-slate-500">Bapadev Kshetra, Solengi · School Code: {schoolSettings.schoolCode}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold font-mono text-blue-900">{selectedReceiptForPrint.receiptNo}</div>
                  <div className="text-[11px] text-slate-500">Date: {selectedReceiptForPrint.paymentDate}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div><strong>Scholar:</strong> {selectedReceiptForPrint.studentName}</div>
                <div><strong>Roll No:</strong> <span className="font-mono">{selectedReceiptForPrint.rollNo}</span></div>
                <div><strong>Class:</strong> {selectedReceiptForPrint.className}</div>
                <div><strong>Term:</strong> <span className="font-bold text-emerald-800">{selectedReceiptForPrint.paymentForTerm}</span></div>
              </div>

              {/* Fee Heads Breakdown */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 font-bold text-slate-700">
                    <tr>
                      <th className="p-2.5">Fee Head Description</th>
                      <th className="p-2.5 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr><td className="p-2.5">Admission / Registration Fee</td><td className="p-2.5 text-right font-mono">₹{selectedReceiptForPrint.feeBreakdown.admissionFee}</td></tr>
                    <tr><td className="p-2.5">Quarterly Tuition Fee</td><td className="p-2.5 text-right font-mono">₹{selectedReceiptForPrint.feeBreakdown.tuitionFee}</td></tr>
                    <tr><td className="p-2.5">Hostel Boarding &amp; Satvic Mess</td><td className="p-2.5 text-right font-mono">₹{selectedReceiptForPrint.feeBreakdown.hostelMessFee}</td></tr>
                    <tr><td className="p-2.5">Laboratory &amp; Examination Fund</td><td className="p-2.5 text-right font-mono">₹{selectedReceiptForPrint.feeBreakdown.labExamFee}</td></tr>
                    <tr><td className="p-2.5">Campus Development Fund</td><td className="p-2.5 text-right font-mono">₹{selectedReceiptForPrint.feeBreakdown.developmentFee}</td></tr>
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                    <tr>
                      <td className="p-2.5 text-slate-900">Total Billed:</td>
                      <td className="p-2.5 text-right font-mono text-slate-900">₹{selectedReceiptForPrint.totalAmount.toLocaleString()}</td>
                    </tr>
                    <tr className="text-emerald-700 text-sm">
                      <td className="p-2.5">Amount Paid &amp; Received:</td>
                      <td className="p-2.5 text-right font-mono font-extrabold">₹{selectedReceiptForPrint.amountPaid.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-slate-500">Balance Due:</td>
                      <td className="p-2.5 text-right font-mono text-rose-600">₹{selectedReceiptForPrint.balanceDue.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Amount in words */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-serif">
                <strong>Amount in Words:</strong> {formatCurrencyToWords(selectedReceiptForPrint.amountPaid)}
              </div>

              <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-0.5">
                <div><strong>Payment Mode:</strong> {selectedReceiptForPrint.paymentMode}</div>
                <div><strong>Ref / UTR:</strong> <span className="font-mono">{selectedReceiptForPrint.transactionRef}</span></div>
                <div><strong>Remarks:</strong> {selectedReceiptForPrint.remarks}</div>
              </div>

              <div className="pt-6 grid grid-cols-2 gap-4 text-xs avoid-break">
                <div className="text-left text-[10px] text-slate-400">
                  Electronic Computer Generated Money Receipt · Audited by SAILAJA SANKKALP TRUST
                </div>
                <div className="text-right">
                  <div className="font-serif italic font-bold text-slate-900">{selectedReceiptForPrint.cashierName}</div>
                  <div className="text-[9px] text-slate-500 font-semibold uppercase">Authorized Cashier / Bursar</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 no-print">
              <button
                type="button"
                onClick={() => setSelectedReceiptForPrint(null)}
                className="px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ISSUE CERTIFICATE MODAL */}
      {isCertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">Issue Official Student Certificate</h3>
              <button onClick={() => setIsCertModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCertificate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Scholar *</label>
                <select
                  required
                  value={certForm.studentId}
                  onChange={(e) => setCertForm({ ...certForm, studentId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.rollOrEmpNo}) · {s.departmentOrClass}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Certificate Type *</label>
                  <select
                    value={certForm.certificateType}
                    onChange={(e) => setCertForm({ ...certForm, certificateType: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-blue-900"
                  >
                    <option value="Bonafide Certificate">Bonafide Certificate</option>
                    <option value="Character & Conduct Certificate">Character &amp; Conduct Certificate</option>
                    <option value="Transfer Certificate (TC)">Transfer Certificate (TC)</option>
                    <option value="Merit & Academic Excellence Certificate">Merit &amp; Academic Excellence Certificate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Certificate Ref No *</label>
                  <input
                    type="text"
                    required
                    value={certForm.certificateNo}
                    onChange={(e) => setCertForm({ ...certForm, certificateNo: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Father Name</label>
                  <input
                    type="text"
                    value={certForm.fatherName}
                    onChange={(e) => setCertForm({ ...certForm, fatherName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mother Name</label>
                  <input
                    type="text"
                    value={certForm.motherName}
                    onChange={(e) => setCertForm({ ...certForm, motherName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Conduct &amp; Merit Remarks</label>
                <textarea
                  rows={2}
                  value={certForm.conductRemarks}
                  onChange={(e) => setCertForm({ ...certForm, conductRemarks: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCertModalOpen(false)}
                  className="px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white rounded-xl shadow-md cursor-pointer"
                >
                  Generate &amp; Save Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD FEE PAYMENT MODAL */}
      {isReceiptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">Record Fee Payment &amp; Issue Receipt</h3>
              <button onClick={() => setIsReceiptModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveReceipt} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Scholar *</label>
                <select
                  required
                  value={receiptForm.studentId}
                  onChange={(e) => setReceiptForm({ ...receiptForm, studentId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.rollOrEmpNo}) · {s.departmentOrClass}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Term *</label>
                  <select
                    value={receiptForm.paymentForTerm}
                    onChange={(e) => setReceiptForm({ ...receiptForm, paymentForTerm: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="Quarter 1">Quarter 1</option>
                    <option value="Quarter 2">Quarter 2</option>
                    <option value="Quarter 3">Quarter 3</option>
                    <option value="Quarter 4">Quarter 4</option>
                    <option value="Annual Composite">Annual Composite</option>
                    <option value="Admission & Enrollment">Admission &amp; Enrollment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Receipt Number *</label>
                  <input
                    type="text"
                    required
                    value={receiptForm.receiptNo}
                    onChange={(e) => setReceiptForm({ ...receiptForm, receiptNo: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">Fee Breakdown (₹)</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500">Admission Fee</label>
                    <input
                      type="number"
                      value={receiptForm.admissionFee}
                      onChange={(e) => setReceiptForm({ ...receiptForm, admissionFee: Number(e.target.value) })}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">Tuition Fee</label>
                    <input
                      type="number"
                      value={receiptForm.tuitionFee}
                      onChange={(e) => setReceiptForm({ ...receiptForm, tuitionFee: Number(e.target.value) })}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">Hostel &amp; Mess</label>
                    <input
                      type="number"
                      value={receiptForm.hostelMessFee}
                      onChange={(e) => setReceiptForm({ ...receiptForm, hostelMessFee: Number(e.target.value) })}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] text-slate-500">Amount Paid (₹)</label>
                    <input
                      type="number"
                      value={receiptForm.amountPaid}
                      onChange={(e) => setReceiptForm({ ...receiptForm, amountPaid: Number(e.target.value) })}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono font-bold text-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">Payment Mode</label>
                    <select
                      value={receiptForm.paymentMode}
                      onChange={(e) => setReceiptForm({ ...receiptForm, paymentMode: e.target.value as any })}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                    >
                      <option value="UPI / Online">UPI / Online</option>
                      <option value="Bank Transfer / NEFT">Bank Transfer / NEFT</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque / DD">Cheque / DD</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Ref / UTR</label>
                <input
                  type="text"
                  value={receiptForm.transactionRef}
                  onChange={(e) => setReceiptForm({ ...receiptForm, transactionRef: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md cursor-pointer"
                >
                  Save &amp; Generate Money Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
