import HowItsCalculated from '../../how-its-calculated/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <HowItsCalculated params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'howItsCalculated', '/how-its-calculated')
}

export function generateStaticParams() {
  return staticLangParams()
}
