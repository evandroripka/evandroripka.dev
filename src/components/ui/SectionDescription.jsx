export default function SectionDescription({ children, className = '' }) {
  return (
    <p className={`mt-4 max-w-3xl text-base leading-7 text-text-secondary md:text-lg ${className}`}>
      {children}
    </p>
  )
}