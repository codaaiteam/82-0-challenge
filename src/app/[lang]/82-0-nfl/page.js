import NflMode from '../../82-0-nfl/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <NflMode params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'nflMode', '/82-0-nfl')
}

export function generateStaticParams() {
  return staticLangParams()
}
