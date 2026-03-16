export default function SectionTitle({ children, className = '' }) {
  return (
    <h2 className={`font-display text-3xl font-bold leading-tight md:text-5xl ${className}`}>
      {children}
    </h2>
  )
}