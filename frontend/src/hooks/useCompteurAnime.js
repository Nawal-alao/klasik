import { useState, useEffect, useRef } from 'react'

function reductionMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function useCompteurAnime(cible, duree = 1100) {
  const [valeur, setValeur] = useState(reductionMotion() ? cible : 0)
  const prevRef = useRef(cible)
  const rafRef = useRef(null)

  useEffect(() => {
    if (reductionMotion()) {
      setValeur(cible)
      prevRef.current = cible
      return
    }

    const depart = prevRef.current
    const fin = cible
    if (depart === fin) return

    const distance = fin - depart
    const t0 = performance.now()

    function easeOut(t) {
      return 1 - Math.pow(1 - t, 3)
    }

    function animer(now) {
      const elapsed = now - t0
      const t = Math.min(elapsed / duree, 1)
      const courbe = easeOut(t)
      setValeur(Math.round(depart + distance * courbe))
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animer)
      } else {
        prevRef.current = fin
      }
    }

    rafRef.current = requestAnimationFrame(animer)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [cible, duree])

  return valeur
}
