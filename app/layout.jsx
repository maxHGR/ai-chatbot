import './globals.css'
import { Providers } from './components/providers/providers'
import { Roboto } from 'next/font/google'

const roboto = Roboto({
  weight: '300',
  subsets: ['latin'],
})

export const metadata = {
  title: 'AI Weather Chat',
  description: 'Find out the weather at your desired Destination, with this helpful chatbot!',
  icons: {
    icon: './assets/weather.svg'
  }
}

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body className={`${roboto.className} md:text-xl`}>
          {children}
      </body>
    </html>
  )
}
