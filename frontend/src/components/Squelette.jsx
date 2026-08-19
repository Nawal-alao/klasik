export default function Squelette({
  largeur = '100%',
  hauteur = 16,
  arrondi = 'var(--rayon-petit)',
  style,
  className = '',
}) {
  return (
    <div
      className={`squelette ${className}`}
      style={{ width: largeur, height: hauteur, borderRadius: arrondi, ...style }}
      aria-hidden="true"
    />
  )
}
