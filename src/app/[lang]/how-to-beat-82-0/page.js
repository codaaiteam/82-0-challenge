import HowToBeat from '../../how-to-beat-82-0/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <HowToBeat params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'howToBeat', '/how-to-beat-82-0')
}

export function generateStaticParams() {
  return staticLangParams()
}
