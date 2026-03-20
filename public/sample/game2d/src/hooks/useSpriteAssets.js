import { useEffect, useState } from 'react'

export default function useSpriteAssets(animations) {
  const [images, setImages] = useState({})
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    const entries = Object.entries(animations)

    Promise.all(
      entries.map(([key, config]) => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.src = config.src
          img.onload = () => resolve([key, img])
          img.onerror = reject
        })
      })
    )
      .then((loaded) => {
        if (cancelled) return
        setImages(Object.fromEntries(loaded))
        setReady(true)
      })
      .catch((err) => {
        console.error('sprite load error', err)
      })

    return () => {
      cancelled = true
    }
  }, [animations])

  return { images, ready }
}
