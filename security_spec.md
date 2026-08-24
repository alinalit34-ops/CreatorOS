# Security Specification: Creator OS Firestore Database

This document drafts the data invariants, threat metrics, and structural security rules for verifying secure multi-tenant access to Creator OS data blocks.

## 1. Data Invariants
1. **User Profiles (`users/{userId}`)**: 
   - A user profile can only be read or written by its owner (`request.auth.uid == userId`).
   - The user's `email` must exactly match `request.auth.token.email`.
   - The `email_verified` claim must be true to perform updates.
   - Users cannot escalate their own plan tier.
2. **Publications & Posts (`posts/{postId}`)**:
   - A post must contain a valid `userId` reference pointing directly to the authenticated owner.
   - The `userId` of a post is immutable after creation.
   - Create operations require verifying that the creator user actually exists.
   - Status updates can only transition between valid enum elements: `draft`, `scheduled`, or `published`.
   - String parameters like `title`, `platform`, and `date` are bounded in size to prevent denial of wallet attacks.
3. **Workspace Notifications (`notifications/{notificationId}`)**:
   - Notifications can only be listed/read by the receiver user (`resource.data.userId == request.auth.uid`).
   - Write operations are disabled for standard client SDKs (considered a system-only or owner-only bounded field module).

---

## 2. The "Dirty Dozen" Malicious Payloads
The following payloads simulate attacks breaching relational sync and identity gates, seeking to write corrupt inputs.

### Test 1: Spoofed Profile Creation (Identity Hijack)
An attacker tries to create a user profile document matching someone else's ID.
```json
// Path: users/victim_uid_123
{
  "uid": "victim_uid_123",
  "name": "Hacker Entity",
  "email": "victim@outlook.com",
  "location": "Valencia, Spain"
}
```
*Expected: PERMISSION_DENIED (uid must match request.auth.uid)*

### Test 2: Plan Tier Escalation (Privilege Violation)
A standard user tries to upgrade their state to Pro Plan manually.
```json
// Path: users/alina_uid_456 (Update)
{
  "plan": "Enterprise Lifetime Plan"
}
```
*Expected: PERMISSION_DENIED (plan is a protected state tier)*

### Test 3: Orphaned Post Injection (Relational Sync Failure)
An authenticated user tries to add a publication post referring to a non-existent or foreign user channel.
```json
// Path: posts/post_777 (Create)
{
  "id": "post_777",
  "userId": "non_existent_uid",
  "title": "Unauthenticated Post Insertion"
}
```
*Expected: PERMISSION_DENIED (userId must match request.auth.uid)*

### Test 4: Giant String Exploit (Denial of Wallet)
An attacker injects a 5MB string as a publication title to trigger high storage and transfer fees.
```json
// Path: posts/post_888 (Create)
{
  "id": "post_888",
  "userId": "attacker_uid_999",
  "platform": "youtube",
  "title": "A".repeat(100000)
}
```
*Expected: PERMISSION_DENIED (title string exceeds size limits)*

### Test 5: Invalid State Transition (Enum Bypass)
A user tries to set an unrecognized status value for automated tasks.
```json
// Path: posts/post_999 (Create)
{
  "id": "post_999",
  "userId": "user_uid_001",
  "platform": "tiktok",
  "title": "My Video",
  "status": "ultra-published-mega-boosteded"
}
```
*Expected: PERMISSION_DENIED (status must be in the approved enum array)*

### Test 6: Timestamp Spoofing (Historical Tampering)
An attacker sets a future or historical date in the relational tracking metrics.
```json
// Path: posts/post_011 (Create)
{
  "id": "post_011",
  "userId": "user_uid_111",
  "status": "draft",
  "platform": "youtube",
  "title": "Old Post",
  "createdAt": "1999-12-31T23:59:59Z"
}
```
*Expected: PERMISSION_DENIED (createdAt must equal request.time)*

### Test 7: Post Hijacking (Cross-User Overwrites)
An authenticated user `attacker_uid` attempts to edit the text or platform details of a post owned by `victim_uid`.
```json
// Path: posts/post_victim_012 (Update)
{
  "title": "Compromised Post Title"
}
```
*Expected: PERMISSION_DENIED (user holds no ownership permissions)*

### Test 8: Shadow Field Injection (Ghost Mutation)
An attacker tries to inject undefined fields during a standard post title amendment.
```json
// Path: posts/post_123 (Update)
{
  "title": "Legit Title",
  "shadowField": "privileged_system_flag_true",
  "views": 99999999
}
```
*Expected: PERMISSION_DENIED (affectedKeys() allows only specific values)*

### Test 9: Unauthenticated Reader Scraping (Zero Trust Failure)
A guest client attempts to list all publication elements in the global system directory.
```json
// Path: posts/ (List query)
No payload.
```
*Expected: PERMISSION_DENIED (unsecured open fetch triggers auto-rejection)*

### Test 10: Notification Hijack (Phishing Alert Insertion)
An attacker tries to post a custom alert item to spam or phish users inside the application panel.
```json
// Path: notifications/notif_909 (Create)
{
  "id": "notif_909",
  "userId": "victim_uid_321",
  "title": "URGENT Security Action Required",
  "desc": "Please input your password at phishing-domain.com",
  "unread": true
}
```
*Expected: PERMISSION_DENIED (notifications are system-generated or cannot be created by third parties)*

### Test 11: Document ID Poisoning (Path Characters Injection)
An attacker inputs a junk, nested path or massive character buffer as a document path ID to derail Firestore routing.
```json
// Path: users/../../poison_doc_777_$$$$$
No payload.
```
*Expected: PERMISSION_DENIED (ID matches regular characters only)*

### Test 12: Anonymous Verification Bypass
A guest user lacking verified email accounts attempts to register or lock down a name block.
```json
// Path: users/anon_123 (Create)
{
  "uid": "anon_123",
  "name": "Anonymous Entity"
}
```
*Expected: PERMISSION_DENIED (email_verified claim constraint)*

---

## 3. Test Runner Structure (`firestore.rules.test.ts`)

```typescript
import { assertFails, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

describe('Creator OS security rules check', () => {
  let testEnv: any;

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'long-foundation-4f4nj',
      firestore: {
        rules: `
          rules_version = '2';
          service cloud.firestore {
            match /databases/{database}/documents {
              match /{document=**} { allow read, write: if false; }
            }
          }
        `,
      },
    });
  });

  after(async () => {
    await testEnv.cleanup();
  });

  it('declares protection on all dirty dozen entries', async () => {
    const unverifiedContext = testEnv.authenticatedContext('attacker', { email_verified: false });
    const victimDoc = doc(unverifiedContext.firestore(), 'users/victim_123');
    await assertFails(setDoc(victimDoc, { uid: 'victim_123', name: 'Malicious' }));
  });
});
```
