import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  ADMIN_OWNER_EMAIL,
  OperationType,
  auth,
  db,
  googleProvider,
  handleFirestoreError,
} from '../firebase';
import {
  CONTACT_DATA,
  EDUCATION_SUMMARY,
  EXPERIENCE_DATA,
  HERO_DATA,
  PROJECTS_DATA,
  RESUME_CONFIG,
  SKILLS_DATA,
  type EducationMilestone,
  type ExperienceItem,
  type ProjectItem,
  type ProjectStatus,
  type SkillCategory,
} from '../data/portfolioData';

export interface PortfolioProfile {
  name: string;
  role: string;
  tagline: string[];
  introductionPrefix: string;
  introductionHighlight1: string;
  introductionMid: string;
  introductionHighlight2: string;
  introductionMid2: string;
  introductionHighlight3: string;
  introductionSuffix: string;
  focus: string;
  experienceSummary: string;
  shortLocation: string;
  availability: string;
  educationDegree: string;
  educationCollege: string;
  educationYear: string;
  resumePdfUrl: string;
  resumeFileName: string;
  resumeStatusNote: string;
  fullName: string;
  contactEmail: string;
  githubUrl: string;
  linkedinUrl: string;
  location: string;
  contactMessage: string;
  seededProjects: boolean;
  seededSkills: boolean;
  seededExperiences: boolean;
}

export type ResumeSourceType = 'none' | 'upload' | 'url';

export interface PortfolioResume {
  sourceType: ResumeSourceType;
  fileName: string;
  pdfUrl: string;
  pdfBase64: string;
  fileSizeBytes: number;
  statusNote: string;
}

export interface StoredProjectItem extends ProjectItem {
  order: number;
}

export interface StoredSkillCategory extends SkillCategory {
  order: number;
}

export interface StoredExperienceItem extends ExperienceItem {
  order: number;
}

export const DEFAULT_PROFILE: PortfolioProfile = {
  name: HERO_DATA.name,
  role: HERO_DATA.role,
  tagline: [...HERO_DATA.tagline],
  introductionPrefix: HERO_DATA.introductionPrefix,
  introductionHighlight1: HERO_DATA.introductionHighlight1,
  introductionMid: HERO_DATA.introductionMid,
  introductionHighlight2: HERO_DATA.introductionHighlight2,
  introductionMid2: HERO_DATA.introductionMid2,
  introductionHighlight3: HERO_DATA.introductionHighlight3,
  introductionSuffix: HERO_DATA.introductionSuffix,
  focus: 'Full-Stack Web & Engineering',
  experienceSummary: '1 Year · Healthcare RCM',
  shortLocation: 'Coimbatore, India',
  availability: 'Open to Opportunities',
  educationDegree: EDUCATION_SUMMARY.degree,
  educationCollege: EDUCATION_SUMMARY.college,
  educationYear: EDUCATION_SUMMARY.graduationYear,
  resumePdfUrl: RESUME_CONFIG.pdfUrl ?? '',
  resumeFileName: RESUME_CONFIG.fileName,
  resumeStatusNote: RESUME_CONFIG.statusNote,
  fullName: CONTACT_DATA.fullName,
  contactEmail: CONTACT_DATA.email,
  githubUrl: CONTACT_DATA.githubUrl,
  linkedinUrl: CONTACT_DATA.linkedinUrl,
  location: CONTACT_DATA.location,
  contactMessage: CONTACT_DATA.message,
  seededProjects: false,
  seededSkills: false,
  seededExperiences: false,
};

export const DEFAULT_RESUME: PortfolioResume = {
  sourceType: 'none',
  fileName: RESUME_CONFIG.fileName,
  pdfUrl: RESUME_CONFIG.pdfUrl ?? '',
  pdfBase64: '',
  fileSizeBytes: 0,
  statusNote: RESUME_CONFIG.statusNote,
};

const DEFAULT_PROJECTS: StoredProjectItem[] = PROJECTS_DATA.map((p, idx) => ({
  ...p,
  order: idx + 1,
}));

const DEFAULT_SKILLS: StoredSkillCategory[] = SKILLS_DATA.map((s, idx) => ({
  ...s,
  order: idx + 1,
}));

