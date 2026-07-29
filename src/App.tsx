import { landingMarkup } from './landingMarkup'
import { useLandingInteractions } from './hooks/useLandingInteractions'

export default function App() {
  useLandingInteractions()

  return <div dangerouslySetInnerHTML={{ __html: landingMarkup }} />
}
