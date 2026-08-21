import { useRef, useEffect } from 'react'
import DOMPurify from 'dompurify'
import renderMathInElement from 'katex/contrib/auto-render'

function extraireScripts(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const scriptTags = doc.querySelectorAll('script')
  const scriptsData = []

  scriptTags.forEach(s => {
    const srcAttr = s.getAttribute('src')
    if (srcAttr) {
      scriptsData.push({ src: srcAttr, type: s.getAttribute('type') || null })
    } else {
      scriptsData.push({ code: s.textContent })
    }
    s.remove()
  })

  return { cleanHtml: doc.body.innerHTML, scripts: scriptsData }
}

function injecterScriptsSequentiellement(container, scripts, index = 0) {
  if (index >= scripts.length) return

  const info = scripts[index]

  if (info.src) {
    const s = document.createElement('script')
    s.src = info.src
    if (info.type) s.type = info.type
    s.onload = () => {
      injecterScriptsSequentiellement(container, scripts, index + 1)
    }
    s.onerror = () => {
      console.error(`Échec du chargement du script: ${info.src}`)
      injecterScriptsSequentiellement(container, scripts, index + 1)
    }
    container.appendChild(s)
  } else {
    const s = document.createElement('script')
    s.textContent = info.code
    container.appendChild(s)
    injecterScriptsSequentiellement(container, scripts, index + 1)
  }
}

export default function ContenuRiche({ contenu, className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current || !contenu) return

    const { cleanHtml, scripts } = extraireScripts(contenu)
    // Sécurisé par construction : ce composant n'affiche que du
    // contenu de Sequence, rédigé exclusivement par l'admin via
    // CKEditor 5 (config contenu_interactif), jamais par un élève
    // ou une entrée utilisateur. Ne jamais réutiliser cette
    // configuration DOMPurify élargie pour afficher du contenu
    // provenant d'une source non fiable (messages, profils, tout
    // champ modifiable par un élève ou un mentor).
    ref.current.innerHTML = DOMPurify.sanitize(cleanHtml, {
      ADD_TAGS: ['script', 'iframe', 'canvas'],
      ADD_ATTR: ['src', 'allow', 'allowfullscreen', 'frameborder', 'width', 'height'],
    })

    if (scripts.length > 0) {
      injecterScriptsSequentiellement(ref.current, scripts, 0)
    }

    renderMathInElement(ref.current, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true },
      ],
      throwOnError: false,
    })

    return () => {
      if (ref.current) ref.current.innerHTML = ''
    }
  }, [contenu])

  return <div ref={ref} className={`contenu-overflow ${className}`} />
}
