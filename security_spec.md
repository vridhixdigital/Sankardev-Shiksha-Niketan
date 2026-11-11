# Security Specification — Sankardev Shiksha Niketan (SSN Gohpur) ERP

## 1. Data Invariants & Master Source of Truth

1. **Global Default-Deny Gate**: All paths not explicitly matched under `/databases/{database}/documents` are unconditionally denied (`allow read, write: if false;`).
2. **Verified Identity Invariant**: Every write operation (`create`, `update`, `delete`) across all collections requires `request.auth != null && request.auth.token.email_verified == true`.
3. **Zero-Trust Admin Verification**: Super Admin status (`isAdmin()`) is never read from client claims or mutable user profile fields. It is verified strictly via either:
   - Bootstrapped runtime owner email (`request.auth.token.email == 'priyakrdeuri@gmail.com' && request.auth.token.email_verified == true`), or
   - Existence of a trusted document at `/databases/$(database)/documents/admins/$(request.auth.uid)`.
4. **PII Isolation Invariant (`/users/{userId}`)**: User profiles contain PII (`email`, `phone`, `address`). Read (`get`, `list`) access is strictly restricted to the document owner (`resource.data.ownerUid == request.auth.uid`) or `isSuperAdminEmail()` / `isAdmin()`. Blanket `isSignedIn()` reads are forbidden. Self-assigned privilege escalation (`role == 'super_admin'`) by non-admins is strictly blocked.
5. **Query Enforcement & Cost Guard Invariant (`allow list`)**: Every `allow list` rule evaluates `resource.data` against `request.auth.uid` (or `isSuperAdminEmail()`) without invoking `get()` or `exists()` inside `allow list` blocks, preventing O(n) read cost amplification and unauthorized collection scraping.
6. **Path Variable & Volumetric Guard**: Every single-document target operation (`get`, `create`, `update`, `delete`) validates the path parameter via `isValidId(id)` (`^[a-zA-Z0-9_\-]+$`, max 128 chars). Every string field enforces exact `minLength` and `maxLength` bounds from `firebase-blueprint.json`.
7. **Temporal & Immutable Field Integrity**: On `create`, `createdAt == request.time` and `updatedAt == request.time`. On `update`, `createdAt == resource.data.createdAt`, `ownerUid == resource.data.ownerUid`, and `updatedAt == request.time`.
8. **Terminal State Locking**:
   - `/users/{userId}`: Once `resource.data.status == 'archived'`, non-admins cannot update the profile.
   - `/grades/{gradeId}`: Once `resource.data.status == 'finalized'`, non-admins cannot alter the grade record.
   - `/skills/{skillId}`: Once `resource.data.status == 'mastered'`, non-admins cannot alter the skill milestone.
   - `/admissions/{admissionId}`: Once `resource.data.applicationStatus == 'enrolled'` or `'rejected'`, non-admins cannot alter the admission record.

---

## 2. The "Dirty Dozen" Payloads

1. **Payload 1 — Shadow Field Injection (`/users/usr_101`)**:
   ```json
   {
     "fullName": "Bikash Kalita",
     "email": "bikash@ssngohpur.ac.in",
     "phone": "+919954656161",
     "role": "student",
     "departmentOrClass": "Class X",
     "rollOrEmpNo": "SSN-X-01",
     "guardianOrLinkedName": "Ramen Kalita",
     "address": "Solengi, Gohpur",
     "status": "active",
     "ownerUid": "attacker_uid",
     "isSuperAdmin": true
   }
   ```
   *Rejected by*: `data.keys().hasOnly(...)` in `isValidUserProfile`.

2. **Payload 2 — Self-Assigned Super Admin Escalation (`/users/attacker_uid`)**:
   ```json
   {
     "fullName": "Attacker User",
     "email": "attacker@example.com",
     "phone": "+919999999999",
     "role": "super_admin",
     "departmentOrClass": "Administration",
     "rollOrEmpNo": "ADM-99",
     "guardianOrLinkedName": "N/A",
     "address": "Gohpur",
     "status": "active",
     "ownerUid": "attacker_uid"
   }
   ```
   *Rejected by*: Non-admin create check requiring `incoming().role != 'super_admin'`.

