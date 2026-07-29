import { useLanguage } from '../i18n/LanguageProvider'
import { getTranslations } from '../i18n/translations'
import type { Locale } from '../i18n/types'

function LangToggle({ locale, onChange }: { locale: Locale; onChange: (l: Locale) => void }) {
  return (
    <div className="lang-toggle" role="group" aria-label="Language">
      <button
        type="button"
        className={locale === 'en' ? 'active' : ''}
        onClick={() => onChange('en')}
        aria-pressed={locale === 'en'}
      >
        EN
      </button>
      <button
        type="button"
        className={locale === 'nl' ? 'active' : ''}
        onClick={() => onChange('nl')}
        aria-pressed={locale === 'nl'}
      >
        NL
      </button>
    </div>
  )
}

export function Nav() {
  const { locale, setLocale } = useLanguage()
  const t = getTranslations(locale).nav

  return (
    <div className="navwrap">
      <nav className="nav glass">
        <a href="#top" className="logo" aria-label={t.ariaHome}>
          <span className="cursor">▋</span>
          <span>
            BotBuildr<span className="dotai">.ai</span>
          </span>
        </a>
        <div className="nav-links">
          <a href="#automate" className="lk hide-sm">
            {t.automate}
          </a>
          <a href="#how" className="lk hide-sm">
            {t.how}
          </a>
          <a href="#ship" className="lk hide-sm">
            {t.ship}
          </a>
          <LangToggle locale={locale} onChange={setLocale} />
          <a href="#contact" className="nav-cta">
            {t.cta}
          </a>
        </div>
      </nav>
    </div>
  )
}
