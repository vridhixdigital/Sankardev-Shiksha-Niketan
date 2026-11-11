/**
 * Firestore Security Rules Test Suite — The "Dirty Dozen" Payloads
 * Verifies that all 12 adversarial payloads defined in security_spec.md return PERMISSION_DENIED.
 */

export interface DirtyDozenTestCase {
  id: number;
  name: string;
  collection: string;
  docId: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: { uid: string; email: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: DirtyDozenTestCase[] = [
  {
    id: 1,
    name: 'Shadow Field Injection on UserProfile',
    collection: 'users',
    docId: 'usr_101',
    operation: 'create',
    auth: { uid: 'attacker_uid', email: 'attacker@example.com', email_verified: true },
    payload: {
      fullName: 'Bikash Kalita',
      email: 'bikash@ssngohpur.ac.in',
      phone: '+919954656161',
      role: 'student',
      departmentOrClass: 'Class X',
      rollOrEmpNo: 'SSN-X-01',
      guardianOrLinkedName: 'Ramen Kalita',
      address: 'Solengi, Gohpur',
      status: 'active',
      ownerUid: 'attacker_uid',
      isSuperAdmin: true,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Self-Assigned Super Admin Escalation',
    collection: 'users',
    docId: 'attacker_uid',
    operation: 'create',
    auth: { uid: 'attacker_uid', email: 'attacker@example.com', email_verified: true },
    payload: {
      fullName: 'Attacker User',
      email: 'attacker@example.com',
      phone: '+919999999999',
      role: 'super_admin',
      departmentOrClass: 'Administration',
      rollOrEmpNo: 'ADM-99',
      guardianOrLinkedName: 'NA',
      address: 'Gohpur',
      status: 'active',
      ownerUid: 'attacker_uid',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Unverified Admin Email Spoof',
    collection: 'admins',
    docId: 'spoof_uid',
    operation: 'create',
    auth: { uid: 'spoof_uid', email: 'priyakrdeuri@gmail.com', email_verified: false },
    payload: {
      uid: 'spoof_uid',
      email: 'priyakrdeuri@gmail.com',
      grantedBy: 'spoof_uid',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Cross-User Identity Spoofing on Grade Creation',
    collection: 'grades',
    docId: 'grd_1',
    operation: 'create',
    auth: { uid: 'attacker_uid', email: 'attacker@example.com', email_verified: true },
    payload: {
      studentId: 'SSN-XII-04',
      studentName: 'Ananya Borah',
      className: 'Class XII Science',
      examTerm: 'Unit Test I',
      subject: 'Physics',
      marksObtained: 98,
      maxMarks: 100,
      percentage: 98,
      letterGrade: 'A+',
      gpa: 10,
      division: 'Distinction (Star)',
      remarks: 'Excellent',
      status: 'published',
      ownerUid: 'victim_uid',
      teacherUid: 'victim_teacher_uid',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'PII Horizontal Scrape on UserProfile',
    collection: 'users',
    docId: 'victim_uid',
    operation: 'get',
    auth: { uid: 'attacker_uid', email: 'attacker@example.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Unauthorized Collection List Scraping on Users',
    collection: 'users',
    docId: '*',
    operation: 'list',
    auth: { uid: 'attacker_uid', email: 'attacker@example.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Terminal State Bypass on Finalized Grade',
    collection: 'grades',
    docId: 'grd_locked',
    operation: 'update',
    auth: { uid: 'teacher_uid', email: 'teacher@ssngohpur.ac.in', email_verified: true },
    payload: {
      marksObtained: 40,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Immutable ownerUid Tampering on Skill Update',
    collection: 'skills',
    docId: 'skl_01',
    operation: 'update',
    auth: { uid: 'student_1', email: 'student@ssngohpur.ac.in', email_verified: true },
    payload: {
      ownerUid: 'attacker_uid',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Client Timestamp Forgery on Biometric Attendance',
    collection: 'biometric_logs',
    docId: 'bio_01',
    operation: 'create',
    auth: { uid: 'staff_1', email: 'staff@ssngohpur.ac.in', email_verified: true },
    payload: {
      createdAt: '2020-01-01T00:00:00Z',
      updatedAt: '2020-01-01T00:00:00Z',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Volumetric String Overflow on Notification Message',
    collection: 'notifications',
    docId: 'notif_01',
    operation: 'create',
    auth: { uid: 'staff_1', email: 'staff@ssngohpur.ac.in', email_verified: true },
    payload: {
      title: 'Alert',
      message: 'A'.repeat(1000),
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Path ID Poisoning on Admission Record',
    collection: 'admissions',
    docId: 'invalid$id#with!spaces',
    operation: 'create',
    auth: { uid: 'applicant_1', email: 'applicant@example.com', email_verified: true },
    payload: {},
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Value Poisoning on Whitelisted Skill Proficiency Key',
    collection: 'skills',
    docId: 'skl_01',
    operation: 'update',
    auth: { uid: 'student_1', email: 'student@ssngohpur.ac.in', email_verified: true },
    payload: {
      proficiency: 150,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
];
