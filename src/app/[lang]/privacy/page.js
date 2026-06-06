import PrivacyPolicy, { metadata } from '../../privacy/page'
import { staticLangParams } from '@/lib/pageMeta'

export { metadata }

export default function Page() {
  return <PrivacyPolicy />
}

export function generateStaticParams() {
  return staticLangParams()
}