3. **Payload 3 — Unverified Admin Email Spoof (`/admins/spoof_uid`)**:
   - Auth token: `{ email: "priyakrdeuri@gmail.com", email_verified: false }`
   *Rejected by*: `request.auth.token.email_verified == true` requirement in `isSuperAdminEmail()` and all write gates.

4. **Payload 4 — Cross-User Identity Spoofing on Grade Creation (`/grades/grd_1`)**:
   ```json
   {
     "studentId": "SSN-XII-04",
     "studentName": "Ananya Borah",
     "className": "Class XII Science",
     "examTerm": "Unit Test I",
     "subject": "Physics",
     "marksObtained": 98,
     "maxMarks": 100,
     "percentage": 98,
     "letterGrade": "A+",
     "gpa": 10,
     "division": "Distinction (Star)",
     "remarks": "Excellent",
     "status": "published",
     "ownerUid": "victim_uid",
     "teacherUid": "victim_teacher_uid"
   }
   ```
   *Rejected by*: `incoming().ownerUid == request.auth.uid || incoming().teacherUid == request.auth.uid || isAdmin()`.

5. **Payload 5 — PII Horizontal Scrape on `/users/victim_uid`**:
   - Authenticated user `attacker_uid` performs `getDoc(doc(db, 'users', 'victim_uid'))`.
   *Rejected by*: `allow get` restricting access to `isAdmin() || existing().ownerUid == request.auth.uid`.

6. **Payload 6 — Unauthorized Collection List Scraping on `/users`**:
   - Authenticated user `attacker_uid` performs `getDocs(collection(db, 'users'))` without filtering by `ownerUid == request.auth.uid`.
   *Rejected by*: `allow list: if isSignedIn() && (isSuperAdminEmail() || existing().ownerUid == request.auth.uid);`.

7. **Payload 7 — Terminal State Bypass on Finalized Grade (`/grades/grd_locked`)**:
   - Existing doc has `status: "finalized"`. Non-admin teacher attempts to update `marksObtained: 40`.
   *Rejected by*: Terminal state lock `existing().status != 'finalized' || isAdmin()`.

8. **Payload 8 — Immutable `ownerUid` Tampering on Skill Update (`/skills/skl_01`)**:
   - Existing doc has `ownerUid: "student_1"`. Update attempts to change `ownerUid` to `"attacker_uid"`.
   *Rejected by*: `incoming().ownerUid == existing().ownerUid` and `affectedKeys().hasOnly(...)`.

9. **Payload 9 — Client Timestamp Forgery (`/biometric_logs/bio_01`)**:
   - Create payload sets `createdAt` to a past timestamp `2020-01-01T00:00:00Z` instead of `serverTimestamp()`.
   *Rejected by*: `incoming().createdAt == request.time && incoming().updatedAt == request.time`.

10. **Payload 10 — Volumetric String Overflow / Denial of Wallet (`/notifications/notif_01`)**:
    - Create payload supplies a 50,000-character string in `message` (max 500).
    *Rejected by*: `data.message is string && data.message.size() >= 2 && data.message.size() <= 500`.

11. **Payload 11 — Path ID Poisoning (`/admissions/invalid$id#with!spaces`)**:
    - Write targeting document ID containing illegal characters or >128 chars.
    *Rejected by*: `isValidId(admissionId)` regex `^[a-zA-Z0-9_\-]+$`.

12. **Payload 12 — Value Poisoning on Whitelisted Update Key (`/skills/skl_01`)**:
    - Update modifies whitelisted field `proficiency` to `"one hundred"` (string instead of number 0–100) or `150`.
    *Rejected by*: `isValidSkillMilestone(incoming())` wrapping the `allow update` block and enforcing `data.proficiency is number && data.proficiency >= 0 && data.proficiency <= 100`.
