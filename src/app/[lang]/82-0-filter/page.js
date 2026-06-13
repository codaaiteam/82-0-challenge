import FilterPage from '../../82-0-filter/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <FilterPage params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'filter', '/82-0-filter')
}

export function generateStaticParams() {
  return staticLangParams()
}
