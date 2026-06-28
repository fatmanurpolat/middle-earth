import { useTranslation } from 'react-i18next';
import { DASHBOARD_URL } from './lib/env';
import LanguageSwitcher from './components/LanguageSwitcher';
import Hero from './components/Hero';
import MysticalArtifactFrame from './components/MysticalArtifactFrame';
import LoreSection from './components/LoreSection';
import AgesJourney from './components/AgesJourney';
import Gallery from './components/Gallery';
import Timeline from './components/Timeline';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';

function TopBar() {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 border-b border-gold/15 bg-ink/70 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <a
          href="#top"
          className="font-display text-lg font-semibold tracking-[0.18em] text-gradient-gold"
        >
          {t('common.appName')}
        </a>

        <div className="hidden items-center gap-7 md:flex">
          <a
            href="#lore"
            className="font-display text-xs uppercase tracking-[0.25em] text-mithril/75 transition-colors hover:text-gold-bright"
          >
            {t('landing.nav.lore')}
          </a>
          <a
            href="#ages"
            className="font-display text-xs uppercase tracking-[0.25em] text-mithril/75 transition-colors hover:text-gold-bright"
          >
            {t('landing.nav.ages')}
          </a>
          <a
            href="#timeline"
            className="font-display text-xs uppercase tracking-[0.25em] text-mithril/75 transition-colors hover:text-gold-bright"
          >
            {t('landing.nav.timeline')}
          </a>
          <a
            href="#gallery"
            className="font-display text-xs uppercase tracking-[0.25em] text-mithril/75 transition-colors hover:text-gold-bright"
          >
            {t('landing.nav.gallery')}
          </a>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <a
            href={DASHBOARD_URL}
            className="rounded-full border border-gold/50 bg-gold/10 px-4 py-1.5 font-display text-xs uppercase tracking-[0.25em] text-gold-bright shadow-gold-glow transition-all duration-300 hover:bg-gold/20 hover:shadow-gold-glow-strong"
          >
            {t('landing.nav.enter')}
          </a>
        </div>
      </nav>
    </header>
  );
}

function ArtifactSection() {
  const { t } = useTranslation();

  return (
    <section className="relative mx-auto max-w-6xl px-6 py-10">
      <div className="mb-10 text-center">
        <h2 className="font-display text-3xl font-semibold text-gradient-gold sm:text-4xl">
          {t('landing.artifact.title')}
        </h2>
      </div>
      <MysticalArtifactFrame />
    </section>
  );
}

export default function App() {
  return (
    <div id="top" className="min-h-screen">
      <TopBar />
      <main>
        <Hero />
        <ArtifactSection />
        <LoreSection />
        <AgesJourney />
        <Timeline />
        <Gallery />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}
