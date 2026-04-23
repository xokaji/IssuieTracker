import clsx from 'clsx'

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export default function BrandLogo({ size = 'md', showText = true, className }: BrandLogoProps) {
  const markSize = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }[size]

  const titleSize = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }[size]

  const subtitleSize = {
    sm: 'text-[10px]',
    md: 'text-[11px]',
    lg: 'text-xs',
  }[size]

  return (
    <div className={clsx('inline-flex items-center gap-3', className)}>
      <div className={clsx('relative overflow-hidden rounded-2xl ring-1 ring-brand-200', markSize)}>
        <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label="IssueFlow logo">
          <defs>
            <linearGradient id="issueflow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#156bc6" />
              <stop offset="100%" stopColor="#1f94c1" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="100" height="100" rx="20" fill="url(#issueflow-grad)" />
          <path d="M24 24h14v52H24z" fill="#ffffff" fillOpacity="0.95" />
          <path d="M45 24h31v12H57v13h17v12H57v15H45z" fill="#ffffff" fillOpacity="0.95" />
          <circle cx="76" cy="76" r="7.5" fill="#dff3fa" />
        </svg>
      </div>

      {showText && (
        <div>
          <p className={clsx('font-extrabold tracking-tight text-slate-900', titleSize)}>IssueFlow</p>
          <p className={clsx('text-slate-500', subtitleSize)}>Simple issue tracking</p>
        </div>
      )}
    </div>
  )
}