const DEFAULT_EXPERIENCES: StoredExperienceItem[] = EXPERIENCE_DATA.map((e, idx) => ({
  ...e,
  order: idx + 1,
}));

function clampString(val: string, maxLen: number): string {
  return val.trim().slice(0, maxLen);
}

function sanitizeId(raw: string, fallbackPrefix: string): string {
  const cleaned = raw
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
  if (cleaned.length > 0) return cleaned;
  return `${fallbackPrefix}-${Date.now()}`;
}

function sanitizeStringList(items: string[], maxItems: number): string[] {
  return items
    .map((s) => s.trim().slice(0, 300))
    .filter((s) => s.length > 0)
    .slice(0, maxItems);
}

export function isSafeHttpOrRelativeUrl(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;
  return (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('/')
  );
}

function buildProfilePayload(p: PortfolioProfile) {
  return {
    name: clampString(p.name, 80) || 'VIGNESH',
    role: clampString(p.role, 120) || 'COMPUTER SCIENCE ENGINEER',
    tagline: sanitizeStringList(p.tagline, 6),
    introductionPrefix: p.introductionPrefix.slice(0, 200),
    introductionHighlight1: p.introductionHighlight1.slice(0, 120),
    introductionMid: p.introductionMid.slice(0, 200),
    introductionHighlight2: p.introductionHighlight2.slice(0, 120),
    introductionMid2: p.introductionMid2.slice(0, 200),
    introductionHighlight3: p.introductionHighlight3.slice(0, 120),
    introductionSuffix: p.introductionSuffix.slice(0, 40),
    focus: clampString(p.focus, 120) || 'Full-Stack Web & Engineering',
    experienceSummary: clampString(p.experienceSummary, 120) || '1 Year · Healthcare RCM',
    shortLocation: clampString(p.shortLocation, 120) || 'Coimbatore, India',
    availability: clampString(p.availability, 120) || 'Open to Opportunities',
    educationDegree: clampString(p.educationDegree, 160) || EDUCATION_SUMMARY.degree,
    educationCollege: clampString(p.educationCollege, 180) || EDUCATION_SUMMARY.college,
    educationYear: clampString(p.educationYear, 20) || EDUCATION_SUMMARY.graduationYear,
    resumePdfUrl: clampString(p.resumePdfUrl, 500),
    resumeFileName: clampString(p.resumeFileName, 120) || 'Vignesh_Resume.pdf',
    resumeStatusNote: p.resumeStatusNote.trim().slice(0, 500),
    fullName: clampString(p.fullName, 80) || 'Vignesh',
    contactEmail: clampString(p.contactEmail, 160) || ADMIN_OWNER_EMAIL,
    githubUrl: clampString(p.githubUrl, 300),
    linkedinUrl: clampString(p.linkedinUrl, 300),
    location: clampString(p.location, 160) || CONTACT_DATA.location,
    contactMessage: p.contactMessage.trim().slice(0, 600),
    seededProjects: Boolean(p.seededProjects),
    seededSkills: Boolean(p.seededSkills),
    seededExperiences: Boolean(p.seededExperiences),
    updatedAt: serverTimestamp(),
  };
}

function buildResumePayload(r: PortfolioResume) {
  const validSources: ResumeSourceType[] = ['none', 'upload', 'url'];
  const sourceType: ResumeSourceType = validSources.includes(r.sourceType)
    ? r.sourceType
    : 'none';
  const rawName = clampString(r.fileName, 140) || 'Vignesh_Resume.pdf';
  const fileName = rawName.toLowerCase().endsWith('.pdf')
    ? rawName
    : `${rawName.slice(0, 136)}.pdf`;

  return {
    sourceType,
    fileName,
    pdfUrl: sourceType === 'url' ? clampString(r.pdfUrl, 500) : '',
    pdfBase64: sourceType === 'upload' ? r.pdfBase64.slice(0, 950000) : '',
    fileSizeBytes:
      sourceType === 'upload'
        ? Math.max(0, Math.min(700000, Math.round(Number(r.fileSizeBytes) || 0)))
        : 0,
    statusNote: r.statusNote.trim().slice(0, 500),
    updatedAt: serverTimestamp(),
  };
}

