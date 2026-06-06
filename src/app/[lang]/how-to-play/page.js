import HowToPlay from '../../how-to-play/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <HowToPlay params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'howToPlay', '/how-to-play')
}

export function generateStaticParams() {
  return staticLangParams()
}
