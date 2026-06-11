import Leaderboard from '../../leaderboard/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <Leaderboard params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'leaderboard', '/leaderboard')
}

export function generateStaticParams() {
  return staticLangParams()
}
