import { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { ArrowDown } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export function HeroSection() {
  const { profile } = usePortfolio();
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 30,
    mass: 0.25,
  });

  // Smoothly enter as the 3D Hero fades out above, stay crisp in view, then fade out into Projects
  const contentOpacity = useTransform(
    smoothProgress,
    [0, 0.22, 0.72, 0.96],
    [0.15, 1, 1, 0.1]
  );
  const contentY = useTransform(
    smoothProgress,
    [0, 0.22, 0.78, 0.96],
    [28, 0, 0, -32]
  );

  return (
    <section
      id="intro"
      ref={sectionRef}
      aria-labelledby="intro-heading"
      className="relative flex min-h-[calc(100svh-4rem)] w-full scroll-mt-16 flex-col justify-between border-b border-[#4A4B52]/55 bg-[#121216] px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <motion.div
        style={
          prefersReducedMotion
            ? undefined
            : { opacity: contentOpacity, y: contentY }
        }
        className="mx-auto my-auto w-full max-w-6xl"
      >
        <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Primary Identity Column */}
          <div className="lg:col-span-8">
            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="font-mono text-xs font-medium tracking-[0.22em] text-[#C8FF2E] uppercase sm:text-sm"
            >
              {profile.role}
            </motion.p>

            <motion.h2
              id="intro-heading"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.65, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 font-[var(--font-display)] text-[clamp(2.8rem,8.4vw,6.4rem)] font-extrabold leading-[0.95] tracking-[-0.03em] text-[#F4F4F6] uppercase"
              style={{ textWrap: 'balance' }}
            >
              {profile.name}
            </motion.h2>

            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm font-medium tracking-[0.06em] text-[#9A9BA5] sm:text-base"
            >
              {profile.tagline.map((item, idx) => (
                <span key={`${item}-${idx}`} className="inline-flex items-center gap-3">
                  <span>{item}</span>
                  {idx < profile.tagline.length - 1 && (
                    <span aria-hidden="true" className="text-[#4A4B52]">
                      |
                    </span>
                  )}
                </span>
              ))}
            </motion.div>

            {/* Hairline architectural divider */}
            <div className="my-8 h-px w-full max-w-2xl bg-[#4A4B52]/65" />

            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.65, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl text-base leading-[1.75] text-[#B8B9C2] sm:text-lg lg:text-xl"
            >
              {profile.introductionPrefix}
              <span className="font-medium text-[#C8FF2E]">
                {profile.introductionHighlight1}
              </span>
              {profile.introductionMid}
              <span className="font-medium text-[#F4F4F6]">
                {profile.introductionHighlight2}
              </span>
              {profile.introductionMid2}
              <span className="font-medium text-[#C8FF2E]">
                {profile.introductionHighlight3}
              </span>
              {profile.introductionSuffix}
            </motion.p>

            {/* Primary navigation actions */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <a
                href="#projects"
                className="inline-flex items-center justify-center border border-[#C8FF2E] bg-[#C8FF2E] px-6 py-3 text-xs font-semibold tracking-[0.1em] text-[#121216] uppercase transition-colors duration-150 hover:bg-transparent hover:text-[#C8FF2E] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8FF2E]"
              >
                View Selected Projects
              </a>
              <a
                href="#contact"
                className="inline-flex items-center justify-center border border-[#4A4B52] bg-transparent px-6 py-3 text-xs font-semibold tracking-[0.1em] text-[#F4F4F6] uppercase transition-colors duration-150 hover:border-[#C8FF2E] hover:text-[#C8FF2E] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8FF2E]"
              >
                Get in Touch
              </a>
            </motion.div>
          </div>

          {/* Right Editorial Summary Index Box (Brutalist minimal outline) */}
          <motion.aside
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            aria-label="Profile quick overview"
            className="border border-[#4A4B52]/75 bg-[#121216] p-6 lg:col-span-4"
          >
            <div className="flex items-center justify-between border-b border-[#4A4B52]/55 pb-3.5">
              <span className="font-mono text-xs tracking-[0.16em] text-[#9A9BA5] uppercase">
                Profile Brief
              </span>
              <span className="font-mono text-xs font-semibold text-[#C8FF2E] tabular-nums">
                {profile.educationYear} BE CSE
              </span>
            </div>

            <dl className="mt-4 space-y-3.5 text-sm">
              <div className="flex items-baseline justify-between gap-4 border-b border-[#4A4B52]/35 pb-3">
                <dt className="text-[#8E909A]">Focus</dt>
                <dd className="text-right font-medium text-[#F4F4F6]">
                  {profile.focus}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-[#4A4B52]/35 pb-3">
                <dt className="text-[#8E909A]">Experience</dt>
                <dd className="text-right font-medium text-[#F4F4F6]">
                  {profile.experienceSummary}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-[#4A4B52]/35 pb-3">
                <dt className="text-[#8E909A]">Location</dt>
                <dd className="text-right font-medium text-[#F4F4F6]">
                  {profile.shortLocation}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[#8E909A]">Availability</dt>
                <dd className="text-right font-medium text-[#C8FF2E]">
                  {profile.availability}
                </dd>
              </div>
            </dl>
          </motion.aside>
        </div>
      </motion.div>

      {/* Subtle Scroll Indicator */}
      <div className="mx-auto mt-10 flex w-full max-w-6xl items-center justify-between pt-4">
        <a
          href="#projects"
          className="group inline-flex items-center gap-3 font-mono text-xs tracking-[0.18em] text-[#8E909A] uppercase transition-colors hover:text-[#C8FF2E] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C8FF2E]"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center border border-[#4A4B52] transition-colors group-hover:border-[#C8FF2E]">
            <ArrowDown
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-y-0.5"
              aria-hidden="true"
            />
          </span>
          <span>Scroll to Selected Projects</span>
        </a>

        <span className="hidden font-mono text-xs tracking-[0.14em] text-[#4A4B52] uppercase sm:inline">
          01 — 05
        </span>
      </div>
    </section>
  );
}
