import { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { usePortfolio } from '../context/PortfolioContext';

export function EducationSection() {
  const { profile, educationMilestones } = usePortfolio();
  const timelineRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 85%', 'end 55%'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    mass: 0.25,
  });

  const lineScale = useTransform(smoothProgress, [0, 1], [0, 1]);

  return (
    <section
      id="education"
      aria-labelledby="education-heading"
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
            id="education-heading"
            className="font-[var(--font-display)] text-3xl font-bold tracking-[-0.02em] text-[#F4F4F6] uppercase sm:text-4xl lg:text-5xl"
          >
            <span className="text-[#C8FF2E] tabular-nums">02.</span> EDUCATION
          </h2>
          <p className="mt-3 font-mono text-xs tracking-[0.16em] text-[#9A9BA5] uppercase sm:text-sm">
            ACADEMIC FOUNDATION IN COMPUTER SCIENCE AND ENGINEERING.
          </p>
        </motion.div>

        {/* Connected Circular / Capsule Academic Timeline */}
        <div ref={timelineRef} className="relative mt-14">
          {/* Desktop Horizontal Connecting Line */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-11 right-[16%] left-[16%] hidden h-px bg-[#4A4B52]/60 lg:block"
          >
            <motion.div
              style={
                prefersReducedMotion
                  ? { scaleX: 1 }
                  : { scaleX: lineScale }
              }
              className="h-full w-full origin-left bg-[#C8FF2E]"
            />
          </div>

          {/* Mobile / Tablet Vertical Connecting Line */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-10 bottom-10 left-8 w-px bg-[#4A4B52]/60 lg:hidden"
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

          {/* Milestones Grid */}
          <ol className="relative grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-8">
            {educationMilestones.map((milestone, index) => (
              <motion.li
                key={milestone.id}
                initial={
                  prefersReducedMotion ? false : { opacity: 0, scale: 0.94, y: 18 }
                }
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: false, amount: 0.25 }}
                transition={{
                  duration: 0.55,
                  delay: prefersReducedMotion ? 0 : index * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative flex items-start gap-5 pl-0 lg:flex-col lg:items-center lg:gap-6 lg:text-center"
              >
                {/* Outlined Circular Milestone Node */}
                <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-[#C8FF2E] bg-[#121216] font-mono text-sm font-semibold text-[#C8FF2E] tabular-nums lg:h-22 lg:w-22 lg:text-base">
                  {milestone.step}
                </div>

                {/* Rounded Capsule-Shaped Academic Information Card */}
                <div className="flex-1 rounded-[28px] border border-[#4A4B52] bg-[#121216] px-6 py-6 transition-colors duration-200 hover:border-[#C8FF2E] lg:w-full lg:px-7 lg:py-7">
                  <p className="font-mono text-[11px] font-medium tracking-[0.18em] text-[#C8FF2E] uppercase">
                    {milestone.label}
                  </p>
                  <h3 className="mt-2.5 font-[var(--font-display)] text-lg font-bold leading-snug text-[#F4F4F6] sm:text-xl">
                    {milestone.value}
                  </h3>
                  <p className="mt-2 text-xs text-[#9A9BA5] sm:text-sm">
                    {milestone.detail}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>

          {/* Compact Consolidated Summary Capsule */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 flex flex-col items-start justify-between gap-4 rounded-3xl border border-[#4A4B52]/70 bg-[#16161B] px-6 py-5 sm:flex-row sm:items-center sm:px-8"
          >
            <div>
              <p className="font-mono text-[11px] tracking-[0.16em] text-[#8E909A] uppercase">
                Verified Academic Record
              </p>
              <p className="mt-1 text-sm font-medium text-[#F4F4F6] sm:text-base">
                {profile.educationDegree} · {profile.educationCollege}
              </p>
            </div>
            <span className="font-mono text-sm font-semibold tracking-[0.1em] text-[#C8FF2E] tabular-nums whitespace-nowrap shrink-0">
              Class of {profile.educationYear}
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
