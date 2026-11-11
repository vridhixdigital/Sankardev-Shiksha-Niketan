/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { createUserWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import {
  auth,
  db,
  handleFirestoreError,
  isUserAdmin,
  OperationType,
  PRIMARY_ADMIN_EMAIL,
  PRIMARY_ADMIN_UID,
  sanitizeId,
  sanitizeString,
  signInWithGooglePopup,
  signOutUser,
  SUPER_ADMIN_EMAIL,
} from './firebase';
import { PublicPageTab, PublicPortal } from './components/PublicPortal';
import { ErpDashboard } from './components/ErpDashboard';
import { OfflineIndicator } from './components/OfflineIndicator';
import { initializeSsnGohpurErpDatabase } from './data/erpSeedService';
import {
  AdmissionRecordDoc,
  BiometricAttendanceDoc,
  DepartmentDoc,
  FeeStructureRecordDoc,
  GradeRecordDoc,
  NotificationItemDoc,
  SkillMilestoneDoc,
  UserProfileDoc,
  WallOfFameDoc,
  HrStaffDoc,
  HrPayrollDoc,
  HrLeaveDoc,
  StudentCertificateDoc,
  FeePaymentReceiptDoc,
  SchoolAdminSettingsDoc,
} from './types/erp';
import {
  FALLBACK_TEACHER_GRADES,
  FALLBACK_STUDENT_GRADES,
  FALLBACK_SKILLS,
  FALLBACK_BIOMETRICS,
  FALLBACK_NOTIFICATIONS,
} from './data/mockPortalData';
import {
  INITIAL_FEE_STRUCTURES,
  seedDefaultFeeStructures,
  INITIAL_DEPARTMENTS,
  seedDefaultDepartments,
  INITIAL_WALL_OF_FAME,
  seedDefaultHrAndWallOfFame,
  INITIAL_HR_STAFF,
  INITIAL_HR_PAYROLL,
  INITIAL_HR_LEAVES,
  INITIAL_STUDENT_CERTIFICATES,
  INITIAL_FEE_PAYMENTS,
  DEFAULT_SCHOOL_SETTINGS,
} from './data/erpSeedService';

export default function App() {
  const [viewMode, setViewMode] = useState<'public' | 'erp'>('public');
  const [publicPage, setPublicPage] = useState<PublicPageTab>('home');

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [users, setUsers] = useState<UserProfileDoc[]>([]);
  const [grades, setGrades] = useState<GradeRecordDoc[]>([]);
  const [skills, setSkills] = useState<SkillMilestoneDoc[]>([]);
  const [biometricLogs, setBiometricLogs] = useState<BiometricAttendanceDoc[]>([]);
  const [notifications, setNotifications] = useState<NotificationItemDoc[]>([]);
  const [admissions, setAdmissions] = useState<AdmissionRecordDoc[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructureRecordDoc[]>(INITIAL_FEE_STRUCTURES);
  const [departments, setDepartments] = useState<DepartmentDoc[]>([]);
  const [wallOfFame, setWallOfFame] = useState<WallOfFameDoc[]>([]);
  const [hrStaff, setHrStaff] = useState<HrStaffDoc[]>(INITIAL_HR_STAFF);
  const [hrPayroll, setHrPayroll] = useState<HrPayrollDoc[]>(INITIAL_HR_PAYROLL);
  const [hrLeaves, setHrLeaves] = useState<HrLeaveDoc[]>(INITIAL_HR_LEAVES);
  const [certificates, setCertificates] = useState<StudentCertificateDoc[]>(INITIAL_STUDENT_CERTIFICATES);
  const [payments, setPayments] = useState<FeePaymentReceiptDoc[]>(INITIAL_FEE_PAYMENTS);
  const [schoolSettings, setSchoolSettings] = useState<SchoolAdminSettingsDoc>(DEFAULT_SCHOOL_SETTINGS as SchoolAdminSettingsDoc);
  const [latestToast, setLatestToast] = useState<NotificationItemDoc | null>(null);

  const hasAutoSeededRef = useRef(false);
  const knownNotifIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthReady(true);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    const wofQuery = collection(db, 'wall_of_fame');
    const unsubWof = onSnapshot(
      wofQuery,
      (snap) => {
        const list: WallOfFameDoc[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<WallOfFameDoc, 'id'>),
        }));
        if (list.length === 0 && currentUser && isUserAdmin(currentUser)) {
          seedDefaultHrAndWallOfFame(currentUser.uid).catch((err) => console.error('WOF seed error:', err));
        } else if (list.length > 0) {
          setWallOfFame(list);
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'wall_of_fame')
    );
    return () => unsubWof();
  }, [currentUser]);

  const isAdminUser = isUserAdmin(currentUser);

  useEffect(() => {
    if (!isAuthReady || !currentUser) {
      setUsers([]);
      setGrades([]);
      setSkills([]);
      setBiometricLogs([]);
      setNotifications([]);
      setAdmissions([]);
      return;
    }

    setIsLoadingData(true);
    const uid = currentUser.uid;
    const isSuper = isUserAdmin(currentUser);

    const usersQuery = isSuper
      ? collection(db, 'users')
      : query(collection(db, 'users'), where('ownerUid', '==', uid));

    const gradesQuery = isSuper
      ? collection(db, 'grades')
      : query(collection(db, 'grades'), where('ownerUid', '==', uid));

    const skillsQuery = isSuper
      ? collection(db, 'skills')
      : query(collection(db, 'skills'), where('ownerUid', '==', uid));

    const bioQuery = isSuper
      ? collection(db, 'biometric_logs')
      : query(collection(db, 'biometric_logs'), where('ownerUid', '==', uid));

    const notifQuery = isSuper
      ? collection(db, 'notifications')
      : query(collection(db, 'notifications'), where('ownerUid', '==', uid));

    const admQuery = isSuper
      ? collection(db, 'admissions')
      : query(collection(db, 'admissions'), where('ownerUid', '==', uid));

    const unsubUsers = onSnapshot(
      usersQuery,
      (snap) => {
        const list: UserProfileDoc[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<UserProfileDoc, 'id'>),
        }));
        setUsers(list);
        setIsLoadingData(false);

        // Auto-initialize SSN Gohpur records once for a freshly authenticated user if empty
        if (
          list.length === 0 &&
          !hasAutoSeededRef.current &&
          (currentUser.emailVerified || isUserAdmin(currentUser))
        ) {
          hasAutoSeededRef.current = true;
          initializeSsnGohpurErpDatabase(
            currentUser.uid,
            currentUser.email || PRIMARY_ADMIN_EMAIL,
            currentUser.displayName || 'Mr. Uday Aditya Goswami'
          ).catch((err) => console.error('Auto-seed error:', err));
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'users')
    );

    const email = (currentUser.email || '').toLowerCase();
    const isTeacher =
      email.includes('.phy@') ||
      email.includes('.eng@') ||
      email.includes('.tchr@') ||
      email.includes('.faculty@') ||
      email.includes('teacher') ||
      email.includes('faculty') ||
      email.includes('educator');

    const unsubGrades = onSnapshot(
      gradesQuery,
      (snap) => {
        const list: GradeRecordDoc[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<GradeRecordDoc, 'id'>),
        }));
        if (list.length === 0 && !isSuper) {
          setGrades(isTeacher ? FALLBACK_TEACHER_GRADES : FALLBACK_STUDENT_GRADES);
        } else {
          setGrades(list);
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'grades')
    );

    const unsubSkills = onSnapshot(
      skillsQuery,
      (snap) => {
        const list: SkillMilestoneDoc[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<SkillMilestoneDoc, 'id'>),
        }));
        if (list.length === 0 && !isSuper) {
          setSkills(FALLBACK_SKILLS);
        } else {
          setSkills(list);
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'skills')
    );

    const unsubBio = onSnapshot(
      bioQuery,
      (snap) => {
        const list: BiometricAttendanceDoc[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<BiometricAttendanceDoc, 'id'>),
        }));
        if (list.length === 0 && !isSuper) {
          setBiometricLogs(FALLBACK_BIOMETRICS);
        } else {
          setBiometricLogs(list);
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'biometric_logs')
    );

    const unsubNotifs = onSnapshot(
      notifQuery,
      (snap) => {
        const list: NotificationItemDoc[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<NotificationItemDoc, 'id'>),
        }));
        if (list.length === 0 && !isSuper) {
          setNotifications(FALLBACK_NOTIFICATIONS);
        } else {
          setNotifications(list);
        }

        // Trigger real-time arrival banner when a new notification is added
        for (const item of list) {
          if (!knownNotifIdsRef.current.has(item.id)) {
            if (knownNotifIdsRef.current.size > 0 && !item.isRead) {
              setLatestToast(item);
            }
            knownNotifIdsRef.current.add(item.id);
          }
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'notifications')
    );

    const unsubAdm = onSnapshot(
      admQuery,
      (snap) => {
        const list: AdmissionRecordDoc[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<AdmissionRecordDoc, 'id'>),
        }));
        setAdmissions(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'admissions')
    );

    const feeQuery = collection(db, 'fee_structures');
    const unsubFees = onSnapshot(
      feeQuery,
      (snap) => {
        const list: FeeStructureRecordDoc[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<FeeStructureRecordDoc, 'id'>),
        }));
        if (list.length === 0 && isSuper) {
          seedDefaultFeeStructures(currentUser.uid).catch((err) => console.error('Fee seed error:', err));
        } else if (list.length > 0) {
          setFeeStructures(list);
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'fee_structures')
    );

    const deptQuery = collection(db, 'departments');
    const unsubDepts = onSnapshot(
      deptQuery,
      (snap) => {
        const list: DepartmentDoc[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<DepartmentDoc, 'id'>),
        }));
        if (list.length === 0 && isSuper) {
          seedDefaultDepartments(currentUser.uid).catch((err) => console.error('Department seed error:', err));
        } else if (list.length > 0) {
          setDepartments(list);
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'departments')
    );

    // HR Staff
    const hrStaffQuery = collection(db, 'hr_staff');
    const unsubHrStaff = onSnapshot(
      hrStaffQuery,
      (snap) => {
        const list: HrStaffDoc[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<HrStaffDoc, 'id'>),
        }));
        if (list.length > 0) {
          setHrStaff(list);
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'hr_staff')
    );

    // HR Payroll
    const hrPayrollQuery = collection(db, 'hr_payroll');
    const unsubHrPayroll = onSnapshot(
      hrPayrollQuery,
      (snap) => {
        const list: HrPayrollDoc[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<HrPayrollDoc, 'id'>),
        }));
        if (list.length > 0) {
          setHrPayroll(list);
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'hr_payroll')
    );

    // HR Leaves
    const hrLeavesQuery = collection(db, 'hr_leaves');
    const unsubHrLeaves = onSnapshot(
      hrLeavesQuery,
      (snap) => {
        const list: HrLeaveDoc[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<HrLeaveDoc, 'id'>),
        }));
        if (list.length > 0) {
          setHrLeaves(list);
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'hr_leaves')
    );

    // Student Certificates
    const certQuery = collection(db, 'student_certificates');
    const unsubCerts = onSnapshot(
      certQuery,
      (snap) => {
        const list: StudentCertificateDoc[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<StudentCertificateDoc, 'id'>),
        }));
        if (list.length > 0) {
          setCertificates(list);
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'student_certificates')
    );

    // Fee Payments
    const payQuery = collection(db, 'fee_payments');
    const unsubPayments = onSnapshot(
      payQuery,
      (snap) => {
        const list: FeePaymentReceiptDoc[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<FeePaymentReceiptDoc, 'id'>),
        }));
        if (list.length > 0) {
          setPayments(list);
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'fee_payments')
    );

    // School Admin Settings
    const settingsDocRef = doc(db, 'school_settings', 'global_settings');
    const unsubSettings = onSnapshot(
      settingsDocRef,
      (snap) => {
        if (snap.exists()) {
          setSchoolSettings({
            id: snap.id,
            ...(snap.data() as Omit<SchoolAdminSettingsDoc, 'id'>),
          });
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'school_settings/global_settings')
    );

    return () => {
      unsubUsers();
      unsubGrades();
      unsubSkills();
      unsubBio();
      unsubNotifs();
      unsubAdm();
      unsubFees();
      unsubDepts();
      unsubHrStaff();
      unsubHrPayroll();
      unsubHrLeaves();
      unsubCerts();
      unsubPayments();
      unsubSettings();
    };
  }, [isAuthReady, currentUser]);

  const handleSignIn = async () => {
    try {
      await signInWithGooglePopup();
      setViewMode('erp');
    } catch (err) {
      console.error('Google Sign-In failed:', err);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setViewMode('public');
  };

  const handlePublicOnlineAdmission = async (formData: {
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
  }): Promise<AdmissionRecordDoc> => {
    const appNo = `SSN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const docId = sanitizeId(`adm_${Date.now()}`, 64, 'adm_public');
    const feeAmount = formData.applyingForClass.includes('B.A.')
      ? 9500
      : formData.applyingForClass.includes('Science')
      ? 14800
      : 11200;

    let activeUid = currentUser?.uid;

    // Smart Enrollment: Automatic Firebase Auth & Identity creation
    if (!activeUid && formData.contactEmail && formData.portalPassword && formData.portalPassword.length >= 6) {
      try {
        const userCred = await createUserWithEmailAndPassword(
          auth,
          formData.contactEmail.trim(),
          formData.portalPassword
        );
        activeUid = userCred.user.uid;
      } catch (authErr) {
        // Continue application flow smoothly even if account already exists
        console.warn('Smart enrollment auth info:', authErr);
      }
    }

    const record: AdmissionRecordDoc = {
      id: docId,
      applicationNo: appNo,
      applicantName: sanitizeString(formData.applicantName, 2, 100, 'Applicant'),
      applyingForClass: sanitizeString(formData.applyingForClass, 2, 60, 'Class VI'),
      stream: sanitizeString(formData.stream || 'General Academic', 2, 40, 'General'),
      guardianName: sanitizeString(formData.guardianName, 2, 100, 'Guardian'),
      contactPhone: sanitizeString(formData.contactPhone, 5, 24, '+919954656161'),
      contactEmail: sanitizeString(formData.contactEmail, 3, 120, 'applicant@ssngohpur.ac.in'),
      previousSchool: sanitizeString(formData.previousSchool || 'Assam Board School', 2, 120, 'Assam Board School'),
      percentageLastExam: formData.percentageLastExam || 85,
      feeAmount,
      feeStatus: 'pending',
      applicationStatus: 'submitted',
      ownerUid: activeUid || 'provisional_applicant',
      studentPhoto: formData.studentPhoto,
      photoType: formData.photoType,
      firstName: formData.firstName,
      lastName: formData.lastName,
      gender: formData.gender,
      dob: formData.dob,
      mobileNumber: formData.mobileNumber,
      caste: formData.caste,
      religion: formData.religion,
      bloodGroup: formData.bloodGroup,
      hostelRequired: formData.hostelRequired,
      fatherName: formData.fatherName,
      guardianIs: formData.guardianIs,
      guardianRelation: formData.guardianRelation,
      guardianPhone: formData.guardianPhone,
      guardianEmail: formData.guardianEmail,
      guardianOccupation: formData.guardianOccupation,
      guardianAddress: formData.guardianAddress,
      permanentAddress: formData.permanentAddress,
      bankAccountNo: formData.bankAccountNo,
      bankAccountHolder: formData.bankAccountHolder,
      bankName: formData.bankName,
      ifscCode: formData.ifscCode,
      portalUsername: formData.contactEmail,
    };

    if (activeUid && (currentUser?.emailVerified || activeUid)) {
      try {
        await setDoc(doc(db, 'admissions', docId), {
          applicationNo: record.applicationNo,
          applicantName: record.applicantName,
          applyingForClass: record.applyingForClass,
          stream: record.stream,
          guardianName: record.guardianName,
          contactPhone: record.contactPhone,
          contactEmail: record.contactEmail,
          previousSchool: record.previousSchool,
          percentageLastExam: record.percentageLastExam,
          feeAmount: record.feeAmount,
          feeStatus: 'pending',
          applicationStatus: 'submitted',
          ownerUid: activeUid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `admissions/${docId}`);
      }
    }

    setAdmissions((prev) => [record, ...prev]);
    return record;
  };

  if (viewMode === 'erp') {
    return (
      <>
        <ErpDashboard
          currentUser={currentUser}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          onBackToPublicPortal={() => setViewMode('public')}
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
          isAdminUser={isAdminUser}
          isLoadingData={isLoadingData}
          latestToast={latestToast}
          onDismissToast={() => setLatestToast(null)}
        />
        <OfflineIndicator />
      </>
    );
  }

  return (
    <>
      <PublicPortal
        activePage={publicPage}
        setActivePage={setPublicPage}
        onOpenErpPortal={() => setViewMode('erp')}
        isAuthenticated={!!currentUser}
        currentUser={currentUser}
        userEmail={currentUser?.email}
        onSignOut={handleSignOut}
        liveNotifications={notifications}
        liveAdmissions={admissions}
        liveWallOfFame={wallOfFame}
        onSubmitOnlineAdmission={handlePublicOnlineAdmission}
      />
      <OfflineIndicator />
    </>
  );
}
