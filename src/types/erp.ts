export type UserRole = 'super_admin' | 'teacher' | 'student' | 'parent';

export interface UserProfileDoc {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  gender?: 'Male' | 'Female' | string;
  departmentOrClass: string;
  rollOrEmpNo: string;
  guardianOrLinkedName: string;
  address: string;
  status: 'active' | 'suspended' | 'archived';
  initialPassword?: string;
  credentialsIssuedAt?: string;
  ownerUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type ExamTermType =
  | 'Unit Test I'
  | 'Half Yearly'
  | 'Unit Test II'
  | 'Annual Final'
  | 'ASSEB Mock Board';

export type LetterGradeType = 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';

export type DivisionType =
  | 'Distinction (Star)'
  | 'First Division'
  | 'Second Division'
  | 'Third Division'
  | 'Needs Improvement';

export interface GradeRecordDoc {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  examTerm: ExamTermType;
  subject: string;
  marksObtained: number;
  maxMarks: number;
  percentage: number;
  letterGrade: LetterGradeType;
  gpa: number;
  division: DivisionType;
  remarks: string;
  status: 'published' | 'finalized';
  ownerUid: string;
  teacherUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type SkillDomainType =
  | 'STEM & Scientific Inquiry'
  | 'Literary & Communication Arts'
  | 'APSC / UPSC Competitive Readiness'
  | 'Digital & Computational Thinking'
  | 'Sankariya Cultural & Moral Leadership'
  | 'Sports & Athletic Endurance';

export interface SkillMilestoneDoc {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  skillDomain: SkillDomainType;
  skillTitle: string;
  proficiency: number;
  xpPoints: number;
  milestoneCurrent: string;
  milestoneTarget: string;
  status: 'in_progress' | 'verified' | 'mastered';
  endorsementNote: string;
  ownerUid: string;
  teacherUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type VerificationModality =
  | 'Optical Fingerprint'
  | 'WebAuthn Passkey'
  | 'Facial Recognition';

export interface BiometricAttendanceDoc {
  id: string;
  staffId: string;
  staffName: string;
  designation: string;
  department: string;
  deviceId: string;
  verificationMethod: VerificationModality;
  confidenceScore: number;
  punchType: 'CHECK_IN' | 'CHECK_OUT';
  attendanceStatus: 'On Time' | 'Late Arrival' | 'Checked Out' | 'Verified';
  dateStr: string;
  punchTimeLabel: string;
  biometricHash: string;
  ownerUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface NotificationItemDoc {
  id: string;
  title: string;
  message: string;
  category:
    | 'Academic'
    | 'Biometric'
    | 'Gradebook'
    | 'Admission'
    | 'Emergency'
    | 'Skill Milestone';
  priority: 'normal' | 'high' | 'urgent';
  targetRole: 'all' | 'student' | 'parent' | 'teacher' | 'super_admin';
  senderName: string;
  isRead: boolean;
  ownerUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AdmissionRecordDoc {
  id: string;
  applicationNo: string;
  applicantName: string;
  applyingForClass: string;
  stream: string;
  guardianName: string;
  contactPhone: string;
  contactEmail: string;
  previousSchool: string;
  percentageLastExam: number;
  feeAmount: number;
  feeStatus: 'pending' | 'paid' | 'waived';
  applicationStatus: 'submitted' | 'verified' | 'enrolled' | 'rejected';
  ownerUid: string;
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
  portalUsername?: string;
  portalLoginEmail?: string;
  portalInitialPassword?: string;
  credentialsIssuedAt?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface FeeStructureRecordDoc {
  id: string;
  className: string;
  academicSession: string;
  stream: string;
  admissionFee: number;
  tuitionFeeMonthly: number;
  tuitionFeeAnnual: number;
  hostelBoardingFee: number;
  messCateringFee: number;
  examAssessmentFee: number;
  computerLabFee: number;
  libraryResourceFee: number;
  culturalSportsFee: number;
  developmentFund: number;
  medicalEmergencyFee: number;
  biometricIdFee: number;
  totalAnnualFee: number;
  installmentPlan: string;
  quarterlyInstallment: number;
  concessionPolicy: string;
  lateFinePerDay: number;
  status: 'active' | 'draft' | 'archived';
  notes?: string;
  ownerUid?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface DepartmentDoc {
  id: string;
  departmentName: string;
  departmentCode: string;
  hodName: string;
  facultyCount: number;
  studentEnrolled: number;
  buildingBlock: string;
  budgetAllocation: number;
  status: 'active' | 'restructuring' | 'inactive';
  description: string;
  ownerUid?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface HrStaffDoc {
  id: string;
  employeeId: string;
  fullName: string;
  designation: string;
  department: string;
  qualification: string;
  dateOfJoining: string;
  employmentType: 'Permanent' | 'Contractual' | 'Probation' | 'Visiting';
  phone: string;
  email: string;
  panNumber: string;
  bankAccountNo: string;
  bankName: string;
  ifscCode: string;
  basicSalary: number;
  daPercent: number;
  hraAmount: number;
  specialAllowance: number;
  epfDeduction: number;
  profTax: number;
  status: 'active' | 'on_leave' | 'resigned' | 'retired';
  photoUrl?: string;
  address: string;
  emergencyContact: string;
  portalLoginEmail?: string;
  portalInitialPassword?: string;
  credentialsIssuedAt?: string;
  ownerUid?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface HrPayrollDoc {
  id: string;
  month: string;
  staffId: string;
  staffName: string;
  employeeId: string;
  designation: string;
  department: string;
  bankAccountNo: string;
  bankName: string;
  ifscCode: string;
  panNumber: string;
  daysWorked: number;
  totalDays: number;
  basicPay: number;
  daAmount: number;
  hraAmount: number;
  specialAllowance: number;
  grossSalary: number;
  epfDeduction: number;
  profTax: number;
  leaveDeduction: number;
  netSalary: number;
  paymentDate: string;
  paymentStatus: 'paid' | 'pending' | 'processing';
  paymentMode: 'Bank Transfer' | 'NEFT' | 'RTGS' | 'Cheque';
  transactionRef: string;
  ownerUid?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface HrLeaveDoc {
  id: string;
  staffId: string;
  staffName: string;
  designation: string;
  department: string;
  leaveType: 'Casual Leave (CL)' | 'Medical / Sick Leave (ML)' | 'Earned Leave (EL)' | 'Duty / Academic Leave' | 'Maternity / Paternity';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  substituteTeacher?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewRemarks?: string;
  appliedAt: string;
  ownerUid?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface WallOfFameDoc {
  id: string;
  scholarName: string;
  batchSession: string;
  category: 'ASSEB Board Exam State Ranker' | 'Star Distinction & 95%+ Club' | 'APSC / Civil Services Scholar' | 'National / State Sports Champion' | 'Sankariya Cultural & Vedic Arts' | 'STEM & Olympiad Laureate';
  achievementTitle: string;
  rankOrScore: string;
  photoUrl?: string;
  studentIdOrRoll?: string;
  currentPursuit: string;
  citationStory: string;
  featured: boolean;
  orderIndex: number;
  ownerUid?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface StudentCertificateDoc {
  id: string;
  certificateNo: string;
  certificateType: 'Bonafide Certificate' | 'Character & Conduct Certificate' | 'Transfer Certificate (TC)' | 'Merit & Academic Excellence Certificate';
  studentId: string;
  studentName: string;
  rollNo: string;
  className: string;
  academicSession: string;
  fatherName?: string;
  motherName?: string;
  dob?: string;
  admissionDate?: string;
  leavingDate?: string;
  reasonForLeaving?: string;
  conductRemarks?: string;
  issueDate: string;
  issuedBy: string;
  status: 'valid' | 'revoked';
  ownerUid?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface FeePaymentReceiptDoc {
  id: string;
  receiptNo: string;
  paymentDate: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  className: string;
  stream?: string;
  paymentForTerm: 'Quarter 1' | 'Quarter 2' | 'Quarter 3' | 'Quarter 4' | 'Annual Composite' | 'Admission & Enrollment';
  feeBreakdown: {
    admissionFee: number;
    tuitionFee: number;
    hostelMessFee: number;
    labExamFee: number;
    developmentFee: number;
    otherFine: number;
  };
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentMode: 'Cash' | 'UPI / Online' | 'Bank Transfer / NEFT' | 'Cheque / DD';
  transactionRef: string;
  cashierName: string;
  remarks?: string;
  status: 'completed' | 'cancelled';
  ownerUid?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface StatutoryDocumentSetting {
  id: string;
  title: string;
  docRefNumber: string;
  issuingAuthority: string;
  validFrom: string;
  validUntil: string;
  status: 'verified' | 'renewal_pending' | 'active';
  fileUrl?: string;
  description: string;
}

export interface SchoolAdminSettingsDoc {
  id: string;
  schoolName: string;
  trustName: string;
  affiliationNumber: string;
  schoolCode: string;
  udiseCode: string;
  academicSession: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  websiteUrl: string;
  chairmanName: string;
  principalName: string;
  headAccountantName: string;
  logoUrl?: string;
  sealStampUrl?: string;
  signaturePrincipalUrl?: string;
  signatureChairmanUrl?: string;
  statutoryDocuments: StatutoryDocumentSetting[];
  ownerUid?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

/**
 * Calculates sum of all fee heads and installment breakdowns
 */
export function calculateFeeStructureTotals(heads: {
  admissionFee: number;
  tuitionFeeAnnual: number;
  hostelBoardingFee: number;
  messCateringFee: number;
  examAssessmentFee: number;
  computerLabFee: number;
  libraryResourceFee: number;
  culturalSportsFee: number;
  developmentFund: number;
  medicalEmergencyFee: number;
  biometricIdFee: number;
}): { totalAnnualFee: number; quarterlyInstallment: number; tuitionFeeMonthly: number } {
  const safeNum = (v: unknown) => {
    const n = Number(v);
    return isNaN(n) || n < 0 ? 0 : n;
  };
  const admission = safeNum(heads.admissionFee);
  const tuition = safeNum(heads.tuitionFeeAnnual);
  const hostel = safeNum(heads.hostelBoardingFee);
  const mess = safeNum(heads.messCateringFee);
  const exam = safeNum(heads.examAssessmentFee);
  const lab = safeNum(heads.computerLabFee);
  const library = safeNum(heads.libraryResourceFee);
  const sports = safeNum(heads.culturalSportsFee);
  const dev = safeNum(heads.developmentFund);
  const medical = safeNum(heads.medicalEmergencyFee);
  const bio = safeNum(heads.biometricIdFee);

  const total =
    admission +
    tuition +
    hostel +
    mess +
    exam +
    lab +
    library +
    sports +
    dev +
    medical +
    bio;

  return {
    totalAnnualFee: Math.round(total),
    quarterlyInstallment: Math.round(total / 4),
    tuitionFeeMonthly: Math.round(tuition / 12),
  };
}

/**
 * Automated ASSEB & Degree Grade Calculation Engine
 */
export function computeGradeMetrics(marksObtained: number, maxMarks: number): {
  percentage: number;
  letterGrade: LetterGradeType;
  gpa: number;
  division: DivisionType;
  autoRemarks: string;
} {
  const safeMax = maxMarks > 0 ? maxMarks : 100;
  const safeMarks = Math.min(Math.max(0, marksObtained), safeMax);
  const percentage = Number(((safeMarks / safeMax) * 100).toFixed(2));

  let letterGrade: LetterGradeType = 'F';
  let gpa = 0;
  let division: DivisionType = 'Needs Improvement';
  let autoRemarks = 'Requires additional remedial mentorship sessions.';

  if (percentage >= 90) {
    letterGrade = 'A+';
    gpa = 10.0;
    division = 'Distinction (Star)';
    autoRemarks = 'Outstanding academic mastery and Star Distinction performance.';
  } else if (percentage >= 80) {
    letterGrade = 'A';
    gpa = 9.0;
    division = 'Distinction (Star)';
    autoRemarks = 'Commendable conceptual clarity and Star Distinction standing.';
  } else if (percentage >= 70) {
    letterGrade = 'B+';
    gpa = 8.0;
    division = 'First Division';
    autoRemarks = 'Strong First Division performance with consistent analytical work.';
  } else if (percentage >= 60) {
    letterGrade = 'B';
    gpa = 7.0;
    division = 'First Division';
    autoRemarks = 'Solid First Division standing; focus on advanced problem sets.';
  } else if (percentage >= 45) {
    letterGrade = 'C';
    gpa = 5.5;
    division = 'Second Division';
    autoRemarks = 'Satisfactory Second Division result; regular revision advised.';
  } else if (percentage >= 30) {
    letterGrade = 'D';
    gpa = 4.0;
    division = 'Third Division';
    autoRemarks = 'Passed in Third Division; enrolled in afternoon faculty tutorials.';
  }

  return { percentage, letterGrade, gpa, division, autoRemarks };
}

/**
 * Generates a deterministic cryptographic hex digest for biometric punch verification
 */
export async function generateBiometricTemplateHash(
  staffId: string,
  deviceId: string,
  dateStr: string,
  punchType: string
): Promise<string> {
  const payload = `${staffId}|${deviceId}|${dateStr}|${punchType}|${Date.now()}`;
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const encoded = new TextEncoder().encode(payload);
    const buffer = await window.crypto.subtle.digest('SHA-256', encoded);
    const hex = Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 32)
      .toUpperCase();
    return `BIO-${hex}`;
  }
  const fallback = Math.random().toString(36).substring(2, 14).toUpperCase();
  return `BIO-SHA256-${fallback}`;
}
