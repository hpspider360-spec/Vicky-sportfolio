import { useEffect, useRef, useState } from 'react';
import {
  Briefcase,
  Check,
  Download,
  ExternalLink,
  FileText,
  FolderKanban,
  Link as LinkIcon,
  LogIn,
  LogOut,
  Mail,
  Pencil,
  Plus,
  Save,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Upload,
  User,
  Wrench,
  X,
} from 'lucide-react';
import { ADMIN_OWNER_EMAIL } from '../firebase';
import {
  isSafeHttpOrRelativeUrl,
  usePortfolio,
  type PortfolioProfile,
  type StoredExperienceItem,
  type StoredProjectItem,
  type StoredSkillCategory,
} from '../context/PortfolioContext';
import type { ProjectStatus } from '../data/portfolioData';

type AdminTab = 'experience' | 'projects' | 'skills' | 'resume' | 'profile' | 'contact';
type ResumeUploadMode = 'upload' | 'url';

const MAX_PDF_UPLOAD_BYTES = 680 * 1024; // ~680 KB raw PDF (~906 KB base64, safely under Firestore 1 MB limit)

interface AdminPortalProps {
  open: boolean;
  onClose: () => void;
}

const INPUT_CLASS =
  'w-full border border-[#4A4B52] bg-[#121216] px-3.5 py-2.5 text-sm text-[#F4F4F6] placeholder-[#6E707A] transition-colors focus:border-[#C8FF2E] focus:outline-none';
const LABEL_CLASS =
  'block font-mono text-[11px] font-medium tracking-[0.14em] text-[#9A9BA5] uppercase mb-1.5';

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function base64ToBlobUrl(base64: string): string | null {
  try {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  } catch {
    return null;
  }
}

