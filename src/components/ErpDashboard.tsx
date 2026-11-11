import React, { useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  db,
  handleFirestoreError,
  OperationType,
  sanitizeId,
  sanitizeString,
  VALIDATION_LIMITS,
  isUserAdmin,
  PRIMARY_ADMIN_EMAIL,
  PRIMARY_ADMIN_UID,
} from '../firebase';
import {
  AdmissionRecordDoc,
  BiometricAttendanceDoc,
  computeGradeMetrics,
  calculateFeeStructureTotals,
  FeeStructureRecordDoc,
  generateBiometricTemplateHash,
  GradeRecordDoc,
  NotificationItemDoc,
  SkillMilestoneDoc,
  UserProfileDoc,
  UserRole,
  DepartmentDoc,
  WallOfFameDoc,
  HrStaffDoc,
  HrPayrollDoc,
  HrLeaveDoc,
  StudentCertificateDoc,
  FeePaymentReceiptDoc,
  SchoolAdminSettingsDoc,
} from '../types/erp';
import { DEFAULT_SCHOOL_SETTINGS } from '../data/erpSeedService';
import { AdminGovernanceDashboard } from './dashboards/AdminGovernanceDashboard';
import { TeacherFacultyDashboard } from './dashboards/TeacherFacultyDashboard';
import { StudentParentDashboard } from './dashboards/StudentParentDashboard';
import { SmartGlobalLoginDialog } from './SmartGlobalLoginDialog';

interface ErpDashboardProps {
  currentUser: User | null;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onBackToPublicPortal: () => void;
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
  isAdminUser: boolean;
  isLoadingData: boolean;
  latestToast: NotificationItemDoc | null;
  onDismissToast: () => void;
}

