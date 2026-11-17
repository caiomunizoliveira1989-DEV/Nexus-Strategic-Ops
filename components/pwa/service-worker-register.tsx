'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegister() {
useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return
    if (process.env.NODE_ENV !== 'production') return

    navigator.serviceWorker
    .register('/sw.js')
    .catch((error) => console.error('Falha ao registrar service worker:', error))
}, [])

return null
}