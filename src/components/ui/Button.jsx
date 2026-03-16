export default function Button({
  children,
  variant = 'primary',
  as: Component = 'button',
  href,
  className = '',
}) {
  const base =
    'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition duration-200'

  const variants = {
    primary: 'bg-accent text-black hover:bg-accent-hover',
    secondary: 'border border-border text-text-primary hover:bg-white/5',
  }

  return (
    <Component href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Component>
  )
}