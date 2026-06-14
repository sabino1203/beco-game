import { useState, useEffect } from 'react'

export function useTimer(totalSeconds: number, startedAt: number | null): number {
  const [remaining, setRemaining] = useState(totalSeconds)

  useEffect(() => {
    if (!startedAt) {
      setRemaining(totalSeconds)
      return
    }

    const tick = () => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000)
      setRemaining(Math.max(0, totalSeconds - elapsed))
    }

    tick()
    const id = setInterval(tick, 500)
    return () => clearInterval(id)
  }, [totalSeconds, startedAt])

  return remaining
}
