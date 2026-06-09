import { useLandingInteractions } from './hooks/useLandingInteractions'
import { landingMarkup } from './landingMarkup'

export default function App() {
  useLandingInteractions()

  return <div dangerouslySetInnerHTML={{ __html: landingMarkup }} />
}
