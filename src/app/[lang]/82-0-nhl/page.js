import NhlEightyTwo from '../../82-0-nhl/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <NhlEightyTwo params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'nhl', '/82-0-nhl')
}

export function generateStaticParams() {
  return staticLangParams()
}
