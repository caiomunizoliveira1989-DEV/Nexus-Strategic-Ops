import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Providers } from '@/app/providers'
import { LocationProvider } from '@/lib/context/location-context'
import { I18nProvider } from '@/lib/context/i18n-context'
import './globals.css'
import { ServiceWorkerRegister } from '@/components/pwa/service-worker-register'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Nexus Strategic Ops',
  description: 'Painel estratégico de operações',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Nexus',
    statusBarStyle: 'black-translucent',
  },
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background font-sans antialiased`}
      >
        <LocationProvider>
          <I18nProvider>
            <Providers>{children}</Providers>
          </I18nProvider>
        </LocationProvider>
        <ServiceWorkerRegister />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}