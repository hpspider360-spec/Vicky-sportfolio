/**
 * Security Rule Verification Suite — Vignesh Portfolio CMS
 * Documents the 12 adversarial "Dirty Dozen" assertions against firestore.rules.
 * Intended to be run against the Firebase Local Emulator Suite (@firebase/rules-unit-testing).
 */

export interface SecurityTestCase {
  id: number;
  name: string;
  actor: {
    authenticated: boolean;
    email?: string;
    emailVerified?: boolean;
  };
  operation: 'create' | 'update' | 'delete' | 'get';
  path: string;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED' | 'ALLOWED';
}

export const DIRTY_DOZEN_SECURITY_TESTS: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Unauthenticated visitor attempts to write experience',
    actor: { authenticated: false },
    operation: 'create',
    path: '/experiences/exp-unauth',
    payload: { company: 'Fake Corp' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Authenticated non-owner email attempts to delete experience',
    actor: { authenticated: true, email: 'attacker@gmail.com', emailVerified: true },
    operation: 'delete',
    path: '/experiences/acidus-management-solution',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Unverified admin email spoof attempts to update profile',
    actor: { authenticated: true, email: 'vigneshsivan2001@gmail.com', emailVerified: false },
    operation: 'update',
    path: '/portfolio/profile',
    payload: { name: 'SPOOF' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Shadow ghost field injection on experience create',
    actor: { authenticated: true, email: 'vigneshsivan2001@gmail.com', emailVerified: true },
    operation: 'create',
    path: '/experiences/exp-ghost',
    payload: {
      order: 1,
      index: '01',
      company: 'Acidus',
      jobTitle: 'Executive',
      department: 'Charge Entry',
      industry: 'RCM',
      duration: '1 Year',
      responsibilities: ['Charge entry'],
      isVerified: true,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Oversized document ID poisoning (>128 chars)',
    actor: { authenticated: true, email: 'vigneshsivan2001@gmail.com', emailVerified: true },
    operation: 'create',
    path: `/projects/${'a'.repeat(150)}`,
    payload: { title: 'Long ID' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Invalid document ID characters rejected by regex',
    actor: { authenticated: true, email: 'vigneshsivan2001@gmail.com', emailVerified: true },
    operation: 'create',
    path: '/skills/bad$id!',
    payload: { title: 'Bad ID' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Non-singleton portfolio profile document blocked',
    actor: { authenticated: true, email: 'vigneshsivan2001@gmail.com', emailVerified: true },
    operation: 'create',
    path: '/portfolio/other-doc',
    payload: { name: 'Other' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Invalid Project status enum rejected',
    actor: { authenticated: true, email: 'vigneshsivan2001@gmail.com', emailVerified: true },
    operation: 'create',
    path: '/projects/p-enum',
    payload: { status: 'Archived' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Oversized string field rejected (>160 chars for company)',
    actor: { authenticated: true, email: 'vigneshsivan2001@gmail.com', emailVerified: true },
    operation: 'create',
    path: '/experiences/exp-large',
    payload: { company: 'X'.repeat(300) },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Unbounded skills array rejected (>30 items)',
    actor: { authenticated: true, email: 'vigneshsivan2001@gmail.com', emailVerified: true },
    operation: 'create',
    path: '/skills/skill-overflow',
    payload: { skills: Array.from({ length: 35 }, (_, i) => `Skill ${i}`) },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Non-string element in responsibilities array rejected',
    actor: { authenticated: true, email: 'vigneshsivan2001@gmail.com', emailVerified: true },
    operation: 'create',
    path: '/experiences/exp-bad-array',
    payload: { responsibilities: [12345] },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Client-forged timestamp rejected instead of request.time',
    actor: { authenticated: true, email: 'vigneshsivan2001@gmail.com', emailVerified: true },
    operation: 'create',
    path: '/projects/p-time',
    payload: { updatedAt: '2000-01-01T00:00:00.000Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
];
