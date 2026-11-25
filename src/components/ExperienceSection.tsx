import { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { Building2, Briefcase, Clock, Layers } from 'lucide-react';
import type { ExperienceItem } from '../data/portfolioData';
import { usePortfolio } from '../context/PortfolioContext';

function ExperienceCard({
  item,
  index,
}: {
  item: ExperienceItem;
  index: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.article
      initial={prefersReducedMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{
        duration: 0.55,
        delay: prefersReducedMotion ? 0 : index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="relative pl-10 sm:pl-14"
    >
      {/* Outlined Timeline Node */}
      <div
        aria-hidden="true"
        className="absolute top-6 left-0 z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#C8FF2E] bg-[#121216] font-mono text-[10px] font-semibold text-[#C8FF2E] tabular-nums sm:h-9 sm:w-9 sm:text-xs"
      >
        {item.index}
      </div>

      {/* Main Outlined Card */}
      <div className="border border-[#4A4B52] bg-[#121216] transition-colors duration-200 hover:border-[#C8FF2E]">
        {/* Top Bar: Role & Duration */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#4A4B52]/60 bg-[#16161B] px-5 py-5 sm:flex-row sm:items-start sm:px-8 sm:py-6">
          <div className="min-w-0">
            <p className="font-mono text-[11px] font-medium tracking-[0.18em] text-[#C8FF2E] uppercase">
              Role
            </p>
            <h3 className="mt-1.5 font-[var(--font-display)] text-2xl font-bold tracking-[-0.015em] text-[#F4F4F6] sm:text-3xl">
              {item.jobTitle}
            </h3>
            <p className="mt-2 flex items-center gap-2 text-sm font-medium text-[#D2D3DC] sm:text-base">
              <Building2 className="h-4 w-4 shrink-0 text-[#C8FF2E]" aria-hidden="true" />
              <span>{item.company}</span>
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 self-start border border-[#C8FF2E]/70 bg-[#121216] px-3.5 py-2 font-mono text-xs font-semibold tracking-[0.12em] text-[#C8FF2E] uppercase tabular-nums">
            <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{item.duration}</span>
          </div>
        </div>

        {/* Verified Metadata Strip */}
        <dl className="grid grid-cols-1 divide-y divide-[#4A4B52]/50 border-b border-[#4A4B52]/60 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <div className="px-5 py-4 sm:px-8">
            <dt className="flex items-center gap-2 font-mono text-[11px] tracking-[0.16em] text-[#8E909A] uppercase">
              <Layers className="h-3.5 w-3.5 text-[#C8FF2E]" aria-hidden="true" />
              Process / Department
            </dt>
            <dd className="mt-1.5 text-sm font-semibold text-[#F4F4F6] sm:text-base">
              {item.department}
            </dd>
          </div>

          <div className="px-5 py-4 sm:px-8">
            <dt className="flex items-center gap-2 font-mono text-[11px] tracking-[0.16em] text-[#8E909A] uppercase">
              <Briefcase className="h-3.5 w-3.5 text-[#C8FF2E]" aria-hidden="true" />
              Industry
            </dt>
            <dd className="mt-1.5 text-sm font-semibold text-[#F4F4F6] sm:text-base">
              {item.industry}
            </dd>
          </div>
        </dl>

        {/* Key Responsibilities */}
        {item.responsibilities.length > 0 && (
          <div className="px-5 py-6 sm:px-8 sm:py-7">
            <h4 className="font-mono text-[11px] font-semibold tracking-[0.18em] text-[#9A9BA5] uppercase">
              Key Responsibilities
            </h4>
            <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-x-8 md:gap-y-3.5">
              {item.responsibilities.map((responsibility, rIndex) => (
                <li
                  key={`${responsibility}-${rIndex}`}
                  className="flex items-start gap-3 text-sm leading-relaxed text-[#D8D9E0] sm:text-[15px]"
                >
                  <span className="mt-1 font-mono text-[11px] font-semibold text-[#C8FF2E] tabular-nums shrink-0">
                    {String(rIndex + 1).padStart(2, '0')}
                  </span>
                  <span>{responsibility}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.article>
  );
}

export function ExperienceSection() {
  const { experiences } = usePortfolio();
  const timelineRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 85%', 'end 60%'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    mass: 0.25,
  });

  const lineScale = useTransform(smoothProgress, [0, 1], [0, 1]);

  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="w-full scroll-mt-16 border-b border-[#4A4B52]/55 bg-[#121216] px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.25 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="border-b border-[#4A4B52]/60 pb-8"
        >
          <h2
            id="experience-heading"
            className="font-[var(--font-display)] text-3xl font-bold tracking-[-0.02em] text-[#F4F4F6] uppercase sm:text-4xl lg:text-5xl"
          >
            <span className="text-[#C8FF2E] tabular-nums">04.</span> PROFESSIONAL EXPERIENCE
          </h2>
          <p className="mt-3 font-mono text-xs tracking-[0.16em] text-[#9A9BA5] uppercase sm:text-sm">
            VERIFIED WORK HISTORY AND OPERATIONAL RESPONSIBILITIES.
          </p>
        </motion.div>

        {/* Timeline Wrapper */}
        <div ref={timelineRef} className="relative mt-12">
          {experiences.length === 0 ? (
            <div className="border border-[#4A4B52]/70 bg-[#16161B] p-8 text-center font-mono text-xs tracking-[0.12em] text-[#9A9BA5] uppercase">
              Experience records are currently being updated.
            </div>
          ) : (
            <>
              {/* Vertical Connecting Line */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-7 bottom-6 left-3.5 w-px bg-[#4A4B52]/60 sm:left-[17px]"
              >
                <motion.div
                  style={
                    prefersReducedMotion
                      ? { scaleY: 1 }
                      : { scaleY: lineScale }
                  }
                  className="h-full w-full origin-top bg-[#C8FF2E]"
                />
              </div>

              <div className="space-y-8">
                {experiences.map((item, index) => (
                  <ExperienceCard key={item.id} item={item} index={index} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
