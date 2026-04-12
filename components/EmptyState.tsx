import Link from 'next/link'

interface EmptyStateProps {
  message: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

export default function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="py-8 text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="mx-auto mb-3 w-8 h-8 text-studio-muted"
        aria-hidden="true"
        focusable="false"
        fill="currentColor"
      >
        {/* Quarter note: filled oval head + stem */}
        <ellipse cx="11" cy="25" rx="6" ry="4.5" />
        <rect x="16.5" y="4" width="2.5" height="21" />
      </svg>
      <p className="text-sm text-studio-muted">{message}</p>
      {action && (
        <div className="mt-3">
          {action.href ? (
            <Link
              href={action.href}
              className="text-sm font-medium text-studio-primary hover:text-studio-gold"
            >
              {action.label}
            </Link>
          ) : action.onClick ? (
            <button
              type="button"
              onClick={action.onClick}
              className="text-sm font-medium text-studio-primary hover:text-studio-gold"
            >
              {action.label}
            </button>
          ) : null}
        </div>
      )}
    </div>
  )
}
