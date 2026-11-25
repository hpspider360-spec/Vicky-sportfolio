export type ProjectStatus = 'Live' | 'In Development' | 'Academic Project';

export interface ProjectItem {
  id: string;
  number: string;
  title: string;
  category: string;
  status: ProjectStatus;
  description: string;
  /** Populate with verified technologies only. Leave empty if unverified. */
  technologies: string[];
  contribution: string;
  /** Optional real screenshot/thumbnail path. Never fabricate screenshots. */
  imageUrl?: string;
  liveUrl?: string;
  githubUrl?: string;
}

export interface EducationMilestone {
  id: string;
  step: string;
  label: string;
  value: string;
  detail: string;
}

export interface SkillCategory {
  id: string;
  index: string;
  title: string;
  skills: string[];
}

export interface ExperienceItem {
  id: string;
  index: string;
  company: string;
  jobTitle: string;
  department: string;
  industry: string;
  duration: string;
  responsibilities: string[];
}

export interface ResumeConfig {
  /** Set to a real PDF path (e.g. '/Vignesh_Sivan_Resume.pdf') when ready to activate direct download. */
  pdfUrl: string | null;
  fileName: string;
  statusNote: string;
}

export const HERO_DATA = {
  name: 'VIGNESH',
  role: 'COMPUTER SCIENCE ENGINEER',
  tagline: ['Developer', 'Problem Solver', 'Technology Enthusiast'] as const,
  introductionPrefix: "I'm a ",
  introductionHighlight1: 'Computer Science Engineer',
  introductionMid: ' passionate about developing ',
  introductionHighlight2: 'modern web applications',
  introductionMid2: ', exploring emerging technologies, and transforming ideas into ',
  introductionHighlight3: 'practical digital solutions',
  introductionSuffix: '.',
  location: 'Coimbatore, Tamil Nadu, India',
};

/**
 * Editable project registry.
 * Add verified technologies, real screenshots (`imageUrl`), or repository links (`githubUrl`)
 * as they become available without altering any layout component.
 */
export const PROJECTS_DATA: ProjectItem[] = [
  {
    id: 'brownie-girl-cakes',
    number: '01',
    title: 'BrownieGirlCakes',
    category: 'Full-Stack Web Development',
    status: 'Live',
    description:
      'A website developed for a handmade brownie baking business, featuring product presentation, customer ordering workflows, and administrative functionality.',
    technologies: [],
    contribution:
      'Developed the full-stack web application covering storefront presentation, customer ordering workflows, and administrative management.',
    liveUrl: 'https://browniegirlcakes.in',
  },
  {
    id: 'personal-portfolio',
    number: '02',
    title: 'Personal Portfolio',
    category: 'Frontend Development / Creative Development',
    status: 'In Development',
    description:
      'A personal developer portfolio featuring modern responsive layouts, interactive animations, and creative web experiences.',
    technologies: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Motion'],
    contribution:
      'Designed and built the responsive component architecture, minimalist editorial interface, and scroll-driven motion system.',
  },
  {
    id: 'ambulance-positioning-system',
    number: '03',
    title: 'Ambulance Positioning System',
    category: 'Academic Project',
    status: 'Academic Project',
    description:
      'An academic project focused on ambulance positioning and emergency response support.',
    technologies: [],
    contribution:
      'Contributed to academic project research, concept formulation, and emergency positioning workflow design.',
  },
  {
    id: 'town-bus-tracking-iot',
    number: '04',
    title: 'Town Bus Tracking IoT',
    category: 'IoT / Academic Project',
    status: 'Academic Project',
    description:
      'An academic project exploring IoT-based town bus tracking.',
    technologies: [],
    contribution:
      'Explored IoT-based public transit tracking concepts and system workflow modeling as part of academic coursework.',
  },
  {
    id: 'blockchain-asset-lifecycle',
    number: '05',
    title: 'Blockchain Asset Lifecycle',
    category: 'Blockchain / Academic Project',
    status: 'Academic Project',
    description:
      'An academic project exploring blockchain concepts for asset lifecycle management.',
    technologies: [],
    contribution:
      'Studied decentralized ledger concepts and lifecycle traceability models for academic project documentation and design.',
  },
  {
    id: 'deep-learning-criminal-id',
    number: '06',
    title: 'Deep Learning Criminal ID System',
    category: 'Deep Learning / Academic Project',
    status: 'Academic Project',
    description:
      'An academic project exploring deep learning concepts for criminal identification.',
    technologies: [],
    contribution:
      'Researched deep learning identification concepts and academic model evaluation workflows.',
  },
];

