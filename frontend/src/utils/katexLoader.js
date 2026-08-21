let promise = null

export default function loadKatex() {
  if (!promise) {
    promise = import('katex/dist/katex.min.css')
      .then(() => import('katex/contrib/auto-render'))
      .then(mod => mod.default)
  }
  return promise
}
