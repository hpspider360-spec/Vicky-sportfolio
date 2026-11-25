# Firestore Security Specification — Vignesh Portfolio CMS

## 1. Data Invariants
1. **Single Verified Admin Owner**: Only an authenticated Google user whose verified email is strictly `vigneshsivan2001@gmail.com` (`request.auth.token.email_verified == true`) may create, update, or delete any document across `/portfolio/{docId}`, `/projects/{projectId}`, `/skills/{skillId}`, and `/experiences/{experienceId}`.
2. **Public Portfolio Read Scope**: Public visitors may read published portfolio records (`/portfolio/profile`, `/projects/{projectId}`, `/skills/{skillId}`, `/experiences/{experienceId}`), while all other paths are default-denied (`match /{document=**}`).
3. **Strict Singleton Document ID**: `/portfolio/{docId}` only permits `docId == 'profile'`. Arbitrary document creation inside `/portfolio` is forbidden.
4. **Path ID Hardening**: All document IDs (`projectId`, `skillId`, `experienceId`) must match `^[a-zA-Z0-9_-]+$` and be `<= 128` characters.
5. **Strict Key Allowlisting (Anti-Shadow-Field)**: Every write must contain exact schema keys (`hasAll` + `hasOnly`). Unknown or ghost fields (e.g., `isAdmin`, `role`, `secret`) are rejected.
6. **Bounded Strings & Arrays**: Every string enforces explicit `.size()` limits matching `firebase-blueprint.json`; every array enforces explicit `.size() <= MAX` bounds and validates the first element type when non-empty.
7. **Server Timestamp Integrity**: Every write requires `updatedAt == request.time`. Client-forged timestamps are rejected.
8. **Strict Enum Validation**: `Project.status` must strictly belong to `['Live', 'In Development', 'Academic Project']`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Unauthenticated Write**: Anonymous visitor attempts `setDoc(/experiences/exp-1, validExperience)` -> **DENIED**.
2. **Wrong Email Authenticated Write**: Signed-in user `attacker@gmail.com` (`email_verified: true`) attempts `deleteDoc(/experiences/acidus)` -> **DENIED**.
3. **Unverified Admin Email Spoof**: Signed-in user `vigneshsivan2001@gmail.com` with `email_verified: false` attempts `updateDoc(/portfolio/profile, ...)` -> **DENIED**.
4. **Shadow Ghost Field Injection**: Admin attempts `setDoc(/experiences/exp-1, { ...validExperience, isVerified: true })` -> **DENIED**.
5. **Oversized Document ID Poisoning**: Admin attempts `setDoc(/projects/<200-char-id>, validProject)` -> **DENIED**.
6. **Invalid ID Characters**: Admin attempts `setDoc(/skills/bad$id!, validSkill)` -> **DENIED**.
7. **Non-Singleton Portfolio Profile ID**: Admin attempts `setDoc(/portfolio/malicious, validProfile)` -> **DENIED**.
8. **Invalid Project Status Enum**: Admin attempts `setDoc(/projects/p-1, { ...validProject, status: 'Hacked' })` -> **DENIED**.
9. **Oversized String Resource Exhaustion**: Admin attempts `setDoc(/experiences/exp-1, { ...validExperience, company: 'A'.repeat(500) })` -> **DENIED**.
10. **Unbounded Array Injection**: Admin attempts `setDoc(/skills/s-1, { ...validSkill, skills: Array(35).fill('JS') })` -> **DENIED**.
11. **Invalid Array Element Type**: Admin attempts `setDoc(/experiences/exp-1, { ...validExperience, responsibilities: [12345] })` -> **DENIED**.
12. **Client-Forged Timestamp**: Admin attempts `setDoc(/projects/p-1, { ...validProject, updatedAt: new Date('2000-01-01') })` -> **DENIED**.
