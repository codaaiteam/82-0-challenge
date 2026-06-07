import About, { metadata } from '../../about/page'
import { staticLangParams } from '@/lib/pageMeta'

export { metadata }

export default function Page() {
  return <About />
}

export function generateStaticParams() {
  return staticLangParams()
}