export const EDUCATION_SUMMARY = {
  degree: 'BE — Computer Science and Engineering',
  college: 'RVS College of Engineering and Technology',
  graduationYear: '2024',
};

export const EDUCATION_MILESTONES: EducationMilestone[] = [
  {
    id: 'degree',
    step: '01',
    label: 'Degree',
    value: 'BE — Computer Science and Engineering',
    detail: 'Undergraduate Engineering Program',
  },
  {
    id: 'institution',
    step: '02',
    label: 'Institution',
    value: 'RVS College of Engineering and Technology',
    detail: 'Academic Institution',
  },
  {
    id: 'graduation',
    step: '03',
    label: 'Graduation Year',
    value: '2024',
    detail: 'Completed Degree Program',
  },
];

export const SKILLS_DATA: SkillCategory[] = [
  {
    id: 'frontend',
    index: '01',
    title: 'Frontend Development',
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Bootstrap'],
  },
  {
    id: 'backend',
    index: '02',
    title: 'Backend Development',
    skills: ['Node.js', 'Express.js', 'REST APIs', 'Spring Boot'],
  },
  {
    id: 'database',
    index: '03',
    title: 'Database',
    skills: ['MongoDB', 'SQL'],
  },
  {
    id: 'tools',
    index: '04',
    title: 'Tools and Technologies',
    skills: ['Git', 'GitHub', 'Postman', 'Vite'],
  },
  {
    id: 'additional',
    index: '05',
    title: 'Additional Technologies',
    skills: ['Python', 'AI Integration', 'Workflow Automation'],
  },
];

/**
 * Verified professional work experience entries.
 * Add new verified roles to this array whenever needed.
 */
export const EXPERIENCE_DATA: ExperienceItem[] = [
  {
    id: 'acidus-management-solution',
    index: '01',
    company: 'Acidus Management Solution Private Limited',
    jobTitle: 'Client Service Executive',
    department: 'Charge Entry',
    industry: 'Healthcare Revenue Cycle Management (RCM)',
    duration: '1 Year',
    responsibilities: [
      'Charge entry and healthcare billing data processing.',
      'Reviewing patient and billing information.',
      'Working with CPT and ICD-10 codes.',
      'Maintaining accuracy in charge entry operations.',
      'Following healthcare billing workflows.',
      'Supporting timely claim submission processes.',
    ],
  },
];

export const RESUME_CONFIG: ResumeConfig = {
  pdfUrl: null,
  fileName: 'Vignesh_Resume.pdf',
  statusNote:
    'A downloadable PDF resume is currently being prepared and will be activated here soon. In the meantime, recruiters and hiring teams can request a copy directly via email.',
};

export const CONTACT_DATA = {
  fullName: 'Vignesh',
  email: 'vigneshsivan2001@gmail.com',
  githubUrl: 'https://github.com/vickieeee',
  githubHandle: 'github.com/vickieeee',
  linkedinUrl: 'https://www.linkedin.com/in/vignesh-t-825165274',
  linkedinLabel: 'linkedin.com/in/vignesh-t-825165274',
  location: 'Coimbatore, Tamil Nadu, India.',
  message:
    "I'm always interested in connecting with people, exploring new technologies, and discussing opportunities to build meaningful digital solutions.",
};
