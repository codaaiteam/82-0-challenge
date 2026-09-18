import VsConnections from '../../82-0-vs-connections/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <VsConnections params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'vsConnections', '/82-0-vs-connections')
}

export function generateStaticParams() {
  return staticLangParams()
}
