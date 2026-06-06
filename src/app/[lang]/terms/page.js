import TermsOfUse, { metadata } from '../../terms/page'
import { staticLangParams } from '@/lib/pageMeta'

export { metadata }

export default function Page() {
  return <TermsOfUse />
}

export function generateStaticParams() {
  return staticLangParams()
}
