import { motion, useReducedMotion } from 'motion/react';
import type { SkillCategory } from '../data/portfolioData';
import { usePortfolio } from '../context/PortfolioContext';

function SkillCategoryCard({
  category,
  index,
}: {
  category: SkillCategory;
  index: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.article
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{
        duration: 0.5,
        delay: prefersReducedMotion ? 0 : index * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group flex flex-col border border-[#4A4B52] bg-[#121216] p-6 transition-colors duration-200 hover:border-[#C8FF2E] sm:p-7"
    >
      {/* Category Header */}
      <div className="flex items-baseline justify-between gap-4 border-b border-[#4A4B52]/55 pb-4">
        <h3 className="font-[var(--font-display)] text-lg font-bold tracking-[-0.01em] text-[#F4F4F6] sm:text-xl">
          {category.title}
        </h3>
        <span className="font-mono text-xs font-semibold tracking-[0.14em] text-[#C8FF2E] tabular-nums shrink-0">
          {category.index}
        </span>
      </div>

      {/* Skills List — Clean Brutalist Editorial Rows */}
      <ul className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {category.skills.map((skill) => (
          <li
            key={skill}
            className="flex items-center gap-2.5 border border-[#4A4B52]/45 bg-[#16161B] px-3.5 py-2.5 text-sm font-medium text-[#E4E5EC] transition-colors duration-200 group-hover:border-[#4A4B52] hover:border-[#C8FF2E] hover:text-[#C8FF2E]"
          >
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 bg-[#C8FF2E]"
            />
            <span className="truncate">{skill}</span>
          </li>
        ))}
      </ul>
    </motion.article>
  );
}

export function SkillsSection() {
  const { skills } = usePortfolio();
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
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
            id="skills-heading"
            className="font-[var(--font-display)] text-3xl font-bold tracking-[-0.02em] text-[#F4F4F6] uppercase sm:text-4xl lg:text-5xl"
          >
            <span className="text-[#C8FF2E] tabular-nums">03.</span> TECHNICAL SKILLS
          </h2>
          <p className="mt-3 font-mono text-xs tracking-[0.16em] text-[#9A9BA5] uppercase sm:text-sm">
            CORE TECHNOLOGIES, FRAMEWORKS, AND ENGINEERING TOOLS.
          </p>
        </motion.div>

        {/* Categorized Skills Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {skills.map((category, index) => (
            <SkillCategoryCard
              key={category.id}
              category={category}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
