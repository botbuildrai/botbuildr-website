/** Calendly booking page — override via VITE_CALENDLY_URL at build time */
export const CALENDLY_URL =
  (import.meta.env.VITE_CALENDLY_URL as string | undefined) ||
  'https://calendly.com/botbuildr-ai'
