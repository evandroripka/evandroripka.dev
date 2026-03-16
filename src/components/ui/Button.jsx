export default function Button({
  children,
  variant = 'primary',
  as: Component = 'button',
  href,
  className = '',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 ease-out will-change-transform hover:-translate-y-[1px] active:translate-y-0'

  const variants = {
    primary:
      'bg-accent text-black shadow-glow hover:bg-accent-hover hover:shadow-[0_0_50px_rgba(34,211,238,0.22)]',
    secondary:
      'border border-border text-text-primary hover:border-border-strong hover:bg-white/5',
  }

  return (
    <Component
      href={href}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}