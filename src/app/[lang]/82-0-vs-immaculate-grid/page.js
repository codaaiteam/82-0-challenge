import VsImmaculateGrid from '../../82-0-vs-immaculate-grid/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <VsImmaculateGrid params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'vsImmaculateGrid', '/82-0-vs-immaculate-grid')
}

export function generateStaticParams() {
  return staticLangParams()
}
