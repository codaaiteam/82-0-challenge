import TeamBuilder from '../../team-builder/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <TeamBuilder params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'teamBuilder', '/team-builder')
}

export function generateStaticParams() {
  return staticLangParams()
}
