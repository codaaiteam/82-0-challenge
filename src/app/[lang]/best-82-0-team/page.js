import BestTeam from '../../best-82-0-team/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <BestTeam params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'bestTeam', '/best-82-0-team')
}

export function generateStaticParams() {
  return staticLangParams()
}
