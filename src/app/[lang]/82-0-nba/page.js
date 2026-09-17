import NbaMode from '../../82-0-nba/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <NbaMode params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'nbaMode', '/82-0-nba')
}

export function generateStaticParams() {
  return staticLangParams()
}
