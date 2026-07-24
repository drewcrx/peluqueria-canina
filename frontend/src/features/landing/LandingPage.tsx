import { Benefits } from './Benefits'
import { CallToAction } from './CallToAction'
import { Faq } from './Faq'
import { Features } from './Features'
import { Footer } from './Footer'
import { Hero } from './Hero'
import { HowItWorks } from './HowItWorks'
import { Navbar } from './Navbar'
import { Pricing } from './Pricing'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Benefits />
        <HowItWorks />
        <Pricing />
        <Faq />
        <CallToAction />
      </main>
      <Footer />
    </div>
  )
}
