'use client'

import Header from './Header'
import Hero from './Hero'
import HowItWorks from './HowItWorks'
import SectionForPatients from './SectionForPatients'
import SectionForPharmacies from './SectionForPharmacies'
import SectionForClinics from './SectionForClinics'
import Testimonials from './Testimonials'
import FAQ from './FAQ'
import Footer from './Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <SectionForPatients />
        <SectionForPharmacies />
        <SectionForClinics />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
