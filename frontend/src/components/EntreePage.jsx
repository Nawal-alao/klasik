import { useState, useEffect } from 'react'

export default function EntreePage({ children }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div className={`entree-douce${visible ? ' entree-douce--visible' : ''}`}>
      {children}
    </div>
  )
}
