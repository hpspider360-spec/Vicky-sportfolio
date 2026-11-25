import { useEffect, useState } from 'react';
import { Download, ExternalLink, FileText, Mail } from 'lucide-react';
import {
  isSafeHttpOrRelativeUrl,
  usePortfolio,
} from '../context/PortfolioContext';

function base64ToPdfBlobUrl(base64: string): string | null {
  try {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

export function ResumeCard() {
  const { profile, resume } = usePortfolio();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (resume.sourceType === 'upload' && resume.pdfBase64) {
      const nextUrl = base64ToPdfBlobUrl(resume.pdfBase64);
      setBlobUrl(nextUrl);
      return () => {
        if (nextUrl) URL.revokeObjectURL(nextUrl);
      };
    }
    setBlobUrl(null);
    return undefined;
  }, [resume.sourceType, resume.pdfBase64]);

  const safeExternalUrl =
    resume.sourceType === 'url' && isSafeHttpOrRelativeUrl(resume.pdfUrl)
      ? resume.pdfUrl.trim()
      : null;

  const activeHref =
    resume.sourceType === 'upload' ? blobUrl : safeExternalUrl;
  const isAvailable = Boolean(activeHref);

  const requestSubject = encodeURIComponent(
    `Resume Request — ${profile.fullName || profile.name}`
  );

  return (
    <div className="flex flex-col justify-between border border-[#4A4B52] bg-[#16161B] p-6 sm:p-7">
      <div>
        <div className="flex items-center justify-between gap-3 border-b border-[#4A4B52]/55 pb-4">
          <div className="flex items-center gap-2.5">
            <FileText className="h-4 w-4 text-[#C8FF2E]" aria-hidden="true" />
            <span className="font-mono text-xs font-semibold tracking-[0.16em] text-[#F4F4F6] uppercase">
              Resume / CV
            </span>
          </div>
          <span className="font-mono text-[11px] tracking-[0.14em] text-[#C8FF2E] uppercase">
            {isAvailable ? 'PDF Ready' : 'Upon Request'}
          </span>
        </div>

        <h3 className="mt-5 font-[var(--font-display)] text-xl font-bold text-[#F4F4F6]">
          {isAvailable ? 'Download Resume PDF' : 'Resume PDF Coming Soon'}
        </h3>

        <p className="mt-2.5 text-sm leading-relaxed text-[#B8B9C2]">
          {isAvailable
            ? `Download or view a recruiter-ready PDF copy of ${profile.fullName || profile.name}’s education, technical skills, projects, and experience.`
            : resume.statusNote || profile.resumeStatusNote}
        </p>
      </div>

      <div className="mt-6 border-t border-[#4A4B52]/50 pt-5">
        {isAvailable && activeHref ? (
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <a
              href={activeHref}
              download={resume.fileName}
              className="inline-flex flex-1 items-center justify-center gap-2 border border-[#C8FF2E] bg-[#C8FF2E] px-4 py-3 font-mono text-xs font-semibold tracking-[0.12em] text-[#121216] uppercase transition-colors duration-200 hover:bg-transparent hover:text-[#C8FF2E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8FF2E]"
            >
              <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Download PDF</span>
            </a>
            <a
              href={activeHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-[#4A4B52] bg-transparent px-4 py-3 font-mono text-xs font-semibold tracking-[0.12em] text-[#F4F4F6] uppercase transition-colors duration-200 hover:border-[#C8FF2E] hover:text-[#C8FF2E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8FF2E]"
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>View</span>
            </a>
          </div>
        ) : (
          <a
            href={`mailto:${profile.contactEmail}?subject=${requestSubject}`}
            className="inline-flex w-full items-center justify-center gap-2.5 border border-[#C8FF2E] bg-transparent px-5 py-3 font-mono text-xs font-semibold tracking-[0.14em] text-[#C8FF2E] uppercase transition-colors duration-200 hover:bg-[#C8FF2E] hover:text-[#121216] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8FF2E]"
          >
            <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Request Resume via Email</span>
          </a>
        )}
      </div>
    </div>
  );
}
