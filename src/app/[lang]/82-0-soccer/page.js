import SoccerAlias from '../../82-0-soccer/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <SoccerAlias params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'soccerAlias', '/82-0-soccer')
}

export function generateStaticParams() {
  return staticLangParams()
}