function buildExperiencePayload(item: StoredExperienceItem) {
  return {
    order: Math.max(0, Math.min(1000, Number(item.order) || 0)),
    index: clampString(item.index, 12) || '01',
    company: clampString(item.company, 160) || 'Company',
    jobTitle: clampString(item.jobTitle, 140) || 'Role',
    department: clampString(item.department, 140) || 'Department',
    industry: clampString(item.industry, 160) || 'Industry',
    duration: clampString(item.duration, 80) || '1 Year',
    responsibilities: sanitizeStringList(item.responsibilities, 25),
    published: true,
    updatedAt: serverTimestamp(),
  };
}

function buildProjectPayload(item: StoredProjectItem) {
  const validStatuses: ProjectStatus[] = ['Live', 'In Development', 'Academic Project'];
  const status: ProjectStatus = validStatuses.includes(item.status)
    ? item.status
    : 'Academic Project';

  return {
    order: Math.max(0, Math.min(1000, Number(item.order) || 0)),
    number: clampString(item.number, 12) || '01',
    title: clampString(item.title, 140) || 'Untitled Project',
    category: clampString(item.category, 120) || 'Development',
    status,
    description: clampString(item.description, 800) || 'Project overview.',
    technologies: sanitizeStringList(item.technologies, 20),
    contribution: clampString(item.contribution, 800) || 'Project contribution.',
    imageUrl: clampString(item.imageUrl ?? '', 500),
    liveUrl: clampString(item.liveUrl ?? '', 500),
    githubUrl: clampString(item.githubUrl ?? '', 500),
    published: true,
    updatedAt: serverTimestamp(),
  };
}

function buildSkillPayload(item: StoredSkillCategory) {
  return {
    order: Math.max(0, Math.min(1000, Number(item.order) || 0)),
    index: clampString(item.index, 12) || '01',
    title: clampString(item.title, 120) || 'Skills',
    skills: sanitizeStringList(item.skills, 30),
    published: true,
    updatedAt: serverTimestamp(),
  };
}

interface PortfolioContextValue {
  profile: PortfolioProfile;
  resume: PortfolioResume;
  educationMilestones: EducationMilestone[];
  projects: StoredProjectItem[];
  skills: StoredSkillCategory[];
  experiences: StoredExperienceItem[];
  user: User | null;
  authReady: boolean;
  isOwnerAdmin: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInAsAdmin: () => Promise<boolean>;
  signOutAdmin: () => Promise<void>;
  saveProfile: (next: PortfolioProfile) => Promise<void>;
  saveResume: (next: PortfolioResume) => Promise<void>;
  deleteResume: () => Promise<void>;
  saveExperience: (item: StoredExperienceItem) => Promise<void>;
  deleteExperience: (id: string) => Promise<void>;
  saveProject: (item: StoredProjectItem) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  saveSkillCategory: (item: StoredSkillCategory) => Promise<void>;
  deleteSkillCategory: (id: string) => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [cloudProfile, setCloudProfile] = useState<PortfolioProfile | null>(null);
  const [cloudResume, setCloudResume] = useState<PortfolioResume | null>(null);
  const [cloudProjects, setCloudProjects] = useState<StoredProjectItem[] | null>(null);
  const [cloudSkills, setCloudSkills] = useState<StoredSkillCategory[] | null>(null);
  const [cloudExperiences, setCloudExperiences] = useState<StoredExperienceItem[] | null>(null);

  const isOwnerAdmin = Boolean(
    user &&
      user.emailVerified &&
      user.email?.toLowerCase() === ADMIN_OWNER_EMAIL.toLowerCase()
  );

