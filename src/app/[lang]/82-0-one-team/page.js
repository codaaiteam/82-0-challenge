import PageOneTeam from '../../82-0-one-team/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <PageOneTeam params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'oneTeam', '/82-0-one-team')
}

export function generateStaticParams() {
  return staticLangParams()
}
