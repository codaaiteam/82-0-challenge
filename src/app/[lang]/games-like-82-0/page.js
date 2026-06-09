import GamesLike from '../../games-like-82-0/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <GamesLike params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'gamesLike', '/games-like-82-0')
}

export function generateStaticParams() {
  return staticLangParams()
}