export const ErpDashboard: React.FC<ErpDashboardProps> = ({
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
  isAdminUser,
  isLoadingData,
  latestToast,
  onDismissToast,
}) => {
  // Preview portal view state (only available to Super Admins to preview teacher & student roles)
  const [previewRole, setPreviewRole] = useState<'admin' | 'teacher' | 'student' | null>(null);

  // Unauthenticated Gate: Opens the Smart Global Login Dialog immediately
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-6 lg:p-12">
        <SmartGlobalLoginDialog
          isOpen={true}
          onClose={onBackToPublicPortal}
          onLoginSuccess={() => {}}
        />
      </div>
    );
  }

  // Determine true authenticated role based on email, UID, and profile
  const userEmail = (currentUser.email || '').toLowerCase().trim();
  const isSuperAdmin =
    isAdminUser ||
    isUserAdmin(currentUser) ||
    currentUser.uid === PRIMARY_ADMIN_UID ||
    userEmail === PRIMARY_ADMIN_EMAIL.toLowerCase();

  const existingUserProfile = users.find(
    (u) =>
      (u.ownerUid && u.ownerUid === currentUser.uid) ||
      (u.email && u.email.toLowerCase().trim() === userEmail)
  );

  const isTeacher =
    existingUserProfile?.role === 'teacher' ||
    userEmail.includes('.phy@') ||
    userEmail.includes('.eng@') ||
    userEmail.includes('.tchr@') ||
    userEmail.includes('.faculty@') ||
    userEmail.includes('teacher') ||
    userEmail.includes('faculty') ||
    userEmail.includes('educator');

  const resolvedRole: 'admin' | 'teacher' | 'student' = isSuperAdmin
    ? 'admin'
    : isTeacher
    ? 'teacher'
    : 'student';

  // Active view: if Super Admin is previewing, use previewRole, else use resolvedRole
  const currentViewRole = isSuperAdmin && previewRole ? previewRole : resolvedRole;

  // --- FIRESTORE MUTATION HANDLERS ---

  // 1. User Management (Admin Only)
  const handleAddUser = async (userUpdates: Partial<UserProfileDoc>) => {
    if (!currentUser) return;
    const studentDocId = sanitizeId(`usr_${Date.now()}`, 64, 'usr_student');
    const studentEmail = sanitizeString(userUpdates.email || 'student@ssngohpur.ac.in', 3, 120);
    const studentName = sanitizeString(userUpdates.fullName || 'New Scholar', 2, 100);
    const rollNo = sanitizeId(userUpdates.rollOrEmpNo || 'SSN-2026-001', 40);
    const guardianName = sanitizeString(userUpdates.guardianOrLinkedName || 'Guardian', 1, 100);
    const phoneNo = sanitizeString(userUpdates.phone || '+91 9954656161', 5, 24);
    const addressStr = sanitizeString(userUpdates.address || 'Solengi, Gohpur', 2, 200);
    const classStr = sanitizeString(userUpdates.departmentOrClass || 'Class IX', 1, 80);
    const roleType = userUpdates.role || 'student';

    try {
      // 1. Create Student User Document
      await setDoc(doc(db, 'users', studentDocId), {
        fullName: studentName,
        email: studentEmail,
        phone: phoneNo,
        role: roleType,
        departmentOrClass: classStr,
        rollOrEmpNo: rollNo,
        guardianOrLinkedName: guardianName,
        address: addressStr,
        status: 'active',
        ownerUid: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 2. If role is student, automatically create Parent / Guardian credential as well!
      if (roleType === 'student') {
        const parentDocId = sanitizeId(`usr_par_${Date.now()}`, 64, 'usr_parent');
        const parentEmail = `parent.${studentEmail.split('@')[0]}@ssngohpur.ac.in`;
        await setDoc(doc(db, 'users', parentDocId), {
          fullName: `${guardianName} (Parent of ${studentName})`,
          email: parentEmail,
          phone: phoneNo,
          role: 'parent',
          departmentOrClass: `Parent Portal - ${classStr}`,
          rollOrEmpNo: `PAR-${rollNo}`,
          guardianOrLinkedName: studentName,
          address: addressStr,
          status: 'active',
          ownerUid: currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${studentDocId}`);
    }
  };

  const handleUpdateUser = async (id: string, updates: Partial<UserProfileDoc>) => {
    try {
      await updateDoc(doc(db, 'users', id), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${id}`);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${id}`);
    }
  };

  // 2. Admission Status Update (Admin Only)
  const handleUpdateAdmissionStatus = async (
    id: string,
    status: 'submitted' | 'verified' | 'enrolled' | 'rejected',
    feeStatus: 'pending' | 'paid' | 'waived'
  ) => {
    try {
      const targetAdmission = admissions.find((a) => a.id === id);
      const studentLoginEmail =
        targetAdmission?.portalLoginEmail ||
        targetAdmission?.contactEmail ||
        (targetAdmission
          ? `${targetAdmission.applicantName.toLowerCase().replace(/[^a-z0-9]/g, '')}.${targetAdmission.applicationNo.replace(/[^a-zA-Z0-9]/g, '').slice(-4)}@ssngohpur.ac.in`
          : `student.${Date.now()}@ssngohpur.ac.in`);

      const studentPassword =
        targetAdmission?.portalInitialPassword ||
        `SSN-STD@${targetAdmission?.applicationNo?.replace(/[^a-zA-Z0-9]/g, '') || Math.floor(1000 + Math.random() * 9000)}`;

      await updateDoc(doc(db, 'admissions', id), {
        applicationStatus: status,
        feeStatus,
        portalLoginEmail: studentLoginEmail,
        portalInitialPassword: studentPassword,
        credentialsIssuedAt: status === 'enrolled' ? new Date().toISOString() : targetAdmission?.credentialsIssuedAt || null,
        updatedAt: serverTimestamp(),
      });

      // If enrolled, provision their official Student profile in `users` collection immediately
      if (status === 'enrolled' && targetAdmission) {
        const studentUserId = sanitizeId(`usr_std_${targetAdmission.applicationNo.replace(/[^a-zA-Z0-9]/g, '')}`, 64, `usr_std_${Date.now()}`);
        await setDoc(
          doc(db, 'users', studentUserId),
          {
            fullName: targetAdmission.applicantName,
            email: studentLoginEmail,
            phone: targetAdmission.contactPhone || targetAdmission.mobileNumber || '+91 9954656161',
            role: 'student',
            departmentOrClass: targetAdmission.stream || targetAdmission.applyingForClass || 'Secondary Wing',
            rollOrEmpNo: targetAdmission.applicationNo,
            guardianOrLinkedName: targetAdmission.guardianName || targetAdmission.fatherName || 'Guardian',
            address: targetAdmission.permanentAddress || 'Solengi, Gohpur',
            status: 'active',
            initialPassword: studentPassword,
            credentialsIssuedAt: new Date().toISOString(),
            ownerUid: targetAdmission.ownerUid || currentUser?.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `admissions/${id}`);
    }
  };

  const handleAddAdmission = async (admissionUpdates: Record<string, any>) => {
    if (!currentUser) return;
    const docId = sanitizeId(`adm_${Date.now()}`, 64, 'adm_new');
    const applicantName = sanitizeString(admissionUpdates.applicantName || 'Scholar Name', 2, 100);
    const appClass = sanitizeString(admissionUpdates.applyingForClass || 'Class IX', 1, 60);
    const guardianName = sanitizeString(admissionUpdates.guardianName || 'Guardian', 1, 100);
    const contactPhone = sanitizeString(admissionUpdates.contactPhone || '+91 9954656161', 5, 24);
    const applicantEmail = sanitizeString(admissionUpdates.email || `scholar.${Date.now().toString().slice(-4)}@ssngohpur.ac.in`, 3, 120);
    const address = sanitizeString(admissionUpdates.address || 'Solengi, Gohpur', 2, 200);
    const rollNo = `SSN-ADM-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      // 1. Save Admission Record with full mirrored fields
      await setDoc(doc(db, 'admissions', docId), {
        applicationNo: rollNo,
        applicantName,
        applyingForClass: appClass,
        stream: sanitizeString(admissionUpdates.stream || 'General Foundation', 1, 60),
        guardianName,
        contactPhone,
        contactEmail: applicantEmail,
        email: applicantEmail,
        address,
        previousSchool: sanitizeString(admissionUpdates.previousSchool || 'Assam Board School', 2, 100),
        percentageLastExam: admissionUpdates.percentageLastExam || 85,
        feeAmount: admissionUpdates.feeAmount || 49000,
        feeStatus: admissionUpdates.feeStatus || 'pending',
        applicationStatus: 'submitted',
        hostelBlock: sanitizeString(admissionUpdates.hostelBlock || 'Brahmaputra Boys Hostel - Block A', 2, 100),
        roomNumber: sanitizeString(admissionUpdates.roomNumber || 'Room 102', 1, 40),
        messPreference: admissionUpdates.messPreference || 'Pure Satvic Vegetarian',
        studentPhoto: admissionUpdates.studentPhoto || '',
        photoType: admissionUpdates.photoType || 'url',
        firstName: admissionUpdates.firstName || '',
        lastName: admissionUpdates.lastName || '',
        gender: admissionUpdates.gender || 'Male',
        dob: admissionUpdates.dob || '',
        mobileNumber: admissionUpdates.mobileNumber || contactPhone,
        caste: admissionUpdates.caste || 'General',
        religion: admissionUpdates.religion || 'Hinduism',
        bloodGroup: admissionUpdates.bloodGroup || 'A+',
        hostelRequired: admissionUpdates.hostelRequired || 'Yes',
        fatherName: admissionUpdates.fatherName || '',
        guardianIs: admissionUpdates.guardianIs || 'Father',
        guardianRelation: admissionUpdates.guardianRelation || 'Father',
        guardianPhone: admissionUpdates.guardianPhone || contactPhone,
        guardianEmail: admissionUpdates.guardianEmail || '',
        guardianOccupation: admissionUpdates.guardianOccupation || '',
        guardianAddress: admissionUpdates.guardianAddress || address,
        permanentAddress: admissionUpdates.permanentAddress || address,
        bankAccountNo: admissionUpdates.bankAccountNo || '',
        bankAccountHolder: admissionUpdates.bankAccountHolder || '',
        bankName: admissionUpdates.bankName || '',
        ifscCode: admissionUpdates.ifscCode || '',
        portalUsername: applicantEmail,
        ownerUid: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 2. Automatically create both Student User credential AND Parent User credential in User Master!
      const studentUserId = sanitizeId(`usr_st_${Date.now()}`, 64, 'usr_student');
      await setDoc(doc(db, 'users', studentUserId), {
        fullName: applicantName,
        email: applicantEmail,
        phone: contactPhone,
        role: 'student',
        departmentOrClass: appClass,
        rollOrEmpNo: rollNo,
        guardianOrLinkedName: guardianName,
        address,
        status: 'active',
        ownerUid: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const parentUserId = sanitizeId(`usr_pr_${Date.now()}`, 64, 'usr_parent');
      const parentEmail = `parent.${applicantEmail.split('@')[0]}@ssngohpur.ac.in`;
      await setDoc(doc(db, 'users', parentUserId), {
        fullName: `${guardianName} (Parent of ${applicantName})`,
        email: parentEmail,
        phone: contactPhone,
        role: 'parent',
        departmentOrClass: `Parent Portal - ${appClass}`,
        rollOrEmpNo: `PAR-${rollNo}`,
        guardianOrLinkedName: applicantName,
        address,
        status: 'active',
        ownerUid: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `admissions/${docId}`);
    }
  };

  // Fee Structure Directory CRUD (Admin Only)
  const handleAddFeeStructure = async (fee: Partial<FeeStructureRecordDoc>) => {
    if (!currentUser) return;
    const cleanClassName = sanitizeString(fee.className || 'Class VI', 2, 60);
    const docId = sanitizeId(
      fee.id || `fee_${cleanClassName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
      64,
      'fee_new'
    );
    const totals = calculateFeeStructureTotals({
      admissionFee: fee.admissionFee || 0,
      tuitionFeeAnnual: fee.tuitionFeeAnnual || 0,
      hostelBoardingFee: fee.hostelBoardingFee || 0,
      messCateringFee: fee.messCateringFee || 0,
      examAssessmentFee: fee.examAssessmentFee || 0,
      computerLabFee: fee.computerLabFee || 0,
      libraryResourceFee: fee.libraryResourceFee || 0,
      culturalSportsFee: fee.culturalSportsFee || 0,
      developmentFund: fee.developmentFund || 0,
      medicalEmergencyFee: fee.medicalEmergencyFee || 0,
      biometricIdFee: fee.biometricIdFee || 0,
    });

    try {
      await setDoc(doc(db, 'fee_structures', docId), {
        className: cleanClassName,
        academicSession: sanitizeString(fee.academicSession || '2026-27', 4, 20),
        stream: sanitizeString(fee.stream || 'General Foundation', 2, 40),
        admissionFee: Math.max(0, Number(fee.admissionFee) || 0),
        tuitionFeeMonthly: totals.tuitionFeeMonthly,
        tuitionFeeAnnual: Math.max(0, Number(fee.tuitionFeeAnnual) || 0),
        hostelBoardingFee: Math.max(0, Number(fee.hostelBoardingFee) || 0),
        messCateringFee: Math.max(0, Number(fee.messCateringFee) || 0),
        examAssessmentFee: Math.max(0, Number(fee.examAssessmentFee) || 0),
        computerLabFee: Math.max(0, Number(fee.computerLabFee) || 0),
        libraryResourceFee: Math.max(0, Number(fee.libraryResourceFee) || 0),
        culturalSportsFee: Math.max(0, Number(fee.culturalSportsFee) || 0),
        developmentFund: Math.max(0, Number(fee.developmentFund) || 0),
        medicalEmergencyFee: Math.max(0, Number(fee.medicalEmergencyFee) || 0),
        biometricIdFee: Math.max(0, Number(fee.biometricIdFee) || 0),
        totalAnnualFee: totals.totalAnnualFee,
        installmentPlan: sanitizeString(fee.installmentPlan || 'Quarterly (4 Quarters)', 2, 60),
        quarterlyInstallment: totals.quarterlyInstallment,
        concessionPolicy: sanitizeString(fee.concessionPolicy || 'Standard Trust Concession applies.', 2, 240),
        lateFinePerDay: Math.max(0, Number(fee.lateFinePerDay) || 25),
        status: fee.status || 'active',
        notes: sanitizeString(fee.notes || '', 0, 300, ''),
        ownerUid: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `fee_structures/${docId}`);
    }
  };

  const handleUpdateFeeStructure = async (id: string, updates: Partial<FeeStructureRecordDoc>) => {
    try {
      const existing = feeStructures.find((f) => f.id === id);
      const merged = { ...existing, ...updates };
      const totals = calculateFeeStructureTotals({
        admissionFee: merged.admissionFee || 0,
        tuitionFeeAnnual: merged.tuitionFeeAnnual || 0,
        hostelBoardingFee: merged.hostelBoardingFee || 0,
        messCateringFee: merged.messCateringFee || 0,
        examAssessmentFee: merged.examAssessmentFee || 0,
        computerLabFee: merged.computerLabFee || 0,
        libraryResourceFee: merged.libraryResourceFee || 0,
        culturalSportsFee: merged.culturalSportsFee || 0,
        developmentFund: merged.developmentFund || 0,
        medicalEmergencyFee: merged.medicalEmergencyFee || 0,
        biometricIdFee: merged.biometricIdFee || 0,
      });

      const sanitizedUpdates: Record<string, any> = {
        ...updates,
        totalAnnualFee: totals.totalAnnualFee,
        quarterlyInstallment: totals.quarterlyInstallment,
        tuitionFeeMonthly: totals.tuitionFeeMonthly,
        updatedAt: serverTimestamp(),
      };
      delete sanitizedUpdates.id;
      delete sanitizedUpdates.createdAt;

      await updateDoc(doc(db, 'fee_structures', id), sanitizedUpdates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `fee_structures/${id}`);
    }
  };

  const handleDeleteFeeStructure = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'fee_structures', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `fee_structures/${id}`);
    }
  };

  const handleAddDepartment = async (dept: Partial<DepartmentDoc>) => {
    if (!currentUser) return;
    const cleanName = sanitizeString(dept.departmentName || 'New Department', 2, 80);
    const docId = sanitizeId(
      dept.id || `dept_${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
      64,
      'dept_new'
    );
    try {
      await setDoc(doc(db, 'departments', docId), {
        departmentName: cleanName,
        departmentCode: sanitizeString(dept.departmentCode || 'DEPT-01', 2, 20),
        hodName: sanitizeString(dept.hodName || 'HOD Name', 2, 80),
        facultyCount: Number(dept.facultyCount) || 5,
        studentEnrolled: Number(dept.studentEnrolled) || 100,
        buildingBlock: sanitizeString(dept.buildingBlock || 'Main Block', 2, 100),
        budgetAllocation: Number(dept.budgetAllocation) || 500000,
        status: dept.status || 'active',
        description: sanitizeString(dept.description || '', 0, 300, ''),
        ownerUid: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `departments/${docId}`);
    }
  };

  const handleUpdateDepartment = async (id: string, updates: Partial<DepartmentDoc>) => {
    try {
      const sanitizedUpdates: Record<string, any> = {
        ...updates,
        updatedAt: serverTimestamp(),
      };
      delete sanitizedUpdates.id;
      delete sanitizedUpdates.createdAt;
      await updateDoc(doc(db, 'departments', id), sanitizedUpdates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `departments/${id}`);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'departments', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `departments/${id}`);
    }
  };

  const handleAddWallOfFame = async (award: Partial<WallOfFameDoc>) => {
    if (!currentUser) return;
    const cleanName = sanitizeString(award.scholarName || 'Scholar Name', 2, 80);
    const docId = sanitizeId(
      award.id || `wof_${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
      64,
      'wof_new'
    );
    try {
      await setDoc(doc(db, 'wall_of_fame', docId), {
        scholarName: cleanName,
        batchSession: sanitizeString(award.batchSession || '2025–26', 4, 20),
        category: award.category || 'ASSEB Board Exam State Ranker',
        achievementTitle: sanitizeString(award.achievementTitle || 'State Ranker', 2, 120),
        rankOrScore: sanitizeString(award.rankOrScore || '98%', 2, 50),
        photoUrl: award.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        studentIdOrRoll: sanitizeString(award.studentIdOrRoll || '', 0, 40, ''),
        currentPursuit: sanitizeString(award.currentPursuit || 'Higher Studies', 2, 150),
        citationStory: sanitizeString(award.citationStory || 'Outstanding merit.', 2, 400),
        featured: award.featured ?? true,
        orderIndex: Number(award.orderIndex) || 1,
        ownerUid: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `wall_of_fame/${docId}`);
    }
  };

  const handleUpdateWallOfFame = async (id: string, updates: Partial<WallOfFameDoc>) => {
    try {
      const sanitizedUpdates: Record<string, any> = {
        ...updates,
        updatedAt: serverTimestamp(),
      };
      delete sanitizedUpdates.id;
      delete sanitizedUpdates.createdAt;
      await updateDoc(doc(db, 'wall_of_fame', id), sanitizedUpdates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `wall_of_fame/${id}`);
    }
  };

  const handleDeleteWallOfFame = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'wall_of_fame', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `wall_of_fame/${id}`);
    }
  };

  // --- HR MANAGEMENT HANDLERS ---
  const handleAddStaff = async (staff: Partial<HrStaffDoc>) => {
    if (!currentUser) return;
    const docId = sanitizeId(staff.id || `hr_${Date.now()}`, 64, 'hr_staff');
    const staffEmail =
      staff.email ||
      `${staff.fullName?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'faculty'}.${(staff.department || 'acad').toLowerCase().slice(0, 3)}@ssngohpur.ac.in`;
    const staffPassword =
      staff.portalInitialPassword ||
      `SSN-FAC@${staff.employeeId?.replace(/[^a-zA-Z0-9]/g, '') || Math.floor(1000 + Math.random() * 9000)}`;

    try {
      await setDoc(doc(db, 'hr_staff', docId), {
        ...staff,
        email: staffEmail,
        portalLoginEmail: staffEmail,
        portalInitialPassword: staffPassword,
        credentialsIssuedAt: new Date().toISOString(),
        ownerUid: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Automatically provision the corresponding Educator account in `users` collection
      const userDocId = sanitizeId(`usr_fac_${staff.employeeId?.replace(/[^a-zA-Z0-9]/g, '') || Date.now()}`, 64);
      await setDoc(
        doc(db, 'users', userDocId),
        {
          fullName: staff.fullName || 'Faculty Member',
          email: staffEmail,
          phone: staff.phone || '+91 9954656161',
          role: 'teacher',
          departmentOrClass: staff.department || 'Academic Faculty',
          rollOrEmpNo: staff.employeeId || 'SSN-FAC-001',
          guardianOrLinkedName: 'Faculty Advisory Council',
          address: staff.address || 'Bapadev Kshetra, Solengi, Gohpur',
          status: staff.status === 'active' ? 'active' : 'suspended',
          initialPassword: staffPassword,
          credentialsIssuedAt: new Date().toISOString(),
          ownerUid: currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `hr_staff/${docId}`);
    }
  };

  const handleUpdateStaff = async (id: string, updates: Partial<HrStaffDoc>) => {
    try {
      const sanitized: Record<string, any> = { ...updates, updatedAt: serverTimestamp() };
      delete sanitized.id;
      delete sanitized.createdAt;
      await updateDoc(doc(db, 'hr_staff', id), sanitized);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `hr_staff/${id}`);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'hr_staff', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `hr_staff/${id}`);
    }
  };

  const handleAddPayroll = async (payroll: Partial<HrPayrollDoc>) => {
    if (!currentUser) return;
    const docId = sanitizeId(payroll.id || `pay_${Date.now()}`, 64, 'hr_payroll');
    try {
      await setDoc(doc(db, 'hr_payroll', docId), {
        ...payroll,
        ownerUid: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `hr_payroll/${docId}`);
    }
  };

  const handleUpdatePayroll = async (id: string, updates: Partial<HrPayrollDoc>) => {
    try {
      const sanitized: Record<string, any> = { ...updates, updatedAt: serverTimestamp() };
      delete sanitized.id;
      delete sanitized.createdAt;
      await updateDoc(doc(db, 'hr_payroll', id), sanitized);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `hr_payroll/${id}`);
    }
  };

  const handleDeletePayroll = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'hr_payroll', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `hr_payroll/${id}`);
    }
  };

  const handleAddLeave = async (leave: Partial<HrLeaveDoc>) => {
    if (!currentUser) return;
    const docId = sanitizeId(leave.id || `leave_${Date.now()}`, 64, 'hr_leave');
    try {
      await setDoc(doc(db, 'hr_leaves', docId), {
        ...leave,
        ownerUid: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `hr_leaves/${docId}`);
    }
  };

  const handleUpdateLeave = async (id: string, updates: Partial<HrLeaveDoc>) => {
    try {
      const sanitized: Record<string, any> = { ...updates, updatedAt: serverTimestamp() };
      delete sanitized.id;
      delete sanitized.createdAt;
      await updateDoc(doc(db, 'hr_leaves', id), sanitized);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `hr_leaves/${id}`);
    }
  };

  const handleDeleteLeave = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'hr_leaves', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `hr_leaves/${id}`);
    }
  };

  // --- INSTITUTIONAL DOCUMENTS, CERTIFICATES, PAYMENTS & SETTINGS HANDLERS ---
  const handleAddCertificate = async (cert: Partial<StudentCertificateDoc>) => {
    if (!currentUser) return;
    const docId = sanitizeId(cert.id || `cert_${Date.now()}`, 64, 'cert_doc');
    try {
      await setDoc(doc(db, 'student_certificates', docId), {
        ...cert,
        ownerUid: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `student_certificates/${docId}`);
    }
  };

  const handleUpdateCertificate = async (id: string, updates: Partial<StudentCertificateDoc>) => {
    try {
      const sanitized: Record<string, any> = { ...updates, updatedAt: serverTimestamp() };
      delete sanitized.id;
      delete sanitized.createdAt;
      await updateDoc(doc(db, 'student_certificates', id), sanitized);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `student_certificates/${id}`);
    }
  };

  const handleAddPaymentReceipt = async (payment: Partial<FeePaymentReceiptDoc>) => {
    if (!currentUser) return;
    const docId = sanitizeId(payment.id || `payrcp_${Date.now()}`, 64, 'payment_receipt');
    try {
      await setDoc(doc(db, 'fee_payments', docId), {
        ...payment,
        ownerUid: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `fee_payments/${docId}`);
    }
  };

  const handleUpdatePaymentReceipt = async (id: string, updates: Partial<FeePaymentReceiptDoc>) => {
    if (!currentUser) return;
    const docId = sanitizeId(id, 64, 'payment_receipt');
    try {
      const sanitized = { ...updates };
      delete (sanitized as any).createdAt;
      await updateDoc(doc(db, 'fee_payments', docId), {
        ...sanitized,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `fee_payments/${docId}`);
    }
  };

  const handleDeletePaymentReceipt = async (id: string) => {
    if (!currentUser) return;
    const docId = sanitizeId(id, 64, 'payment_receipt');
    try {
      await deleteDoc(doc(db, 'fee_payments', docId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `fee_payments/${docId}`);
    }
  };

  const handleUpdateSchoolSettings = async (settingsUpdates: Partial<SchoolAdminSettingsDoc>) => {
    if (!currentUser) return;
    try {
      await setDoc(
        doc(db, 'school_settings', 'global_settings'),
        {
          ...settingsUpdates,
          ownerUid: currentUser.uid,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `school_settings/global_settings`);
    }
  };

  // 3. Broadcast Notice (Admin Only)
  const handleBroadcastNotice = async (notice: Partial<NotificationItemDoc>) => {
    if (!currentUser) return;
    const docId = sanitizeId(`notif_${Date.now()}`, 64, 'notif_adm');
    try {
      await setDoc(doc(db, 'notifications', docId), {
        title: sanitizeString(notice.title || 'Official Bulletin', 2, 120),
        message: sanitizeString(notice.message || 'Notification content', 2, 500),
        category: notice.category || 'Academic',
        priority: notice.priority || 'high',
        targetRole: notice.targetRole || 'all',
        senderName: sanitizeString(notice.senderName || 'School Administration', 2, 80),
        isRead: false,
        ownerUid: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `notifications/${docId}`);
    }
  };

  // 4. Subject Grade Submission (Teacher / Admin)
  const handleSaveGrade = async (grade: Partial<GradeRecordDoc>) => {
    if (!currentUser) return;
    const docId = sanitizeId(`grd_${Date.now()}`, 64, 'grd_entry');
    const marks = grade.marksObtained || 90;
    const max = grade.maxMarks || 100;
    const metrics = computeGradeMetrics(marks, max);

    try {
      await setDoc(doc(db, 'grades', docId), {
        studentId: sanitizeId(grade.studentId || 'SSN-001', 64),
        studentName: sanitizeString(grade.studentName || 'Scholar', 2, 100),
        className: sanitizeString(grade.className || 'Class XI', 2, 60),
        examTerm: grade.examTerm || 'Annual Final',
        subject: sanitizeString(grade.subject || 'Physics', 2, 60),
        marksObtained: marks,
        maxMarks: max,
        percentage: metrics.percentage,
        letterGrade: metrics.letterGrade,
        gpa: metrics.gpa,
        division: metrics.division,
        remarks: sanitizeString(grade.remarks || 'Satisfactory academic performance.', 1, 240),
        status: 'published',
        ownerUid: currentUser.uid,
        teacherUid: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `grades/${docId}`);
    }
  };

  // 5. Skill Endorsement (Teacher / Admin)
  const handleEndorseSkill = async (skillId: string, note: string, xpBonus: number) => {
    const existing = skills.find((s) => s.id === skillId);
    if (!existing) return;
    try {
      await updateDoc(doc(db, 'skills', skillId), {
        xpPoints: Math.min(100000, existing.xpPoints + xpBonus),
        proficiency: Math.min(100, existing.proficiency + 10),
        endorsementNote: sanitizeString(note, 2, 240, 'Verified by Faculty Mentor.'),
        status: 'verified',
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `skills/${skillId}`);
    }
  };

  // 6. Biometric Punch (Teacher / Staff)
  const handleBiometricPunch = async (punchType: 'CHECK_IN' | 'CHECK_OUT') => {
    if (!currentUser) return;
    const now = new Date();
    const docId = sanitizeId(`bio_${Date.now()}`, 64, 'bio_punch');
    const dateStr = now.toISOString().slice(0, 10);
    const punchTimeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const staffName =
      currentUser.displayName ||
      existingUserProfile?.fullName ||
      (currentUser.email ? currentUser.email.split('@')[0].replace(/[._-]/g, ' ') : 'Educator Staff');

    const bioHash = await generateBiometricTemplateHash(
      'SSN-FAC-101',
      'OPTICAL-SSN-01',
      dateStr,
      punchType
    );

    try {
      await setDoc(doc(db, 'biometric_logs', docId), {
        staffId: sanitizeId('SSN-FAC-101', 64),
        staffName: sanitizeString(staffName, 2, 100),
        designation: 'Senior Faculty Member',
        department: 'Science & Humanities',
        deviceId: sanitizeId('OPTICAL-SSN-01', 40),
        verificationMethod: 'Optical Fingerprint',
        confidenceScore: 98.6,
        punchType,
        attendanceStatus: punchType === 'CHECK_IN' ? 'On Time' : 'Checked Out',
        dateStr,
        punchTimeLabel,
        biometricHash: bioHash,
        ownerUid: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `biometric_logs/${docId}`);
    }
  };

  // --- RENDER DEDICATED ISOLATED DASHBOARDS ---

  if (currentViewRole === 'admin') {
    return (
      <AdminGovernanceDashboard
        currentUser={currentUser}
        onSignOut={onSignOut}
        onBackToPublicPortal={onBackToPublicPortal}
        onSwitchPortalView={isSuperAdmin ? (view) => setPreviewRole(view) : undefined}
        users={users}
        grades={grades}
        skills={skills}
        biometricLogs={biometricLogs}
        notifications={notifications}
        admissions={admissions}
        feeStructures={feeStructures}
        departments={departments}
        wallOfFame={wallOfFame}
        hrStaff={hrStaff}
        hrPayroll={hrPayroll}
        hrLeaves={hrLeaves}
        certificates={certificates}
        payments={payments}
        schoolSettings={schoolSettings}
        onAddDepartment={handleAddDepartment}
        onUpdateDepartment={handleUpdateDepartment}
        onDeleteDepartment={handleDeleteDepartment}
        onAddWallOfFame={handleAddWallOfFame}
        onUpdateWallOfFame={handleUpdateWallOfFame}
        onDeleteWallOfFame={handleDeleteWallOfFame}
        onAddStaff={handleAddStaff}
        onUpdateStaff={handleUpdateStaff}
        onDeleteStaff={handleDeleteStaff}
        onAddPayroll={handleAddPayroll}
        onUpdatePayroll={handleUpdatePayroll}
        onDeletePayroll={handleDeletePayroll}
        onAddLeave={handleAddLeave}
        onUpdateLeave={handleUpdateLeave}
        onDeleteLeave={handleDeleteLeave}
        onAddCertificate={handleAddCertificate}
        onUpdateCertificate={handleUpdateCertificate}
        onAddPaymentReceipt={handleAddPaymentReceipt}
        onUpdatePaymentReceipt={handleUpdatePaymentReceipt}
        onDeletePaymentReceipt={handleDeletePaymentReceipt}
        onUpdateSchoolSettings={handleUpdateSchoolSettings}
        isLoadingData={isLoadingData}
        onAddUser={handleAddUser}
        onUpdateUser={handleUpdateUser}
        onDeleteUser={handleDeleteUser}
        onAddAdmission={handleAddAdmission}
        onUpdateAdmissionStatus={handleUpdateAdmissionStatus}
        onBroadcastNotice={handleBroadcastNotice}
        onAddFeeStructure={handleAddFeeStructure}
        onUpdateFeeStructure={handleUpdateFeeStructure}
        onDeleteFeeStructure={handleDeleteFeeStructure}
      />
    );
  }

  if (currentViewRole === 'teacher') {
    return (
      <TeacherFacultyDashboard
        currentUser={currentUser}
        onSignOut={onSignOut}
        onBackToPublicPortal={onBackToPublicPortal}
        onSwitchPortalView={isSuperAdmin ? (view) => setPreviewRole(view) : undefined}
        grades={grades}
        skills={skills}
        biometricLogs={biometricLogs}
        notifications={notifications}
        isLoadingData={isLoadingData}
        onSaveGrade={handleSaveGrade}
        onEndorseSkill={handleEndorseSkill}
        onBiometricPunch={handleBiometricPunch}
      />
    );
  }

  // Student / Parent Portal
  return (
    <StudentParentDashboard
      currentUser={currentUser}
      onSignOut={onSignOut}
      onBackToPublicPortal={onBackToPublicPortal}
      onSwitchPortalView={isSuperAdmin ? (view) => setPreviewRole(view) : undefined}
      grades={grades}
      skills={skills}
      biometricLogs={biometricLogs}
      notifications={notifications}
      admissions={admissions}
      isLoadingData={isLoadingData}
    />
  );
};
