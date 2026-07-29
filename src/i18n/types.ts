export type Locale = 'en' | 'nl'

export type Translations = {
  meta: { title: string; videoAria: string; scroll: string }
  nav: {
    automate: string
    how: string
    ship: string
    cta: string
    ariaHome: string
  }
  hero: {
    h1: string
    lede: string
    ctaPrimary: string
    ctaSecondary: string
    foldCue: string
  }
  proof: {
    s1: string
    s2: string
    s3: string
    s4: string
  }
  automate: {
    eyebrow: string
    h2: string
    intro: string
    f1Tag: string
    f1H: string
    f1P: string
    f1Metric: string
    f2Tag: string
    f2H: string
    f2P: string
    f2Metric: string
    f3Tag: string
    f3H: string
    f3P: string
    f3Metric: string
  }
  how: {
    eyebrow: string
    h2: string
    s1H: string
    s1P: string
    s1Mech: string
    s2H: string
    s2P: string
    s2Mech: string
    s3H: string
    s3P: string
    s3Mech: string
  }
  ship: {
    eyebrow: string
    h2: string
    intro: string
    webH: string
    webP: string
    deckH: string
    deckP: string
    appH: string
    appP: string
  }
  case: {
    eyebrow: string
    dashTitle: string
    chartLabel: string
    before: string
    after: string
    quote: string
    who: string
  }
  journey: {
    eyebrow: string
    h2: string
    intro: string
    b1Eyebrow: string
    b1Line: string
    b2Eyebrow: string
    b2Line: string
    b3Eyebrow: string
    b3Line: string
    b4Eyebrow: string
    b4Line: string
    resBig: string
    resSub: string
  }
  contact: {
    eyebrow: string
    h2: string
    intro: string
    name: string
    email: string
    company: string
    serviceLabel: string
    servicePlaceholder: string
    services: Record<string, string>
    prompts: Record<string, string>
    messageDefault: string
    submit: string
    sending: string
    success: string
    error: string
  }
  footer: {
    automate: string
    how: string
    ship: string
    contact: string
    copyright: string
  }
}
