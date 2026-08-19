import { useRef, useEffect } from 'react'

export default function RevelationScroll({ children, delay = 0, className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('revele')
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revele')
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const style = delay ? { transitionDelay: `${delay}ms` } : undefined

  return (
    <div ref={ref} className={`scroll-reveal ${className}`} style={style}>
      {children}
    </div>
  )
}
