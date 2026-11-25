import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, Github } from 'lucide-react';
import type { ProjectItem, ProjectStatus } from '../data/portfolioData';
import { usePortfolio } from '../context/PortfolioContext';

type FilterOption = 'All' | ProjectStatus;

const FILTER_OPTIONS: FilterOption[] = [
  'All',
  'Live',
  'In Development',
  'Academic Project',
];

function ProjectPreviewPlate({
  project,
  ownerName,
}: {
  project: ProjectItem;
  ownerName: string;
}) {
  if (project.imageUrl) {
    return (
      <div className="relative h-32 w-full overflow-hidden border-b border-[#4A4B52]/65 bg-[#121216] sm:h-36">
        <img
          src={project.imageUrl}
          alt={`${project.title} preview`}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  // Compact architectural cover plate (never a fabricated fake screenshot)
  return (
    <div
      aria-hidden="true"
      className="relative flex h-32 w-full flex-col justify-between overflow-hidden border-b border-[#4A4B52]/65 bg-[#16161B] p-4 sm:h-36"
    >
      {/* Subtle architectural hairline frame */}
      <div className="pointer-events-none absolute inset-2.5 border border-[#4A4B52]/30" />

      <div className="relative flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.16em] text-[#9A9BA5] uppercase">
          Project {project.number}
        </span>
        <span
          className={`font-mono text-[10px] font-medium tracking-[0.14em] uppercase ${
            project.status === 'Live' ? 'text-[#C8FF2E]' : 'text-[#9A9BA5]'
          }`}
        >
          {project.status}
        </span>
      </div>

      <div className="relative my-auto py-1">
        <div className="flex items-end justify-between gap-3">
          <span className="font-[var(--font-display)] text-3xl font-extrabold leading-none tracking-[-0.04em] text-[#F4F4F6]/90 tabular-nums">
            {project.number}
          </span>
          <div className="mb-1 h-px flex-1 bg-[#4A4B52]/60" />
          <div className="mb-0.5 h-2 w-2 border border-[#C8FF2E]" />
        </div>
        <p className="mt-2 truncate font-mono text-[10px] tracking-[0.12em] text-[#8E909A] uppercase">
          {project.category}
        </p>
      </div>

      <div className="relative flex items-center justify-between font-mono text-[10px] text-[#6E707A] uppercase">
        <span>{project.liveUrl ? 'LIVE DEPLOYMENT' : 'PORTFOLIO RECORD'}</span>
        <span>{ownerName}</span>
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  index,
  ownerName,
}: {
  project: ProjectItem;
  index: number;
  ownerName: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  const statusColorClass =
    project.status === 'Live'
      ? 'text-[#C8FF2E]'
      : project.status === 'In Development'
        ? 'text-[#F4F4F6]'
        : 'text-[#9A9BA5]';

  return (
    <motion.article
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96, y: 18 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: false, amount: 0.14 }}
      transition={{
        duration: 0.45,
        delay: prefersReducedMotion ? 0 : (index % 3) * 0.05,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group flex flex-col border border-[#4A4B52]/75 bg-[#121216] transform-gpu transition-colors duration-200 hover:border-[#C8FF2E]"
    >
      <ProjectPreviewPlate project={project} ownerName={ownerName} />

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Card Header: Number · Category · Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
          <div className="flex min-w-0 items-center gap-1.5 text-[#9A9BA5]">
            <span className="font-semibold text-[#C8FF2E] tabular-nums shrink-0">
              {project.number}
            </span>
            <span aria-hidden="true" className="text-[#4A4B52] shrink-0">
              /
            </span>
            <span className="truncate uppercase tracking-[0.06em]">
              {project.category}
            </span>
          </div>

          <span className={`font-medium tracking-[0.08em] uppercase shrink-0 ${statusColorClass}`}>
            {project.status}
          </span>
        </div>

        {/* Project Title */}
        <h3 className="mt-2.5 font-[var(--font-display)] text-lg font-bold tracking-[-0.015em] text-[#F4F4F6] sm:text-xl">
          {project.title}
        </h3>

        {/* Description */}
        <p className="mt-2 text-[13px] leading-[1.6] text-[#B8B9C2] sm:text-sm">
          {project.description}
        </p>

        {/* Contribution */}
        <div className="mt-3.5 border-t border-[#4A4B52]/45 pt-3">
          <p className="font-mono text-[10px] font-medium tracking-[0.14em] text-[#8E909A] uppercase">
            My Contribution
          </p>
          <p className="mt-1 text-[13px] leading-[1.55] text-[#D2D3DB]">
            {project.contribution}
          </p>
        </div>

        {/* Verified Technologies */}
        <div className="mt-3 border-t border-[#4A4B52]/45 pt-3">
          <p className="font-mono text-[10px] font-medium tracking-[0.14em] text-[#8E909A] uppercase">
            Technologies
          </p>
          {project.technologies.length > 0 ? (
            <p className="mt-1 font-mono text-[11px] leading-[1.7] text-[#F4F4F6]">
              {project.technologies.join(' · ')}
            </p>
          ) : (
            <p className="mt-1 text-[12px] text-[#8E909A]">
              Verified stack details available on discussion.
            </p>
          )}
        </div>

        {/* Footer Links (only rendered when real links exist) */}
        {(project.liveUrl || project.githubUrl) && (
          <div className="mt-auto flex flex-wrap items-center gap-4 border-t border-[#4A4B52]/45 pt-3.5">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-[0.1em] text-[#C8FF2E] uppercase transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C8FF2E]"
              >
                <span>Visit Live Website</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium tracking-[0.1em] text-[#D2D3DB] uppercase transition-colors hover:text-[#C8FF2E] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C8FF2E]"
              >
                <Github className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Source Code</span>
              </a>
            )}
          </div>
        )}
      </div>
    </motion.article>
  );
}

export function ProjectsSection() {
  const { projects, profile } = usePortfolio();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('All');
  const prefersReducedMotion = useReducedMotion();

  const visibleProjects =
    activeFilter === 'All'
      ? projects
      : projects.filter((p) => p.status === activeFilter);

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="w-full scroll-mt-16 border-b border-[#4A4B52]/55 bg-[#121216] px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.25 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col justify-between gap-6 border-b border-[#4A4B52]/60 pb-7 md:flex-row md:items-end"
        >
          <div>
            <h2
              id="projects-heading"
              className="font-[var(--font-display)] text-3xl font-bold tracking-[-0.02em] text-[#F4F4F6] uppercase sm:text-4xl lg:text-5xl"
            >
              <span className="text-[#C8FF2E] tabular-nums">01.</span> SELECTED PROJECTS
            </h2>
            <p className="mt-3 font-mono text-xs tracking-[0.16em] text-[#9A9BA5] uppercase sm:text-sm">
              A COLLECTION OF MY ACADEMIC AND DEVELOPMENT WORK.
            </p>
          </div>

          {/* Interactive Status Filter Controls */}
          <div
            role="group"
            aria-label="Filter projects by status"
            className="flex flex-wrap items-center gap-1.5"
          >
            {FILTER_OPTIONS.map((option) => {
              const selected = activeFilter === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setActiveFilter(option)}
                  aria-pressed={selected}
                  className={`border px-3 py-1.5 font-mono text-xs font-medium tracking-[0.06em] transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8FF2E] ${
                    selected
                      ? 'border-[#C8FF2E] bg-[#C8FF2E] text-[#121216]'
                      : 'border-[#4A4B52]/80 bg-transparent text-[#B8B9C2] hover:border-[#C8FF2E] hover:text-[#F4F4F6]'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Compact 3-Column Responsive Project Cards Grid */}
        {visibleProjects.length === 0 ? (
          <div className="mt-10 border border-[#4A4B52]/70 bg-[#16161B] p-8 text-center font-mono text-xs tracking-[0.12em] text-[#9A9BA5] uppercase">
            No projects in this category yet.
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                ownerName={profile.name}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
