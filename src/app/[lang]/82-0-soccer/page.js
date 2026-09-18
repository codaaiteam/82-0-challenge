import SoccerMode from '../../82-0-soccer/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <SoccerMode params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'soccerMode', '/82-0-soccer')
}

export function generateStaticParams() {
  return staticLangParams()
}
