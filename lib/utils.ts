/** Merge class names, filtering out falsy values. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

/** Format an ISO date string to a human-readable short date. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "No lessons yet"
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
