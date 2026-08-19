import { useState, useEffect, useRef } from 'react'

export default function ChargementFluide({ isLoading, squelette, children }) {
  const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [phase, setPhase] = useState(isLoading ? 'chargement' : 'contenu')
  const prev = useRef(isLoading)

  useEffect(() => {
    if (reduit) {
      setPhase(isLoading ? 'chargement' : 'contenu')
      return
    }

    if (isLoading && !prev.current) {
      setPhase('chargement')
    } else if (!isLoading && prev.current) {
      setPhase('transition')
      const id = setTimeout(() => setPhase('contenu'), 350)
      return () => clearTimeout(id)
    }

    prev.current = isLoading
  }, [isLoading, reduit])

  if (phase === 'chargement') {
    return <div className="cf-squelette">{squelette}</div>
  }

  if (phase === 'transition') {
    return (
      <>
        <div className="cf-squelette cf-fondu-sortie">{squelette}</div>
        <div className="cf-contenu cf-fondu-entree">{children}</div>
      </>
    )
  }

  return <div className="cf-contenu">{children}</div>
}
