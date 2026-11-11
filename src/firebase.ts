import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDocFromServer, getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const SUPER_ADMIN_EMAIL = 'priyakrdeuri@gmail.com';
export const PRIMARY_ADMIN_EMAIL = 'niketansankardevshiksha@gmail.com';
export const PRIMARY_ADMIN_UID = 'zEfyx0vxLmN4HX0nK9CKb2KIiKU2';

export const ADMINISTRATIVE_USERS = [
  'priyakrdeuri@gmail.com',
  'niketansankardevshiksha@gmail.com',
] as const;

export const ADMINISTRATIVE_UIDS = ['zEfyx0vxLmN4HX0nK9CKb2KIiKU2'] as const;

export function isUserAdmin(
  user: { email?: string | null; uid?: string } | null | undefined
): boolean {
  if (!user) return false;
  if (user.uid && (ADMINISTRATIVE_UIDS as readonly string[]).includes(user.uid)) return true;
  const email = (user.email || '').toLowerCase().trim();
  if (
    email === SUPER_ADMIN_EMAIL.toLowerCase() ||
    email === PRIMARY_ADMIN_EMAIL.toLowerCase() ||
    (ADMINISTRATIVE_USERS as readonly string[]).includes(email)
  ) {
    return true;
  }
  return false;
}

// Verbatim validation constants synchronized with firebase-blueprint.json & firestore.rules
export const ID_REGEX = /^[a-zA-Z0-9_\-]+$/;

export const VALIDATION_LIMITS = {
  idMax: 128,
  fullName: { min: 2, max: 100 },
  email: { min: 3, max: 120 },
  phone: { min: 5, max: 24 },
  departmentOrClass: { min: 1, max: 80 },
  rollOrEmpNo: { min: 1, max: 40 },
  guardianOrLinkedName: { min: 1, max: 100 },
  address: { min: 2, max: 200 },
  subject: { min: 2, max: 60 },
  remarks: { min: 1, max: 240 },
  skillTitle: { min: 2, max: 100 },
  milestone: { min: 2, max: 120 },
  endorsementNote: { min: 2, max: 240 },
  designation: { min: 2, max: 80 },
  department: { min: 2, max: 60 },
  deviceId: { min: 3, max: 40 },
  biometricHash: { min: 8, max: 64 },
  notificationTitle: { min: 2, max: 120 },
  notificationMessage: { min: 2, max: 500 },
  senderName: { min: 2, max: 80 },
  applicationNo: { min: 4, max: 32 },
  previousSchool: { min: 2, max: 120 },
} as const;

export function sanitizeString(val: string, minLen: number, maxLen: number, fallback = 'NA'): string {
  const trimmed = (val || '').trim();
  if (trimmed.length < minLen) {
    return fallback.padEnd(minLen, 'X').slice(0, maxLen);
  }
  return trimmed.slice(0, maxLen);
}

export function sanitizeId(val: string, maxLen = 64, fallback = 'ID-001'): string {
  const cleaned = (val || '').trim().replace(/[^a-zA-Z0-9_\-]/g, '-');
  if (!cleaned || !ID_REGEX.test(cleaned)) {
    return fallback;
  }
  return cleaned.slice(0, maxLen);
}

// Validate connection to Firestore on boot as required by firebase-integration-rpc skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function signInWithGooglePopup() {
  return signInWithPopup(auth, googleProvider);
}

export async function signOutUser() {
  return signOut(auth);
}