  // Track Firebase Auth session and enforce strict single-owner access
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (nextUser) {
        const emailMatches =
          nextUser.email?.toLowerCase() === ADMIN_OWNER_EMAIL.toLowerCase() &&
          nextUser.emailVerified;
        if (!emailMatches) {
          setAuthError(
            `Access denied for ${nextUser.email ?? 'this account'}. Only ${ADMIN_OWNER_EMAIL} is authorized to log in to the admin portal.`
          );
          await signOut(auth);
          setUser(null);
          setAuthReady(true);
          return;
        }
        setAuthError(null);
        setUser(nextUser);
      } else {
        setUser(null);
      }
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Real-time public subscriptions so every Admin Panel update reacts live on the public website
  useEffect(() => {
    const profileRef = doc(db, 'portfolio', 'profile');
    const unsubProfile = onSnapshot(
      profileRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setCloudProfile({
            ...DEFAULT_PROFILE,
            name: typeof data.name === 'string' ? data.name : DEFAULT_PROFILE.name,
            role: typeof data.role === 'string' ? data.role : DEFAULT_PROFILE.role,
            tagline: Array.isArray(data.tagline) ? data.tagline : DEFAULT_PROFILE.tagline,
            introductionPrefix:
              typeof data.introductionPrefix === 'string'
                ? data.introductionPrefix
                : DEFAULT_PROFILE.introductionPrefix,
            introductionHighlight1:
              typeof data.introductionHighlight1 === 'string'
                ? data.introductionHighlight1
                : DEFAULT_PROFILE.introductionHighlight1,
            introductionMid:
              typeof data.introductionMid === 'string'
                ? data.introductionMid
                : DEFAULT_PROFILE.introductionMid,
            introductionHighlight2:
              typeof data.introductionHighlight2 === 'string'
                ? data.introductionHighlight2
                : DEFAULT_PROFILE.introductionHighlight2,
            introductionMid2:
              typeof data.introductionMid2 === 'string'
                ? data.introductionMid2
                : DEFAULT_PROFILE.introductionMid2,
            introductionHighlight3:
              typeof data.introductionHighlight3 === 'string'
                ? data.introductionHighlight3
                : DEFAULT_PROFILE.introductionHighlight3,
            introductionSuffix:
              typeof data.introductionSuffix === 'string'
                ? data.introductionSuffix
                : DEFAULT_PROFILE.introductionSuffix,
            focus: typeof data.focus === 'string' ? data.focus : DEFAULT_PROFILE.focus,
            experienceSummary:
              typeof data.experienceSummary === 'string'
                ? data.experienceSummary
                : DEFAULT_PROFILE.experienceSummary,
            shortLocation:
              typeof data.shortLocation === 'string'
                ? data.shortLocation
                : DEFAULT_PROFILE.shortLocation,
            availability:
              typeof data.availability === 'string'
                ? data.availability
                : DEFAULT_PROFILE.availability,
            educationDegree:
              typeof data.educationDegree === 'string'
                ? data.educationDegree
                : DEFAULT_PROFILE.educationDegree,
            educationCollege:
              typeof data.educationCollege === 'string'
                ? data.educationCollege
                : DEFAULT_PROFILE.educationCollege,
            educationYear:
              typeof data.educationYear === 'string'
                ? data.educationYear
                : DEFAULT_PROFILE.educationYear,
            resumePdfUrl:
              typeof data.resumePdfUrl === 'string' ? data.resumePdfUrl : '',
            resumeFileName:
              typeof data.resumeFileName === 'string'
                ? data.resumeFileName
                : DEFAULT_PROFILE.resumeFileName,
            resumeStatusNote:
              typeof data.resumeStatusNote === 'string'
                ? data.resumeStatusNote
                : DEFAULT_PROFILE.resumeStatusNote,
            fullName:
              typeof data.fullName === 'string' ? data.fullName : DEFAULT_PROFILE.fullName,
            contactEmail:
              typeof data.contactEmail === 'string'
                ? data.contactEmail
                : DEFAULT_PROFILE.contactEmail,
            githubUrl:
              typeof data.githubUrl === 'string' ? data.githubUrl : DEFAULT_PROFILE.githubUrl,
            linkedinUrl:
              typeof data.linkedinUrl === 'string'
                ? data.linkedinUrl
                : DEFAULT_PROFILE.linkedinUrl,
            location:
              typeof data.location === 'string' ? data.location : DEFAULT_PROFILE.location,
            contactMessage:
              typeof data.contactMessage === 'string'
                ? data.contactMessage
                : DEFAULT_PROFILE.contactMessage,
            seededProjects: Boolean(data.seededProjects),
            seededSkills: Boolean(data.seededSkills),
            seededExperiences: Boolean(data.seededExperiences),
          });
        } else {
          setCloudProfile(null);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'portfolio/profile');
      }
    );