export function AdminPortal({ open, onClose }: AdminPortalProps) {
  const {
    profile,
    resume,
    projects,
    skills,
    experiences,
    user,
    authReady,
    isOwnerAdmin,
    authError,
    clearAuthError,
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
  } = usePortfolio();

  const [activeTab, setActiveTab] = useState<AdminTab>('experience');
  const [signingIn, setSigningIn] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Inline delete confirmation state (never window.confirm)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Experience Editor state
  const [editingExp, setEditingExp] = useState<StoredExperienceItem | null>(null);
  const [expResponsibilitiesText, setExpResponsibilitiesText] = useState('');

  // Project Editor state
  const [editingProject, setEditingProject] = useState<StoredProjectItem | null>(null);
  const [projectTechText, setProjectTechText] = useState('');

  // Skill Category Editor state
  const [editingSkill, setEditingSkill] = useState<StoredSkillCategory | null>(null);
  const [skillItemsText, setSkillItemsText] = useState('');

  // Profile & Contact Form state
  const [profileDraft, setProfileDraft] = useState<PortfolioProfile>(profile);
  const [taglineText, setTaglineText] = useState(profile.tagline.join(' | '));

  // Resume Manager state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resumeMode, setResumeMode] = useState<ResumeUploadMode>(
    resume.sourceType === 'url' ? 'url' : 'upload'
  );
  const [resumeFileName, setResumeFileName] = useState(resume.fileName);
  const [resumeUrlDraft, setResumeUrlDraft] = useState(resume.pdfUrl);
  const [resumeStatusNoteDraft, setResumeStatusNoteDraft] = useState(resume.statusNote);
  const [pendingPdfBase64, setPendingPdfBase64] = useState<string>('');
  const [pendingPdfSize, setPendingPdfSize] = useState<number>(0);
  const [pendingPdfOriginalName, setPendingPdfOriginalName] = useState<string>('');
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    setProfileDraft(profile);
    setTaglineText(profile.tagline.join(' | '));
  }, [profile]);

  useEffect(() => {
    setResumeFileName(resume.fileName);
    setResumeUrlDraft(resume.pdfUrl);
    setResumeStatusNoteDraft(resume.statusNote);
    if (resume.sourceType === 'url') {
      setResumeMode('url');
    } else if (resume.sourceType === 'upload') {
      setResumeMode('upload');
    }
  }, [resume]);

  // Build live preview Blob URL for currently published uploaded PDF
  useEffect(() => {
    if (resume.sourceType === 'upload' && resume.pdfBase64) {
      const url = base64ToBlobUrl(resume.pdfBase64);
      setPreviewBlobUrl(url);
      return () => {
        if (url) URL.revokeObjectURL(url);
      };
    }
    setPreviewBlobUrl(null);
    return undefined;
  }, [resume.sourceType, resume.pdfBase64]);

  // Lock background scroll while Admin Portal is open
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  const showToast = (msg: string) => {
    setErrorBanner(null);
    setToast(msg);
    window.setTimeout(() => {
      setToast((curr) => (curr === msg ? null : curr));
    }, 3400);
  };

  if (!open) return null;

  const handleLogin = async () => {
    setSigningIn(true);
    clearAuthError();
    try {
      await signInAsAdmin();
    } finally {
      setSigningIn(false);
    }
  };

  // ==================== EXPERIENCE HANDLERS ====================
  const startNewExperience = () => {
    const nextOrder = experiences.length + 1;
    const nextIdx = String(nextOrder).padStart(2, '0');
    setEditingExp({
      id: `exp-${Date.now()}`,
      order: nextOrder,
      index: nextIdx,
      company: '',
      jobTitle: '',
      department: '',
      industry: '',
      duration: '',
      responsibilities: [],
    });
    setExpResponsibilitiesText('');
    setConfirmDeleteId(null);
  };

  const startEditExperience = (exp: StoredExperienceItem) => {
    setEditingExp({ ...exp });
    setExpResponsibilitiesText(exp.responsibilities.join('\n'));
    setConfirmDeleteId(null);
  };

  const handleSaveExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExp) return;
    setSaving(true);
    setErrorBanner(null);
    try {
      const responsibilities = expResponsibilitiesText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
      await saveExperience({
        ...editingExp,
        responsibilities,
      });
      setEditingExp(null);
      showToast('Work experience saved and synced live to the public portfolio.');
    } catch (err) {
      setErrorBanner(
        err instanceof Error ? err.message : 'Failed to save work experience.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExperience = async (id: string) => {
    setSaving(true);
    setErrorBanner(null);
    try {
      await deleteExperience(id);
      setConfirmDeleteId(null);
      if (editingExp?.id === id) setEditingExp(null);
      showToast('Work experience deleted from the public portfolio.');
    } catch (err) {
      setErrorBanner(
        err instanceof Error ? err.message : 'Failed to delete work experience.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================== PROJECT HANDLERS ====================
  const startNewProject = () => {
    const nextOrder = projects.length + 1;
    setEditingProject({
      id: `proj-${Date.now()}`,
      order: nextOrder,
      number: String(nextOrder).padStart(2, '0'),
      title: '',
      category: '',
      status: 'In Development',
      description: '',
      technologies: [],
      contribution: '',
      imageUrl: '',
      liveUrl: '',
      githubUrl: '',
    });
    setProjectTechText('');
    setConfirmDeleteId(null);
  };

  const startEditProject = (proj: StoredProjectItem) => {
    setEditingProject({ ...proj });
    setProjectTechText(proj.technologies.join(', '));
    setConfirmDeleteId(null);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setSaving(true);
    setErrorBanner(null);
    try {
      const technologies = projectTechText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      await saveProject({
        ...editingProject,
        technologies,
      });
      setEditingProject(null);
      showToast('Project saved and updated live on the public portfolio.');
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Failed to save project.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    setSaving(true);
    setErrorBanner(null);
    try {
      await deleteProject(id);
      setConfirmDeleteId(null);
      if (editingProject?.id === id) setEditingProject(null);
      showToast('Project deleted from the public portfolio.');
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Failed to delete project.');
    } finally {
      setSaving(false);
    }
  };

  // ==================== SKILLS HANDLERS ====================
  const startNewSkill = () => {
    const nextOrder = skills.length + 1;
    setEditingSkill({
      id: `skill-${Date.now()}`,
      order: nextOrder,
      index: String(nextOrder).padStart(2, '0'),
      title: '',
      skills: [],
    });
    setSkillItemsText('');
    setConfirmDeleteId(null);
  };

  const startEditSkill = (cat: StoredSkillCategory) => {
    setEditingSkill({ ...cat });
    setSkillItemsText(cat.skills.join(', '));
    setConfirmDeleteId(null);
  };

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill) return;
    setSaving(true);
    setErrorBanner(null);
    try {
      const skillItems = skillItemsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      await saveSkillCategory({
        ...editingSkill,
        skills: skillItems,
      });
      setEditingSkill(null);
      showToast('Skill category saved and synced live.');
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Failed to save skills.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    setSaving(true);
    setErrorBanner(null);
    try {
      await deleteSkillCategory(id);
      setConfirmDeleteId(null);
      if (editingSkill?.id === id) setEditingSkill(null);
      showToast('Skill category deleted from the public portfolio.');
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Failed to delete skill category.');
    } finally {
      setSaving(false);
    }
  };

  // ==================== RESUME PDF HANDLERS ====================
  const handlePdfFileSelected = (file: File | null) => {
    setErrorBanner(null);
    if (!file) return;

    const isPdf =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setErrorBanner('Please select a valid PDF file (.pdf).');
      return;
    }

    if (file.size > MAX_PDF_UPLOAD_BYTES) {
      setErrorBanner(
        `Selected PDF is ${formatBytes(file.size)}. Direct upload supports files up to ${formatBytes(MAX_PDF_UPLOAD_BYTES)}. Compress the PDF slightly or switch to "External PDF Link" to attach a Google Drive / hosted PDF of any size.`
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const prefix = 'data:application/pdf;base64,';
      const commaIdx = result.indexOf(',');
      const base64 = result.startsWith(prefix)
        ? result.slice(prefix.length)
        : commaIdx >= 0
          ? result.slice(commaIdx + 1)
          : '';

      if (!base64 || base64.length > 950000) {
        setErrorBanner(
          'Unable to encode PDF within the storage limit. Try a slightly smaller PDF or use External PDF Link.'
        );
        return;
      }

      setPendingPdfBase64(base64);
      setPendingPdfSize(file.size);
      setPendingPdfOriginalName(file.name);
      if (!resumeFileName.trim() || resumeFileName === 'Vignesh_Resume.pdf') {
        setResumeFileName(file.name);
      }
    };
    reader.onerror = () => {
      setErrorBanner('Could not read the selected PDF file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handlePublishUploadedResume = async (e: React.FormEvent) => {
    e.preventDefault();
    const base64ToSave =
      pendingPdfBase64 || (resume.sourceType === 'upload' ? resume.pdfBase64 : '');
    const sizeToSave =
      pendingPdfBase64
        ? pendingPdfSize
        : resume.sourceType === 'upload'
          ? resume.fileSizeBytes
          : 0;

    if (!base64ToSave) {
      setErrorBanner('Please select a PDF file to upload first.');
      return;
    }

    setSaving(true);
    setErrorBanner(null);
    try {
      await saveResume({
        sourceType: 'upload',
        fileName: resumeFileName.trim() || pendingPdfOriginalName || 'Vignesh_Resume.pdf',
        pdfUrl: '',
        pdfBase64: base64ToSave,
        fileSizeBytes: sizeToSave,
        statusNote: resumeStatusNoteDraft,
      });
      setPendingPdfBase64('');
      setPendingPdfSize(0);
      setPendingPdfOriginalName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      showToast('Resume PDF uploaded and published live on the public website.');
    } catch (err) {
      setErrorBanner(
        err instanceof Error ? err.message : 'Failed to publish Resume PDF.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePublishUrlResume = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = resumeUrlDraft.trim();
    if (!isSafeHttpOrRelativeUrl(trimmedUrl)) {
      setErrorBanner(
        'Please enter a valid PDF URL starting with https://, http://, or /.'
      );
      return;
    }

    setSaving(true);
    setErrorBanner(null);
    try {
      await saveResume({
        sourceType: 'url',
        fileName: resumeFileName.trim() || 'Vignesh_Resume.pdf',
        pdfUrl: trimmedUrl,
        pdfBase64: '',
        fileSizeBytes: 0,
        statusNote: resumeStatusNoteDraft,
      });
      showToast('Resume PDF link published live on the public website.');
    } catch (err) {
      setErrorBanner(
        err instanceof Error ? err.message : 'Failed to save Resume PDF link.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveResume = async () => {
    setSaving(true);
    setErrorBanner(null);
    try {
      await deleteResume();
      setConfirmDeleteId(null);
      setPendingPdfBase64('');
      setPendingPdfSize(0);
      setPendingPdfOriginalName('');
      setResumeUrlDraft('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      showToast('Resume PDF removed. Public card reverted to email request.');
    } catch (err) {
      setErrorBanner(
        err instanceof Error ? err.message : 'Failed to remove Resume PDF.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================== PROFILE & CONTACT HANDLER ====================
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorBanner(null);
    try {
      const parsedTagline = taglineText
        .split('|')
        .map((s) => s.trim())
        .filter(Boolean);
      await saveProfile({
        ...profileDraft,
        tagline: parsedTagline.length > 0 ? parsedTagline : profile.tagline,
      });
      showToast('Portfolio settings updated live on the public website.');
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const TABS: { id: AdminTab; label: string; icon: typeof Briefcase }[] = [
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'skills', label: 'Skills', icon: Wrench },
    { id: 'resume', label: 'Resume PDF', icon: FileText },
    { id: 'profile', label: 'Profile & Education', icon: User },
    { id: 'contact', label: 'Contact Links', icon: Mail },
  ];

  const liveResumeHref =
    resume.sourceType === 'upload'
      ? previewBlobUrl
      : resume.sourceType === 'url' && isSafeHttpOrRelativeUrl(resume.pdfUrl)
        ? resume.pdfUrl.trim()
        : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Portfolio Admin Portal"
      className="fixed inset-0 z-[90] flex flex-col bg-[#121216] text-[#F4F4F6]"
    >
      {/* Top Bar */}
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[#4A4B52] bg-[#16161B] px-4 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-[#C8FF2E]" aria-hidden="true" />
          <div>
            <h2 className="font-[var(--font-display)] text-base font-bold tracking-[0.06em] text-[#F4F4F6] uppercase sm:text-lg">
              Owner Admin Portal
            </h2>
            <p className="font-mono text-[10px] tracking-[0.14em] text-[#9A9BA5] uppercase">
              {isOwnerAdmin
                ? `Signed in as ${user?.email}`
                : 'Restricted Owner Access'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {isOwnerAdmin && (
            <button
              type="button"
              onClick={signOutAdmin}
              className="inline-flex items-center gap-1.5 border border-[#4A4B52] px-3 py-2 font-mono text-[11px] font-medium tracking-[0.1em] text-[#B8B9C2] uppercase transition-colors hover:border-[#C8FF2E] hover:text-[#C8FF2E]"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Admin Portal"
            className="inline-flex items-center gap-1.5 border border-[#C8FF2E] bg-[#C8FF2E] px-3.5 py-2 font-mono text-[11px] font-semibold tracking-[0.1em] text-[#121216] uppercase transition-colors hover:bg-transparent hover:text-[#C8FF2E]"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to Site</span>
          </button>
        </div>
      </header>

      {/* Main Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-8">
        {!authReady ? (
          <div className="mx-auto max-w-md py-20 text-center font-mono text-xs tracking-[0.16em] text-[#9A9BA5] uppercase">
            Verifying session...
          </div>
        ) : !isOwnerAdmin ? (
          /* ==================== OWNER-ONLY LOGIN GATE ==================== */
          <div className="mx-auto mt-10 max-w-md border border-[#4A4B52] bg-[#16161B] p-6 sm:p-8">
            <p className="font-mono text-[11px] font-semibold tracking-[0.18em] text-[#C8FF2E] uppercase">
              Protected Access
            </p>
            <h3 className="mt-2 font-[var(--font-display)] text-2xl font-bold text-[#F4F4F6]">
              Admin Owner Sign In
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[#B8B9C2]">
              Sign in with Google using the authorized owner email{' '}
              <span className="font-mono text-xs text-[#C8FF2E]">
                {ADMIN_OWNER_EMAIL}
              </span>{' '}
              to update work experience, projects, skills, resume PDF, education, and contact links live.
            </p>

            {authError && (
              <div
                role="alert"
                className="mt-5 flex items-start gap-2.5 border border-red-500/60 bg-red-950/30 p-3.5 text-xs leading-relaxed text-red-200"
              >
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-400" aria-hidden="true" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleLogin}
              disabled={signingIn}
              className="mt-6 inline-flex w-full items-center justify-center gap-2.5 border border-[#C8FF2E] bg-[#C8FF2E] px-5 py-3 font-mono text-xs font-semibold tracking-[0.12em] text-[#121216] uppercase transition-colors hover:bg-transparent hover:text-[#C8FF2E] disabled:opacity-50"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              <span>{signingIn ? 'Opening Google Sign-In...' : 'Sign In with Google'}</span>
            </button>
          </div>
        ) : (
          /* ==================== AUTHORIZED ADMIN DASHBOARD ==================== */
          <div className="mx-auto max-w-5xl">
            {/* Feedback banners */}
            {toast && (
              <div
                role="status"
                className="mb-6 flex items-center gap-2.5 border border-[#C8FF2E] bg-[#16161B] px-4 py-3 font-mono text-xs text-[#C8FF2E]"
              >
                <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{toast}</span>
              </div>
            )}
            {errorBanner && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-2.5 border border-red-500/70 bg-red-950/30 px-4 py-3 text-xs text-red-200"
              >
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-400" aria-hidden="true" />
                <span className="break-words">{errorBanner}</span>
              </div>
            )}

            {/* Navigation Tabs */}
            <nav
              aria-label="Admin sections"
              className="mb-8 flex flex-wrap gap-2 border-b border-[#4A4B52] pb-4"
            >
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setConfirmDeleteId(null);
                      setErrorBanner(null);
                    }}
                    className={`inline-flex items-center gap-2 border px-3.5 py-2 font-mono text-xs font-medium tracking-[0.08em] uppercase transition-colors ${
                      active
                        ? 'border-[#C8FF2E] bg-[#C8FF2E] text-[#121216]'
                        : 'border-[#4A4B52] bg-transparent text-[#B8B9C2] hover:border-[#C8FF2E] hover:text-[#F4F4F6]'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* ==================== TAB 1: WORK EXPERIENCE ==================== */}
            {activeTab === 'experience' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-[var(--font-display)] text-xl font-bold text-[#F4F4F6]">
                      Work Experience ({experiences.length})
                    </h3>
                    <p className="mt-1 text-xs text-[#9A9BA5]">
                      Add, edit, or delete work experience records. Updates reflect live on the public site.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={startNewExperience}
                    className="inline-flex items-center gap-2 border border-[#C8FF2E] bg-[#C8FF2E] px-4 py-2 font-mono text-xs font-semibold tracking-[0.1em] text-[#121216] uppercase transition-colors hover:bg-transparent hover:text-[#C8FF2E]"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Add Experience</span>
                  </button>
                </div>

                {editingExp && (
                  <form
                    onSubmit={handleSaveExperience}
                    className="border border-[#C8FF2E] bg-[#16161B] p-5 sm:p-6"
                  >
                    <div className="mb-4 flex items-center justify-between border-b border-[#4A4B52]/60 pb-3">
                      <span className="font-mono text-xs font-semibold tracking-[0.14em] text-[#C8FF2E] uppercase">
                        {experiences.some((x) => x.id === editingExp.id)
                          ? 'Edit Work Experience'
                          : 'New Work Experience'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingExp(null)}
                        className="text-[#9A9BA5] hover:text-[#F4F4F6]"
                        aria-label="Cancel editing experience"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className={LABEL_CLASS}>Company Name *</label>
                        <input
                          required
                          maxLength={160}
                          value={editingExp.company}
                          onChange={(e) =>
                            setEditingExp({ ...editingExp, company: e.target.value })
                          }
                          placeholder="e.g. Acidus Management Solution Private Limited"
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>Job Title *</label>
                        <input
                          required
                          maxLength={140}
                          value={editingExp.jobTitle}
                          onChange={(e) =>
                            setEditingExp({ ...editingExp, jobTitle: e.target.value })
                          }
                          placeholder="e.g. Client Service Executive"
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>Process / Department *</label>
                        <input
                          required
                          maxLength={140}
                          value={editingExp.department}
                          onChange={(e) =>
                            setEditingExp({ ...editingExp, department: e.target.value })
                          }
                          placeholder="e.g. Charge Entry"
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>Industry *</label>
                        <input
                          required
                          maxLength={160}
                          value={editingExp.industry}
                          onChange={(e) =>
                            setEditingExp({ ...editingExp, industry: e.target.value })
                          }
                          placeholder="e.g. Healthcare Revenue Cycle Management (RCM)"
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>Duration *</label>
                        <input
                          required
                          maxLength={80}
                          value={editingExp.duration}
                          onChange={(e) =>
                            setEditingExp({ ...editingExp, duration: e.target.value })
                          }
                          placeholder="e.g. 1 Year"
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={LABEL_CLASS}>Badge Index</label>
                          <input
                            required
                            maxLength={12}
                            value={editingExp.index}
                            onChange={(e) =>
                              setEditingExp({ ...editingExp, index: e.target.value })
                            }
                            placeholder="01"
                            className={INPUT_CLASS}
                          />
                        </div>
                        <div>
                          <label className={LABEL_CLASS}>Sort Order</label>
                          <input
                            type="number"
                            min={0}
                            max={1000}
                            value={editingExp.order}
                            onChange={(e) =>
                              setEditingExp({
                                ...editingExp,
                                order: Number(e.target.value) || 0,
                              })
                            }
                            className={INPUT_CLASS}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className={LABEL_CLASS}>
                        Key Responsibilities (one per line)
                      </label>
                      <textarea
                        rows={5}
                        value={expResponsibilitiesText}
                        onChange={(e) => setExpResponsibilitiesText(e.target.value)}
                        placeholder="Enter each responsibility on a new line..."
                        className={INPUT_CLASS}
                      />
                    </div>

                    <div className="mt-5 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingExp(null)}
                        className="border border-[#4A4B52] px-4 py-2 font-mono text-xs text-[#B8B9C2] uppercase hover:border-[#F4F4F6]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 border border-[#C8FF2E] bg-[#C8FF2E] px-5 py-2 font-mono text-xs font-semibold text-[#121216] uppercase hover:bg-transparent hover:text-[#C8FF2E] disabled:opacity-50"
                      >
                        <Save className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{saving ? 'Saving...' : 'Save Experience'}</span>
                      </button>
                    </div>
                  </form>
                )}

                {experiences.length === 0 ? (
                  <div className="border border-[#4A4B52]/70 bg-[#16161B] p-8 text-center text-sm text-[#9A9BA5]">
                    No work experiences published yet. Click &ldquo;Add Experience&rdquo; to create one.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {experiences.map((exp) => (
                      <div
                        key={exp.id}
                        className="flex flex-col justify-between gap-4 border border-[#4A4B52] bg-[#16161B] p-5 sm:flex-row sm:items-start"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-[#C8FF2E]">
                            <span>{exp.index}</span>
                            <span className="text-[#4A4B52]">·</span>
                            <span>{exp.duration}</span>
                          </div>
                          <h4 className="mt-1 font-[var(--font-display)] text-lg font-bold text-[#F4F4F6]">
                            {exp.jobTitle}
                          </h4>
                          <p className="text-sm text-[#D2D3DC]">{exp.company}</p>
                          <p className="mt-1 font-mono text-xs text-[#9A9BA5]">
                            {exp.department} · {exp.industry}
                          </p>
                          <p className="mt-2 text-xs text-[#8E909A]">
                            {exp.responsibilities.length} responsibilities listed
                          </p>
                        </div>

                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEditExperience(exp)}
                            className="inline-flex items-center gap-1.5 border border-[#4A4B52] px-3 py-1.5 font-mono text-xs text-[#F4F4F6] uppercase hover:border-[#C8FF2E] hover:text-[#C8FF2E]"
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Edit</span>
                          </button>

                          {confirmDeleteId === exp.id ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={saving}
                                onClick={() => handleDeleteExperience(exp.id)}
                                className="border border-red-500 bg-red-600 px-3 py-1.5 font-mono text-xs font-semibold text-white uppercase hover:bg-red-700"
                              >
                                Confirm Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="border border-[#4A4B52] px-2.5 py-1.5 font-mono text-xs text-[#B8B9C2] uppercase"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(exp.id)}
                              className="inline-flex items-center gap-1.5 border border-[#4A4B52] px-3 py-1.5 font-mono text-xs text-red-300 uppercase hover:border-red-400 hover:text-red-200"
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ==================== TAB 2: PROJECTS ==================== */}
            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-[var(--font-display)] text-xl font-bold text-[#F4F4F6]">
                      Selected Projects ({projects.length})
                    </h3>
                    <p className="mt-1 text-xs text-[#9A9BA5]">
                      Manage projects, live URLs, GitHub repositories, preview images, and verified technologies.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={startNewProject}
                    className="inline-flex items-center gap-2 border border-[#C8FF2E] bg-[#C8FF2E] px-4 py-2 font-mono text-xs font-semibold tracking-[0.1em] text-[#121216] uppercase transition-colors hover:bg-transparent hover:text-[#C8FF2E]"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Add Project</span>
                  </button>
                </div>

                {editingProject && (
                  <form
                    onSubmit={handleSaveProject}
                    className="border border-[#C8FF2E] bg-[#16161B] p-5 sm:p-6"
                  >
                    <div className="mb-4 flex items-center justify-between border-b border-[#4A4B52]/60 pb-3">
                      <span className="font-mono text-xs font-semibold tracking-[0.14em] text-[#C8FF2E] uppercase">
                        {projects.some((x) => x.id === editingProject.id)
                          ? 'Edit Project'
                          : 'New Project'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingProject(null)}
                        className="text-[#9A9BA5] hover:text-[#F4F4F6]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className={LABEL_CLASS}>Project Title *</label>
                        <input
                          required
                          maxLength={140}
                          value={editingProject.title}
                          onChange={(e) =>
                            setEditingProject({ ...editingProject, title: e.target.value })
                          }
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>Category *</label>
                        <input
                          required
                          maxLength={120}
                          value={editingProject.category}
                          onChange={(e) =>
                            setEditingProject({ ...editingProject, category: e.target.value })
                          }
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>Status *</label>
                        <select
                          value={editingProject.status}
                          onChange={(e) =>
                            setEditingProject({
                              ...editingProject,
                              status: e.target.value as ProjectStatus,
                            })
                          }
                          className={INPUT_CLASS}
                        >
                          <option value="Live">Live</option>
                          <option value="In Development">In Development</option>
                          <option value="Academic Project">Academic Project</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={LABEL_CLASS}>Number</label>
                          <input
                            required
                            maxLength={12}
                            value={editingProject.number}
                            onChange={(e) =>
                              setEditingProject({ ...editingProject, number: e.target.value })
                            }
                            className={INPUT_CLASS}
                          />
                        </div>
                        <div>
                          <label className={LABEL_CLASS}>Sort Order</label>
                          <input
                            type="number"
                            min={0}
                            max={1000}
                            value={editingProject.order}
                            onChange={(e) =>
                              setEditingProject({
                                ...editingProject,
                                order: Number(e.target.value) || 0,
                              })
                            }
                            className={INPUT_CLASS}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>Live Website URL (optional)</label>
                        <input
                          maxLength={500}
                          value={editingProject.liveUrl ?? ''}
                          onChange={(e) =>
                            setEditingProject({ ...editingProject, liveUrl: e.target.value })
                          }
                          placeholder="https://..."
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>GitHub Repo URL (optional)</label>
                        <input
                          maxLength={500}
                          value={editingProject.githubUrl ?? ''}
                          onChange={(e) =>
                            setEditingProject({ ...editingProject, githubUrl: e.target.value })
                          }
                          placeholder="https://github.com/..."
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={LABEL_CLASS}>Preview Image URL (optional)</label>
                        <input
                          maxLength={500}
                          value={editingProject.imageUrl ?? ''}
                          onChange={(e) =>
                            setEditingProject({ ...editingProject, imageUrl: e.target.value })
                          }
                          placeholder="https://... (leave empty for minimalist architectural cover plate)"
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={LABEL_CLASS}>
                          Verified Technologies (comma separated)
                        </label>
                        <input
                          value={projectTechText}
                          onChange={(e) => setProjectTechText(e.target.value)}
                          placeholder="React, TypeScript, Node.js, MongoDB"
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={LABEL_CLASS}>Description *</label>
                        <textarea
                          required
                          rows={3}
                          maxLength={800}
                          value={editingProject.description}
                          onChange={(e) =>
                            setEditingProject({
                              ...editingProject,
                              description: e.target.value,
                            })
                          }
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={LABEL_CLASS}>My Contribution *</label>
                        <textarea
                          required
                          rows={2}
                          maxLength={800}
                          value={editingProject.contribution}
                          onChange={(e) =>
                            setEditingProject({
                              ...editingProject,
                              contribution: e.target.value,
                            })
                          }
                          className={INPUT_CLASS}
                        />
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingProject(null)}
                        className="border border-[#4A4B52] px-4 py-2 font-mono text-xs text-[#B8B9C2] uppercase"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 border border-[#C8FF2E] bg-[#C8FF2E] px-5 py-2 font-mono text-xs font-semibold text-[#121216] uppercase hover:bg-transparent hover:text-[#C8FF2E] disabled:opacity-50"
                      >
                        <Save className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{saving ? 'Saving...' : 'Save Project'}</span>
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="flex flex-col justify-between gap-4 border border-[#4A4B52] bg-[#16161B] p-4"
                    >
                      <div>
                        <div className="flex items-center justify-between font-mono text-xs">
                          <span className="text-[#C8FF2E]">{proj.number}</span>
                          <span className="text-[#9A9BA5] uppercase">{proj.status}</span>
                        </div>
                        <h4 className="mt-1 font-[var(--font-display)] text-base font-bold text-[#F4F4F6]">
                          {proj.title}
                        </h4>
                        <p className="mt-0.5 font-mono text-[11px] text-[#8E909A]">
                          {proj.category}
                        </p>
                        <p className="mt-2 line-clamp-2 text-xs text-[#B8B9C2]">
                          {proj.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 border-t border-[#4A4B52]/50 pt-3">
                        <button
                          type="button"
                          onClick={() => startEditProject(proj)}
                          className="inline-flex items-center gap-1.5 border border-[#4A4B52] px-3 py-1.5 font-mono text-[11px] text-[#F4F4F6] uppercase hover:border-[#C8FF2E] hover:text-[#C8FF2E]"
                        >
                          <Pencil className="h-3 w-3" aria-hidden="true" />
                          <span>Edit</span>
                        </button>
                        {confirmDeleteId === proj.id ? (
                          <>
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => handleDeleteProject(proj.id)}
                              className="border border-red-500 bg-red-600 px-3 py-1.5 font-mono text-[11px] font-semibold text-white uppercase"
                            >
                              Confirm Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="border border-[#4A4B52] px-2.5 py-1.5 font-mono text-[11px] text-[#B8B9C2] uppercase"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(proj.id)}
                            className="inline-flex items-center gap-1.5 border border-[#4A4B52] px-3 py-1.5 font-mono text-[11px] text-red-300 uppercase hover:border-red-400"
                          >
                            <Trash2 className="h-3 w-3" aria-hidden="true" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ==================== TAB 3: SKILLS ==================== */}
            {activeTab === 'skills' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-[var(--font-display)] text-xl font-bold text-[#F4F4F6]">
                      Technical Skill Categories ({skills.length})
                    </h3>
                    <p className="mt-1 text-xs text-[#9A9BA5]">
                      Add, edit, or delete skill groups and individual technologies.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={startNewSkill}
                    className="inline-flex items-center gap-2 border border-[#C8FF2E] bg-[#C8FF2E] px-4 py-2 font-mono text-xs font-semibold tracking-[0.1em] text-[#121216] uppercase hover:bg-transparent hover:text-[#C8FF2E]"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Add Category</span>
                  </button>
                </div>

                {editingSkill && (
                  <form
                    onSubmit={handleSaveSkill}
                    className="border border-[#C8FF2E] bg-[#16161B] p-5 sm:p-6"
                  >
                    <div className="mb-4 flex items-center justify-between border-b border-[#4A4B52]/60 pb-3">
                      <span className="font-mono text-xs font-semibold tracking-[0.14em] text-[#C8FF2E] uppercase">
                        {skills.some((x) => x.id === editingSkill.id)
                          ? 'Edit Skill Category'
                          : 'New Skill Category'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingSkill(null)}
                        className="text-[#9A9BA5] hover:text-[#F4F4F6]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <label className={LABEL_CLASS}>Category Title *</label>
                        <input
                          required
                          maxLength={120}
                          value={editingSkill.title}
                          onChange={(e) =>
                            setEditingSkill({ ...editingSkill, title: e.target.value })
                          }
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={LABEL_CLASS}>Index</label>
                          <input
                            required
                            maxLength={12}
                            value={editingSkill.index}
                            onChange={(e) =>
                              setEditingSkill({ ...editingSkill, index: e.target.value })
                            }
                            className={INPUT_CLASS}
                          />
                        </div>
                        <div>
                          <label className={LABEL_CLASS}>Order</label>
                          <input
                            type="number"
                            min={0}
                            max={1000}
                            value={editingSkill.order}
                            onChange={(e) =>
                              setEditingSkill({
                                ...editingSkill,
                                order: Number(e.target.value) || 0,
                              })
                            }
                            className={INPUT_CLASS}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className={LABEL_CLASS}>Skills (comma separated) *</label>
                      <textarea
                        required
                        rows={3}
                        value={skillItemsText}
                        onChange={(e) => setSkillItemsText(e.target.value)}
                        placeholder="HTML, CSS, JavaScript, React, Bootstrap"
                        className={INPUT_CLASS}
                      />
                    </div>

                    <div className="mt-5 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingSkill(null)}
                        className="border border-[#4A4B52] px-4 py-2 font-mono text-xs text-[#B8B9C2] uppercase"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 border border-[#C8FF2E] bg-[#C8FF2E] px-5 py-2 font-mono text-xs font-semibold text-[#121216] uppercase hover:bg-transparent hover:text-[#C8FF2E] disabled:opacity-50"
                      >
                        <Save className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{saving ? 'Saving...' : 'Save Category'}</span>
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {skills.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex flex-col justify-between gap-4 border border-[#4A4B52] bg-[#16161B] p-4"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-[var(--font-display)] text-base font-bold text-[#F4F4F6]">
                            {cat.title}
                          </h4>
                          <span className="font-mono text-xs text-[#C8FF2E]">{cat.index}</span>
                        </div>
                        <p className="mt-2 font-mono text-xs text-[#B8B9C2]">
                          {cat.skills.join(' · ')}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 border-t border-[#4A4B52]/50 pt-3">
                        <button
                          type="button"
                          onClick={() => startEditSkill(cat)}
                          className="inline-flex items-center gap-1.5 border border-[#4A4B52] px-3 py-1.5 font-mono text-[11px] text-[#F4F4F6] uppercase hover:border-[#C8FF2E] hover:text-[#C8FF2E]"
                        >
                          <Pencil className="h-3 w-3" aria-hidden="true" />
                          <span>Edit</span>
                        </button>
                        {confirmDeleteId === cat.id ? (
                          <>
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => handleDeleteSkill(cat.id)}
                              className="border border-red-500 bg-red-600 px-3 py-1.5 font-mono text-[11px] font-semibold text-white uppercase"
                            >
                              Confirm Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="border border-[#4A4B52] px-2.5 py-1.5 font-mono text-[11px] text-[#B8B9C2] uppercase"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(cat.id)}
                            className="inline-flex items-center gap-1.5 border border-[#4A4B52] px-3 py-1.5 font-mono text-[11px] text-red-300 uppercase hover:border-red-400"
                          >
                            <Trash2 className="h-3 w-3" aria-hidden="true" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ==================== TAB 4: RESUME PDF ==================== */}
            {activeTab === 'resume' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-[var(--font-display)] text-xl font-bold text-[#F4F4F6]">
                    Resume PDF Manager
                  </h3>
                  <p className="mt-1 text-xs text-[#9A9BA5]">
                    Upload your Resume PDF directly or attach a hosted PDF link. Changes activate the live download button in the Contact section immediately.
                  </p>
                </div>

                {/* Current Published Resume Status Card */}
                <div className="border border-[#4A4B52] bg-[#16161B] p-5 sm:p-6">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <p className="font-mono text-[11px] font-semibold tracking-[0.16em] text-[#C8FF2E] uppercase">
                        Current Public Status
                      </p>
                      <h4 className="mt-1.5 font-[var(--font-display)] text-lg font-bold text-[#F4F4F6]">
                        {resume.sourceType === 'upload' && resume.pdfBase64
                          ? `Uploaded PDF Active — ${resume.fileName}`
                          : resume.sourceType === 'url' && resume.pdfUrl
                            ? `Hosted PDF Link Active — ${resume.fileName}`
                            : 'No Resume PDF Published Yet (Upon Request)'}
                      </h4>
                      <p className="mt-1 font-mono text-xs text-[#9A9BA5]">
                        {resume.sourceType === 'upload' && resume.fileSizeBytes > 0
                          ? `Stored PDF size: ${formatBytes(resume.fileSizeBytes)}`
                          : resume.sourceType === 'url' && resume.pdfUrl
                            ? resume.pdfUrl
                            : 'Visitors currently see the "Request Resume via Email" button.'}
                      </p>
                    </div>

                    {liveResumeHref && (
                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <a
                          href={liveResumeHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 border border-[#4A4B52] px-3 py-2 font-mono text-[11px] text-[#F4F4F6] uppercase hover:border-[#C8FF2E] hover:text-[#C8FF2E]"
                        >
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Preview</span>
                        </a>
                        <a
                          href={liveResumeHref}
                          download={resume.fileName}
                          className="inline-flex items-center gap-1.5 border border-[#4A4B52] px-3 py-2 font-mono text-[11px] text-[#C8FF2E] uppercase hover:border-[#C8FF2E]"
                        >
                          <Download className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Download</span>
                        </a>
                        {confirmDeleteId === 'resume-current' ? (
                          <>
                            <button
                              type="button"
                              disabled={saving}
                              onClick={handleRemoveResume}
                              className="border border-red-500 bg-red-600 px-3 py-2 font-mono text-[11px] font-semibold text-white uppercase"
                            >
                              Confirm Remove
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="border border-[#4A4B52] px-2.5 py-2 font-mono text-[11px] text-[#B8B9C2] uppercase"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId('resume-current')}
                            className="inline-flex items-center gap-1.5 border border-[#4A4B52] px-3 py-2 font-mono text-[11px] text-red-300 uppercase hover:border-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Source Mode Toggle: Upload PDF File vs External PDF Link */}
                <div className="border border-[#4A4B52] bg-[#16161B] p-5 sm:p-7">
                  <div className="mb-6 flex flex-wrap gap-2 border-b border-[#4A4B52]/60 pb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setResumeMode('upload');
                        setErrorBanner(null);
                      }}
                      className={`inline-flex items-center gap-2 border px-4 py-2 font-mono text-xs font-medium tracking-[0.08em] uppercase transition-colors ${
                        resumeMode === 'upload'
                          ? 'border-[#C8FF2E] bg-[#C8FF2E] text-[#121216]'
                          : 'border-[#4A4B52] text-[#B8B9C2] hover:border-[#C8FF2E] hover:text-[#F4F4F6]'
                      }`}
                    >
                      <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Upload PDF File</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setResumeMode('url');
                        setErrorBanner(null);
                      }}
                      className={`inline-flex items-center gap-2 border px-4 py-2 font-mono text-xs font-medium tracking-[0.08em] uppercase transition-colors ${
                        resumeMode === 'url'
                          ? 'border-[#C8FF2E] bg-[#C8FF2E] text-[#121216]'
                          : 'border-[#4A4B52] text-[#B8B9C2] hover:border-[#C8FF2E] hover:text-[#F4F4F6]'
                      }`}
                    >
                      <LinkIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>External PDF Link</span>
                    </button>
                  </div>

                  {resumeMode === 'upload' ? (
                    <form onSubmit={handlePublishUploadedResume} className="space-y-5">
                      <div>
                        <label className={LABEL_CLASS}>
                          Select Resume PDF File (Max 680 KB)
                        </label>
                        <div
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const dropped = e.dataTransfer.files?.[0] ?? null;
                            handlePdfFileSelected(dropped);
                          }}
                          className="flex flex-col items-center justify-center border border-dashed border-[#4A4B52] bg-[#121216] px-6 py-8 text-center transition-colors hover:border-[#C8FF2E]"
                        >
                          <Upload
                            className="h-7 w-7 text-[#C8FF2E]"
                            aria-hidden="true"
                          />
                          <p className="mt-3 text-sm font-medium text-[#F4F4F6]">
                            {pendingPdfOriginalName
                              ? `Ready to publish: ${pendingPdfOriginalName} (${formatBytes(pendingPdfSize)})`
                              : 'Drag and drop your Resume PDF here, or browse from your device'}
                          </p>
                          <p className="mt-1 font-mono text-[11px] text-[#8E909A]">
                            PDF format only · Up to 680 KB direct cloud storage (use External PDF Link for larger files)
                          </p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/pdf,.pdf"
                            onChange={(e) =>
                              handlePdfFileSelected(e.target.files?.[0] ?? null)
                            }
                            className="sr-only"
                            id="resume-pdf-file-input"
                          />
                          <label
                            htmlFor="resume-pdf-file-input"
                            className="mt-4 inline-flex cursor-pointer items-center gap-2 border border-[#C8FF2E] px-4 py-2 font-mono text-xs font-semibold tracking-[0.1em] text-[#C8FF2E] uppercase transition-colors hover:bg-[#C8FF2E] hover:text-[#121216]"
                          >
                            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>
                              {pendingPdfOriginalName ? 'Choose Different PDF' : 'Choose PDF File'}
                            </span>
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className={LABEL_CLASS}>Download Filename *</label>
                          <input
                            required
                            maxLength={140}
                            value={resumeFileName}
                            onChange={(e) => setResumeFileName(e.target.value)}
                            placeholder="Vignesh_Resume.pdf"
                            className={INPUT_CLASS}
                          />
                        </div>
                        <div>
                          <label className={LABEL_CLASS}>
                            Fallback Note (shown if resume is removed)
                          </label>
                          <input
                            maxLength={500}
                            value={resumeStatusNoteDraft}
                            onChange={(e) => setResumeStatusNoteDraft(e.target.value)}
                            className={INPUT_CLASS}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={
                            saving ||
                            (!pendingPdfBase64 &&
                              !(resume.sourceType === 'upload' && resume.pdfBase64))
                          }
                          className="inline-flex items-center gap-2 border border-[#C8FF2E] bg-[#C8FF2E] px-5 py-2.5 font-mono text-xs font-semibold tracking-[0.1em] text-[#121216] uppercase hover:bg-transparent hover:text-[#C8FF2E] disabled:opacity-45"
                        >
                          <Save className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>
                            {saving ? 'Publishing PDF...' : 'Publish Resume PDF'}
                          </span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handlePublishUrlResume} className="space-y-5">
                      <div>
                        <label className={LABEL_CLASS}>Hosted Resume PDF URL *</label>
                        <input
                          type="url"
                          required
                          maxLength={500}
                          value={resumeUrlDraft}
                          onChange={(e) => setResumeUrlDraft(e.target.value)}
                          placeholder="https://drive.google.com/... or https://yourdomain.com/Vignesh_Resume.pdf"
                          className={INPUT_CLASS}
                        />
                        <p className="mt-1.5 text-xs text-[#8E909A]">
                          Supports any public HTTPS link (Google Drive share link, Dropbox, GitHub raw PDF, or hosted website PDF).
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className={LABEL_CLASS}>Download Filename *</label>
                          <input
                            required
                            maxLength={140}
                            value={resumeFileName}
                            onChange={(e) => setResumeFileName(e.target.value)}
                            placeholder="Vignesh_Resume.pdf"
                            className={INPUT_CLASS}
                          />
                        </div>
                        <div>
                          <label className={LABEL_CLASS}>
                            Fallback Note (shown if resume is removed)
                          </label>
                          <input
                            maxLength={500}
                            value={resumeStatusNoteDraft}
                            onChange={(e) => setResumeStatusNoteDraft(e.target.value)}
                            className={INPUT_CLASS}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={saving}
                          className="inline-flex items-center gap-2 border border-[#C8FF2E] bg-[#C8FF2E] px-5 py-2.5 font-mono text-xs font-semibold tracking-[0.1em] text-[#121216] uppercase hover:bg-transparent hover:text-[#C8FF2E] disabled:opacity-50"
                        >
                          <Save className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{saving ? 'Saving...' : 'Publish Resume Link'}</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* ==================== TAB 5: PROFILE & EDUCATION ==================== */}
            {activeTab === 'profile' && (
              <form
                onSubmit={handleSaveProfile}
                className="space-y-6 border border-[#4A4B52] bg-[#16161B] p-5 sm:p-7"
              >
                <div>
                  <h3 className="font-[var(--font-display)] text-xl font-bold text-[#F4F4F6]">
                    Identity &amp; Education
                  </h3>
                  <p className="mt-1 text-xs text-[#9A9BA5]">
                    Changes saved here immediately update the hero, profile brief, and education timeline.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={LABEL_CLASS}>Display Name *</label>
                    <input
                      required
                      maxLength={80}
                      value={profileDraft.name}
                      onChange={(e) =>
                        setProfileDraft({
                          ...profileDraft,
                          name: e.target.value,
                          fullName: e.target.value,
                        })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Headline Role *</label>
                    <input
                      required
                      maxLength={120}
                      value={profileDraft.role}
                      onChange={(e) =>
                        setProfileDraft({ ...profileDraft, role: e.target.value })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={LABEL_CLASS}>Tagline Items (separated by |)</label>
                    <input
                      value={taglineText}
                      onChange={(e) => setTaglineText(e.target.value)}
                      placeholder="Developer | Problem Solver | Technology Enthusiast"
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Profile Brief: Focus</label>
                    <input
                      required
                      maxLength={120}
                      value={profileDraft.focus}
                      onChange={(e) =>
                        setProfileDraft({ ...profileDraft, focus: e.target.value })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Profile Brief: Experience</label>
                    <input
                      required
                      maxLength={120}
                      value={profileDraft.experienceSummary}
                      onChange={(e) =>
                        setProfileDraft({
                          ...profileDraft,
                          experienceSummary: e.target.value,
                        })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Profile Brief: Short Location</label>
                    <input
                      required
                      maxLength={120}
                      value={profileDraft.shortLocation}
                      onChange={(e) =>
                        setProfileDraft({
                          ...profileDraft,
                          shortLocation: e.target.value,
                        })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Profile Brief: Availability</label>
                    <input
                      required
                      maxLength={120}
                      value={profileDraft.availability}
                      onChange={(e) =>
                        setProfileDraft({
                          ...profileDraft,
                          availability: e.target.value,
                        })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                {/* Education Fields */}
                <div className="border-t border-[#4A4B52]/60 pt-5">
                  <p className="mb-3 font-mono text-xs font-semibold tracking-[0.14em] text-[#C8FF2E] uppercase">
                    Education
                  </p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className={LABEL_CLASS}>Degree *</label>
                      <input
                        required
                        maxLength={160}
                        value={profileDraft.educationDegree}
                        onChange={(e) =>
                          setProfileDraft({
                            ...profileDraft,
                            educationDegree: e.target.value,
                          })
                        }
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Institution *</label>
                      <input
                        required
                        maxLength={180}
                        value={profileDraft.educationCollege}
                        onChange={(e) =>
                          setProfileDraft({
                            ...profileDraft,
                            educationCollege: e.target.value,
                          })
                        }
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Graduation Year *</label>
                      <input
                        required
                        maxLength={20}
                        value={profileDraft.educationYear}
                        onChange={(e) =>
                          setProfileDraft({
                            ...profileDraft,
                            educationYear: e.target.value,
                          })
                        }
                        className={INPUT_CLASS}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 border border-[#C8FF2E] bg-[#C8FF2E] px-5 py-2.5 font-mono text-xs font-semibold tracking-[0.1em] text-[#121216] uppercase hover:bg-transparent hover:text-[#C8FF2E] disabled:opacity-50"
                  >
                    <Save className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{saving ? 'Saving...' : 'Save Profile & Education'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* ==================== TAB 6: CONTACT LINKS ==================== */}
            {activeTab === 'contact' && (
              <form
                onSubmit={handleSaveProfile}
                className="space-y-5 border border-[#4A4B52] bg-[#16161B] p-5 sm:p-7"
              >
                <div>
                  <h3 className="font-[var(--font-display)] text-xl font-bold text-[#F4F4F6]">
                    Contact Hyperlinks &amp; Message
                  </h3>
                  <p className="mt-1 text-xs text-[#9A9BA5]">
                    Public visitors see clean icon hyperlinks (no raw URLs exposed as text).
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={LABEL_CLASS}>Email Address *</label>
                    <input
                      type="email"
                      required
                      maxLength={160}
                      value={profileDraft.contactEmail}
                      onChange={(e) =>
                        setProfileDraft({
                          ...profileDraft,
                          contactEmail: e.target.value,
                        })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Location *</label>
                    <input
                      required
                      maxLength={160}
                      value={profileDraft.location}
                      onChange={(e) =>
                        setProfileDraft({ ...profileDraft, location: e.target.value })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>GitHub URL</label>
                    <input
                      type="url"
                      maxLength={300}
                      value={profileDraft.githubUrl}
                      onChange={(e) =>
                        setProfileDraft({ ...profileDraft, githubUrl: e.target.value })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>LinkedIn URL</label>
                    <input
                      type="url"
                      maxLength={300}
                      value={profileDraft.linkedinUrl}
                      onChange={(e) =>
                        setProfileDraft({
                          ...profileDraft,
                          linkedinUrl: e.target.value,
                        })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={LABEL_CLASS}>Contact Section Message</label>
                    <textarea
                      rows={3}
                      maxLength={600}
                      value={profileDraft.contactMessage}
                      onChange={(e) =>
                        setProfileDraft({
                          ...profileDraft,
                          contactMessage: e.target.value,
                        })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 border border-[#C8FF2E] bg-[#C8FF2E] px-5 py-2.5 font-mono text-xs font-semibold tracking-[0.1em] text-[#121216] uppercase hover:bg-transparent hover:text-[#C8FF2E] disabled:opacity-50"
                  >
                    <Save className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{saving ? 'Saving...' : 'Save Contact Links'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
