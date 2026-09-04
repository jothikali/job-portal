/**
 * BrandLogo — Job Nest logo + wordmark.
 * Used in every navbar, sidebar, and auth screen.
 *
 * Props:
 *   size   — 'sm' (sidebar / mobile), 'md' (default navbar), 'lg' (hero)
 *   dark   — true = white text (dark backgrounds), false = dark text (light backgrounds)
 */
interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  dark?: boolean;
}

export function BrandLogo({ size = 'md', dark = true }: BrandLogoProps) {
  const imgSize = size === 'sm' ? 'h-7 w-7' : size === 'lg' ? 'h-12 w-12' : 'h-8 w-8';
  const textSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-4xl' : 'text-xl';
  const textColor = dark ? 'text-white' : 'text-[#0F172A]';

  return (
    <div className="flex items-center gap-2.5">
      <img
        src="/icons/job-logo.jpeg"
        alt="Job Nest logo"
        className={`${imgSize} object-contain rounded-xl shadow-sm`}
      />
      <span className={`font-black tracking-tighter ${textSize} ${textColor} whitespace-nowrap`}>
        Job Nest
      </span>
    </div>
  );
}

export default BrandLogo;