    const resumeRef = doc(db, 'resume', 'current');
    const unsubResume = onSnapshot(
      resumeRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const sourceType: ResumeSourceType =
            data.sourceType === 'upload' || data.sourceType === 'url'
              ? data.sourceType
              : 'none';
          setCloudResume({
            sourceType,
            fileName:
              typeof data.fileName === 'string' && data.fileName.trim()
                ? data.fileName
                : DEFAULT_RESUME.fileName,
            pdfUrl: typeof data.pdfUrl === 'string' ? data.pdfUrl : '',
            pdfBase64: typeof data.pdfBase64 === 'string' ? data.pdfBase64 : '',
            fileSizeBytes:
              typeof data.fileSizeBytes === 'number' ? data.fileSizeBytes : 0,
            statusNote:
              typeof data.statusNote === 'string'
                ? data.statusNote
                : DEFAULT_RESUME.statusNote,
          });
        } else {
          setCloudResume(null);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'resume/current');
      }
    );

    const projectsQuery = query(
      collection(db, 'projects'),
      where('published', '==', true)
    );
    const unsubProjects = onSnapshot(
      projectsQuery,
      (snap) => {
        const list: StoredProjectItem[] = snap.docs
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              order: typeof data.order === 'number' ? data.order : 0,
              number: String(data.number ?? '01'),
              title: String(data.title ?? ''),
              category: String(data.category ?? ''),
              status: (data.status as ProjectStatus) ?? 'Academic Project',
              description: String(data.description ?? ''),
              technologies: Array.isArray(data.technologies)
                ? data.technologies.map(String)
                : [],
              contribution: String(data.contribution ?? ''),
              imageUrl: data.imageUrl ? String(data.imageUrl) : undefined,
              liveUrl: data.liveUrl ? String(data.liveUrl) : undefined,
              githubUrl: data.githubUrl ? String(data.githubUrl) : undefined,
            };
          })
          .sort((a, b) => a.order - b.order);
        setCloudProjects(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'projects');
      }
    );

    const skillsQuery = query(
      collection(db, 'skills'),
      where('published', '==', true)
    );
    const unsubSkills = onSnapshot(
      skillsQuery,
      (snap) => {
        const list: StoredSkillCategory[] = snap.docs
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              order: typeof data.order === 'number' ? data.order : 0,
              index: String(data.index ?? '01'),
              title: String(data.title ?? ''),
              skills: Array.isArray(data.skills) ? data.skills.map(String) : [],
            };
          })
          .sort((a, b) => a.order - b.order);
        setCloudSkills(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'skills');
      }
    );

    const experiencesQuery = query(
      collection(db, 'experiences'),
      where('published', '==', true)
    );
    const unsubExperiences = onSnapshot(
      experiencesQuery,
      (snap) => {
        const list: StoredExperienceItem[] = snap.docs
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              order: typeof data.order === 'number' ? data.order : 0,
              index: String(data.index ?? '01'),
              company: String(data.company ?? ''),
              jobTitle: String(data.jobTitle ?? ''),
              department: String(data.department ?? ''),
              industry: String(data.industry ?? ''),
              duration: String(data.duration ?? ''),
              responsibilities: Array.isArray(data.responsibilities)
                ? data.responsibilities.map(String)
                : [],
            };
          })
          .sort((a, b) => a.order - b.order);
        setCloudExperiences(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'experiences');
      }
    );

    return () => {
      unsubProfile();
      unsubResume();
      unsubProjects();
      unsubSkills();
      unsubExperiences();
    };
  }, []);

  const profile = cloudProfile ?? DEFAULT_PROFILE;

  const resume = useMemo<PortfolioResume>(() => {
    if (cloudResume) return cloudResume;
    if (profile.resumePdfUrl.trim()) {
      return {
        sourceType: 'url',
        fileName: profile.resumeFileName || DEFAULT_RESUME.fileName,
        pdfUrl: profile.resumePdfUrl.trim(),
        pdfBase64: '',
        fileSizeBytes: 0,
        statusNote: profile.resumeStatusNote || DEFAULT_RESUME.statusNote,
      };
    }
    return {
      ...DEFAULT_RESUME,
      fileName: profile.resumeFileName || DEFAULT_RESUME.fileName,
      statusNote: profile.resumeStatusNote || DEFAULT_RESUME.statusNote,
    };
  }, [cloudResume, profile.resumeFileName, profile.resumePdfUrl, profile.resumeStatusNote]);

  const projects = useMemo(() => {
    if (cloudProfile?.seededProjects) return cloudProjects ?? [];
    if (cloudProjects && cloudProjects.length > 0) return cloudProjects;
    return DEFAULT_PROJECTS;
  }, [cloudProfile?.seededProjects, cloudProjects]);

  const skills = useMemo(() => {
    if (cloudProfile?.seededSkills) return cloudSkills ?? [];
    if (cloudSkills && cloudSkills.length > 0) return cloudSkills;
    return DEFAULT_SKILLS;
  }, [cloudProfile?.seededSkills, cloudSkills]);

  const experiences = useMemo(() => {
    if (cloudProfile?.seededExperiences) return cloudExperiences ?? [];
    if (cloudExperiences && cloudExperiences.length > 0) return cloudExperiences;
    return DEFAULT_EXPERIENCES;
  }, [cloudProfile?.seededExperiences, cloudExperiences]);

  const educationMilestones: EducationMilestone[] = useMemo(
    () => [
      {
        id: 'degree',
        step: '01',
        label: 'Degree',
        value: profile.educationDegree,
        detail: 'Undergraduate Engineering Program',
      },
      {
        id: 'institution',
        step: '02',
        label: 'Institution',
        value: profile.educationCollege,
        detail: 'Academic Institution',
      },
      {
        id: 'graduation',
        step: '03',
        label: 'Graduation Year',
        value: profile.educationYear,
        detail: 'Completed Degree Program',
      },
    ],
    [profile.educationDegree, profile.educationCollege, profile.educationYear]
  );

  // Syncs default items into Firestore atomically on the owner's first edit/delete of any collection
  const ensureCollectionSeeded = useCallback(
    async (
      target: 'projects' | 'skills' | 'experiences',
      excludeId?: string
    ) => {
      const flagKey =
        target === 'projects'
          ? 'seededProjects'
          : target === 'skills'
            ? 'seededSkills'
            : 'seededExperiences';

      if (cloudProfile?.[flagKey]) return;

      const batch = writeBatch(db);
      if (target === 'projects') {
        for (const item of DEFAULT_PROJECTS) {
          if (item.id === excludeId) continue;
          batch.set(doc(db, 'projects', item.id), buildProjectPayload(item));
        }
      } else if (target === 'skills') {
        for (const item of DEFAULT_SKILLS) {
          if (item.id === excludeId) continue;
          batch.set(doc(db, 'skills', item.id), buildSkillPayload(item));
        }
      } else {
        for (const item of DEFAULT_EXPERIENCES) {
          if (item.id === excludeId) continue;
          batch.set(doc(db, 'experiences', item.id), buildExperiencePayload(item));
        }
      }

      const nextProfile: PortfolioProfile = {
        ...profile,
        [flagKey]: true,
      };
      batch.set(doc(db, 'portfolio', 'profile'), buildProfilePayload(nextProfile));

      try {
        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, target);
      }
    },
    [cloudProfile, profile]
  );

  const signInAsAdmin = useCallback(async (): Promise<boolean> => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const signedInUser = result.user;
      const authorized =
        signedInUser.emailVerified &&
        signedInUser.email?.toLowerCase() === ADMIN_OWNER_EMAIL.toLowerCase();

      if (!authorized) {
        setAuthError(
          `Access denied for ${signedInUser.email ?? 'this account'}. Only ${ADMIN_OWNER_EMAIL} can access the admin portal.`
        );
        await signOut(auth);
        return false;
      }
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to complete Google sign-in.';
      if (!message.includes('popup-closed-by-user')) {
        setAuthError(message);
      }
      return false;
    }
  }, []);

  const signOutAdmin = useCallback(async () => {
    setAuthError(null);
    await signOut(auth);
  }, []);

  const saveProfile = useCallback(async (next: PortfolioProfile) => {
    const path = 'portfolio/profile';
    try {
      await setDoc(doc(db, 'portfolio', 'profile'), buildProfilePayload(next));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }, []);

  const saveResume = useCallback(async (next: PortfolioResume) => {
    const path = 'resume/current';
    try {
      await setDoc(doc(db, 'resume', 'current'), buildResumePayload(next));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }, []);

  const deleteResume = useCallback(async () => {
    const path = 'resume/current';
    try {
      await deleteDoc(doc(db, 'resume', 'current'));
      // Clear any legacy URL on profile so the public site immediately reverts to Upon Request
      if (cloudProfile?.resumePdfUrl) {
        await setDoc(
          doc(db, 'portfolio', 'profile'),
          buildProfilePayload({ ...profile, resumePdfUrl: '' })
        );
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }, [cloudProfile?.resumePdfUrl, profile]);

  const saveExperience = useCallback(
    async (item: StoredExperienceItem) => {
      await ensureCollectionSeeded('experiences');
      const id = sanitizeId(item.id || item.company, 'exp');
      const path = `experiences/${id}`;
      try {
        await setDoc(doc(db, 'experiences', id), buildExperiencePayload({ ...item, id }));
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    },
    [ensureCollectionSeeded]
  );

  const deleteExperience = useCallback(
    async (id: string) => {
      if (!cloudProfile?.seededExperiences) {
        await ensureCollectionSeeded('experiences', id);
        return;
      }
      const path = `experiences/${id}`;
      try {
        await deleteDoc(doc(db, 'experiences', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    },
    [cloudProfile?.seededExperiences, ensureCollectionSeeded]
  );

  const saveProject = useCallback(
    async (item: StoredProjectItem) => {
      await ensureCollectionSeeded('projects');
      const id = sanitizeId(item.id || item.title, 'proj');
      const path = `projects/${id}`;
      try {
        await setDoc(doc(db, 'projects', id), buildProjectPayload({ ...item, id }));
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    },
    [ensureCollectionSeeded]
  );

  const deleteProject = useCallback(
    async (id: string) => {
      if (!cloudProfile?.seededProjects) {
        await ensureCollectionSeeded('projects', id);
        return;
      }
      const path = `projects/${id}`;
      try {
        await deleteDoc(doc(db, 'projects', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    },
    [cloudProfile?.seededProjects, ensureCollectionSeeded]
  );

  const saveSkillCategory = useCallback(
    async (item: StoredSkillCategory) => {
      await ensureCollectionSeeded('skills');
      const id = sanitizeId(item.id || item.title, 'skill');
      const path = `skills/${id}`;
      try {
        await setDoc(doc(db, 'skills', id), buildSkillPayload({ ...item, id }));
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    },
    [ensureCollectionSeeded]
  );

  const deleteSkillCategory = useCallback(
    async (id: string) => {
      if (!cloudProfile?.seededSkills) {
        await ensureCollectionSeeded('skills', id);
        return;
      }
      const path = `skills/${id}`;
      try {
        await deleteDoc(doc(db, 'skills', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    },
    [cloudProfile?.seededSkills, ensureCollectionSeeded]
  );

  const value: PortfolioContextValue = {
    profile,
    resume,
    educationMilestones,
    projects,
    skills,
    experiences,
    user,
    authReady,
    isOwnerAdmin,
    authError,
    clearAuthError: () => setAuthError(null),
    signInAsAdmin,
    signOutAdmin,
    saveProfile,
    saveResume,
    deleteResume,
    saveExperience,
    deleteExperience,
    saveProject,
    deleteProject,
    saveSkillCategory,
    deleteSkillCategory,
  };

  return (
    <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>
  );
}

export function usePortfolio(): PortfolioContextValue {
  const ctx = useContext(PortfolioContext);
  if (!ctx) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return ctx;
}
