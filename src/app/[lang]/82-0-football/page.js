import FootballMode from '../../82-0-football/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <FootballMode params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'footballMode', '/82-0-football')
}

export function generateStaticParams() {
  return staticLangParams()
}
