export default function SectionEyebrow({ children, className = '' }) {
  return (
    <p className={`mb-3 text-sm uppercase tracking-[0.25em] text-accent ${className}`}>
      {children}
    </p>
  )
}