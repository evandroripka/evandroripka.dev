const icons = {
  down: (
    <svg viewBox="0 0 31.479 31.479" aria-hidden="true" focusable="false">
      <path d="M26.485,21.206c0.429-0.444,0.429-1.143,0-1.587c-0.444-0.429-1.159-0.429-1.587,0l-8.047,8.047V1.111C16.851,0.492,16.359,0,15.74,0c-0.619,0-1.127,0.492-1.127,1.111v26.555l-8.031-8.047c-0.444-0.429-1.143-0.429-1.587,0c-0.429,0.444-0.429,1.143,0,1.587l9.952,9.952c0.429,0.429,1.143,0.429,1.587,0L26.485,21.206z" />
    </svg>
  ),
  right: (
    <svg viewBox="0 0 512 512" aria-hidden="true" focusable="false">
      <path d="m507.313 267.313-142.99 142.993a16 16 0 0 1 -22.623-22.627l115.673-115.679h-441.373a16 16 0 0 1 0-32h441.373l-115.673-115.679a16 16 0 0 1 22.627-22.627l142.99 142.993a16 16 0 0 1 -.004 22.626z" />
    </svg>
  ),
}

export default function Button({ children, href, icon, className = '', ...props }) {
  const classes = ['pp-button', className].filter(Boolean).join(' ')

  return (
    <a className={classes} href={href} {...props}>
      <span className="pp-button-content pp-glitch-hover">
        <span>{children}</span>
        {icon ? icons[icon] : null}
      </span>
    </a>
  )
}
