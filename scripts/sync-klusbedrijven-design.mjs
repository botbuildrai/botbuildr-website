#!/usr/bin/env node
/**
 * Sync BotBuildr Klusbedrijven landing from Claude Design export.
 *
 * Design project: https://claude.ai/design/p/834e97b4-4637-4bbc-9d48-ac293153f04f
 *
 * Usage:
 *   node scripts/sync-klusbedrijven-design.mjs              # desktop standalone
 *   node scripts/sync-klusbedrijven-design.mjs --mobile     # mobile standalone
 *   node scripts/sync-klusbedrijven-design.mjs path/to.html
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const siteRoot = path.resolve(__dirname, '..')
const designDir = path.join(siteRoot, 'design')

const args = process.argv.slice(2)
const isMobile = args.includes('--mobile')
const fileArg = args.find((a) => !a.startsWith('--'))

const defaultSource = path.join(
  designDir,
  isMobile
    ? 'BotBuildr-Website-Klusbedrijven-Mobile.standalone.html'
    : 'BotBuildr-Website-Klusbedrijven.standalone.html',
)
const source = path.resolve(fileArg || defaultSource)

const prefix = isMobile ? 'BotBuildr-Website-Klusbedrijven-Mobile' : 'BotBuildr-Website-Klusbedrijven'

function extractBundledHtml(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  const start = raw.indexOf('<script type="__bundler/template">')
  if (start < 0) throw new Error(`No __bundler/template block in ${filePath}`)
  const contentStart = start + 34
  const end = raw.indexOf('</script>', contentStart)
  let bundled = raw.slice(contentStart, end).trim()

  if (bundled.startsWith('"')) {
    try {
      bundled = JSON.parse(bundled)
    } catch {
      const doctypeIdx = bundled.indexOf('<!DOCTYPE')
      if (doctypeIdx < 0) throw new Error('Could not parse bundled template')
      let inner = bundled.slice(doctypeIdx)
      if (inner.endsWith('"')) inner = inner.slice(0, -1)
      bundled = inner
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\\//g, '/')
        .replace(/\\u002F/g, '/')
    }
  }
  return bundled
}

function extractBodyInner(html) {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
  if (!bodyMatch) throw new Error('No <body> in bundled HTML')
  let body = bodyMatch[1]
  const scriptIdx = body.indexOf('\n\n<script>')
  if (scriptIdx >= 0) body = body.slice(0, scriptIdx)
  return body.trim()
}

function writeLandingMarkup(bodyHtml) {
  const out = path.join(siteRoot, 'src', 'landingMarkup.ts')
  fs.writeFileSync(out, `export const landingMarkup = ${JSON.stringify(bodyHtml)}\n`)
  return out
}

if (!fs.existsSync(source)) {
  console.error(`Source not found: ${source}`)
  console.error('Export from Claude Design, then save as:')
  console.error(`  design/${prefix}.standalone.html`)
  process.exit(1)
}

const bundled = extractBundledHtml(source)
const body = extractBodyInner(bundled)

fs.writeFileSync(path.join(designDir, `${prefix}.extracted.html`), bundled)
fs.writeFileSync(path.join(designDir, `${prefix}.body.html`), body)

const markupPath = writeLandingMarkup(body)

console.log(`Synced Klusbedrijven ${isMobile ? 'mobile' : 'desktop'} design:`)
console.log('  source:', path.relative(siteRoot, source))
console.log('  body:', path.relative(siteRoot, path.join(designDir, `${prefix}.body.html`)), `(${body.length} chars)`)
console.log('  landingMarkup:', path.relative(siteRoot, markupPath))
console.log('')
console.log('Note: layout CSS lives in src/index.css. Interactions in useLandingInteractions.ts.')
