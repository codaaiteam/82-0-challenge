import PageNoMvps from '../../82-0-no-mvps/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <PageNoMvps params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'noMvps', '/82-0-no-mvps')
}

export function generateStaticParams() {
  return staticLangParams()
}
