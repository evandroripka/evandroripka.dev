import { forwardRef } from 'react'

const Container = forwardRef(function Container({ children, className = '', ...props }, ref) {
  return (
    <div ref={ref} className={['pp-container', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  )
})

export default Container
