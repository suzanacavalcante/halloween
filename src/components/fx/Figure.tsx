/* Silhueta humana alta demais, braços longos demais. De longe, na
   névoa, parece uma pessoa. Parece. */
export function Figure({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 200" className={className} aria-hidden="true">
      <ellipse cx="30" cy="14" rx="8.5" ry="11" />
      <path d="M25 23 L35 23 L37 30 C45 32 49 38 50 48 L53 102 L51 124 L48 124 L46 72 L44 96 L42 197 L34 197 L31 120 L29 120 L26 197 L18 197 L16 96 L14 72 L12 124 L9 124 L7 102 L10 48 C11 38 15 32 23 30Z" />
    </svg>
  );
}
