import React from 'react'

const PALETTE = [
  'var(--couleur-accent-doux)',
  '#D6E8F0',
  '#D4EDDA',
  '#F5E6CC',
  '#E8D5E8',
  '#F0E0D0',
]

const PALETTE_TEXT = [
  'var(--couleur-accent)',
  'var(--couleur-info)',
  'var(--couleur-succes)',
  '#8B6914',
  '#7B4B7B',
  '#8B6914',
]

function hashCode(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function extraireInitiales(prenom, nom) {
  const p = (prenom || '').trim().charAt(0)
  const n = (nom || '').trim().charAt(0)
  return (p + n).toUpperCase() || '?'
}

export default function AvatarInitiales({ prenom, nom, taille = 48, src, className = '', role }) {
  const cle = `${prenom || ''}${nom || ''}`
  const idx = hashCode(cle) % PALETTE.length
  const initiales = extraireInitiales(prenom, nom)

  let bg = PALETTE[idx]
  let fg = PALETTE_TEXT[idx]

  if (role === 'eleve') {
    bg = 'rgba(75, 123, 90, 0.12)'
    fg = 'var(--couleur-succes)'
  } else if (role === 'mentor') {
    bg = 'var(--couleur-accent-doux)'
    fg = 'var(--couleur-accent)'
  }

  if (src) {
    return (
      <img
        src={src}
        alt={`${prenom || ''} ${nom || ''}`}
        className={`avatar-initiales ${className}`}
        style={{ width: taille, height: taille }}
      />
    )
  }

  return (
    <div
      className={`avatar-initiales ${className}`}
      style={{
        width: taille,
        height: taille,
        borderRadius: '50%',
        background: bg,
        color: fg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: taille * 0.36,
        lineHeight: 1,
        flexShrink: 0,
        userSelect: 'none',
      }}
      aria-hidden="true"
    >
      {initiales}
    </div>
  )
}
