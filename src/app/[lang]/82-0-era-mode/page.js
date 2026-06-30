import PageEraMode from '../../82-0-era-mode/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <PageEraMode params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'eraMode', '/82-0-era-mode')
}

export function generateStaticParams() {
  return staticLangParams()
}
