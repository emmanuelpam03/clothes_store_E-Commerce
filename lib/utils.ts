// Utility functions
// Note: If using Tailwind CSS with class merging, install clsx and tailwind-merge:
// npm install clsx tailwind-merge

export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(" ");
}
