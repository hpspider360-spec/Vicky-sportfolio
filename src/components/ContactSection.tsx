import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowUp,
  ArrowUpRight,
  Github,
  Linkedin,
  Mail,
  MapPin,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { ResumeCard } from './ResumeCard';

export function ContactSection() {
  const { profile } = usePortfolio();
  const prefersReducedMotion = useReducedMotion();

  const iconLinks = [
    profile.contactEmail
      ? {
          id: 'email',
          label: 'Email',
          ariaLabel: `Send email to ${profile.fullName || profile.name}`,
          href: `mailto:${profile.contactEmail}`,
          external: false,
          icon: Mail,
        }
      : null,
    profile.githubUrl
      ? {
          id: 'github',
          label: 'GitHub',
          ariaLabel: `Open ${profile.fullName || profile.name} GitHub profile`,
          href: profile.githubUrl,
          external: true,
          icon: Github,
        }
      : null,
    profile.linkedinUrl
      ? {
          id: 'linkedin',
          label: 'LinkedIn',
          ariaLabel: `Open ${profile.fullName || profile.name} LinkedIn profile`,
          href: profile.linkedinUrl,
          external: true,
          icon: Linkedin,
        }
      : null,
  ].filter(Boolean) as {
    id: string;
    label: string;
    ariaLabel: string;
    href: string;
    external: boolean;
    icon: typeof Mail;
  }[];

  return (
    <footer
      id="contact"
      aria-labelledby="contact-heading"
      className="w-full scroll-mt-16 bg-[#121216] px-4 pt-20 pb-12 sm:px-6 sm:pt-28 sm:pb-16 lg:px-8"
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
            id="contact-heading"
            className="font-[var(--font-display)] text-3xl font-bold tracking-[-0.02em] text-[#F4F4F6] uppercase sm:text-4xl lg:text-5xl"
          >
            <span className="text-[#C8FF2E] tabular-nums">05.</span> LET&apos;S CONNECT.
          </h2>
          <p className="mt-3 font-mono text-xs tracking-[0.16em] text-[#9A9BA5] uppercase sm:text-sm">
            OPEN TO OPPORTUNITIES AND NEW CHALLENGES.
          </p>
        </motion.div>

        {/* Editorial Contact Layout */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left Column: Message + Clean Icon Hyperlinks (No Raw URLs Displayed) */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-between lg:col-span-7"
          >
            <div>
              <p className="font-[var(--font-display)] text-xl leading-relaxed font-medium text-[#E4E5EC] sm:text-2xl">
                {profile.contactMessage}
              </p>

              {/* Icon-Only Hyperlink Tiles */}
              <div className="mt-8">
                <p className="font-mono text-[11px] tracking-[0.16em] text-[#8E909A] uppercase">
                  Direct Links
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  {iconLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.id}
                        href={item.href}
                        target={item.external ? '_blank' : undefined}
                        rel={item.external ? 'noopener noreferrer' : undefined}
                        aria-label={item.ariaLabel}
                        title={item.label}
                        className="group inline-flex items-center gap-3 border border-[#4A4B52] bg-[#16161B] px-5 py-4 text-[#F4F4F6] transition-colors duration-200 hover:border-[#C8FF2E] hover:text-[#C8FF2E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8FF2E]"
                      >
                        <Icon
                          className="h-5 w-5 shrink-0 text-[#C8FF2E]"
                          aria-hidden="true"
                        />
                        <span className="font-mono text-xs font-semibold tracking-[0.14em] uppercase">
                          {item.label}
                        </span>
                        <ArrowUpRight
                          className="h-3.5 w-3.5 text-[#8E909A] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#C8FF2E]"
                          aria-hidden="true"
                        />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Location Row */}
              <div className="mt-8 border-t border-[#4A4B52]/55 pt-5">
                <span className="font-mono text-[11px] tracking-[0.16em] text-[#8E909A] uppercase">
                  Location
                </span>
                <p className="mt-1.5 flex items-center gap-2 text-base font-medium text-[#D8D9E0]">
                  <MapPin className="h-4 w-4 shrink-0 text-[#C8FF2E]" aria-hidden="true" />
                  <span>{profile.location}</span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Resume Card */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col lg:col-span-5"
          >
            <ResumeCard />
          </motion.div>
        </div>

        {/* Bottom Navigation Bar */}
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-[#4A4B52]/55 pt-8 sm:flex-row sm:items-center">
          <div className="font-mono text-xs tracking-[0.12em] text-[#8E909A] uppercase">
            <span>
              © {new Date().getFullYear()} {profile.fullName || profile.name}
            </span>
            <span className="mx-2 text-[#4A4B52]">·</span>
            <span>{profile.role}</span>
          </div>

          <a
            href="#top"
            className="inline-flex items-center gap-2 font-mono text-xs font-medium tracking-[0.14em] text-[#B8B9C2] uppercase transition-colors duration-200 hover:text-[#C8FF2E]"
          >
            <span>Back to Top</span>
            <ArrowUp className="h-3.5 w-3.5 text-[#C8FF2E]" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
