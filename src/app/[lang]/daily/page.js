import Daily from '../../daily/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <Daily params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'daily', '/daily')
}

export function generateStaticParams() {
  return staticLangParams()
}
