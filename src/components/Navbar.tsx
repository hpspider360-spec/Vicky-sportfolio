import { useState } from 'react';
import { Menu, ShieldCheck, X } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

const NAV_LINKS = [
  { label: 'Projects', href: '#projects' },
  { label: 'Education', href: '#education' },
  { label: 'Skills', href: '#skills' },
  { label: 'Experience', href: '#experience' },
] as const;

interface NavbarProps {
  adminLinkUnlocked: boolean;
  onOpenAdmin: () => void;
}

export function Navbar({ adminLinkUnlocked, onOpenAdmin }: NavbarProps) {
  const { profile, isOwnerAdmin } = usePortfolio();
  const [mobileOpen, setMobileOpen] = useState(false);

  const showOwnerLink = adminLinkUnlocked || isOwnerAdmin;

  return (
    <header className="sticky top-0 z-40 w-full transform-gpu border-b border-[#4A4B52]/55 bg-[#121216]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single-line brand wordmark */}
        <a
          href="#top"
          className="font-[var(--font-display)] text-base font-bold tracking-[0.08em] text-[#F4F4F6] uppercase transition-colors hover:text-[#C8FF2E] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C8FF2E]"
        >
          {profile.fullName || profile.name}
        </a>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#B4B5BE]"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative py-1 transition-colors hover:text-[#C8FF2E] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C8FF2E]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Single primary action (+ discreet Admin button ONLY once unlocked/authenticated) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {showOwnerLink && (
            <button
              type="button"
              onClick={onOpenAdmin}
              aria-label="Open Owner Admin Portal"
              className="inline-flex items-center gap-1.5 border border-[#4A4B52] bg-transparent px-3 py-2 font-mono text-[11px] font-medium tracking-[0.08em] text-[#C8FF2E] uppercase transition-colors hover:border-[#C8FF2E] whitespace-nowrap shrink-0"
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          <a
            href="#contact"
            className="hidden sm:inline-flex items-center justify-center border border-[#C8FF2E] bg-[#C8FF2E] px-4 py-2 text-xs font-semibold tracking-[0.08em] text-[#121216] uppercase transition-colors duration-150 hover:bg-transparent hover:text-[#C8FF2E] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8FF2E]"
          >
            Contact
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-menu"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex h-10 w-10 items-center justify-center border border-[#4A4B52] text-[#F4F4F6] transition-colors hover:border-[#C8FF2E] hover:text-[#C8FF2E] md:hidden focus-visible:outline-2 focus-visible:outline-[#C8FF2E]"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile navigation panel */}
      {mobileOpen && (
        <nav
          id="mobile-nav-menu"
          aria-label="Mobile navigation"
          className="border-t border-[#4A4B52]/55 bg-[#121216] px-4 py-4 md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2.5 text-sm font-medium text-[#D2D3DB] transition-colors hover:text-[#C8FF2E]"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <a
                href="#contact"
                onClick={() => setMobileOpen(false)}
                className="inline-flex w-full items-center justify-center border border-[#C8FF2E] bg-[#C8FF2E] px-4 py-2.5 text-xs font-semibold tracking-[0.08em] text-[#121216] uppercase transition-colors hover:bg-transparent hover:text-[#C8FF2E]"
              >
                Contact
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
