import Link from 'next/link'

interface BreadcrumbProps {
  href: string
  label: string
}

export default function Breadcrumb({ href, label }: BreadcrumbProps) {
  return (
    <Link
      href={href}
      className="text-sm text-studio-muted hover:text-studio-gold transition-colors duration-[150ms]"
    >
      ← {label}
    </Link>
  )
}
