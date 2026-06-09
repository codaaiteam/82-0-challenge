import Unblocked from '../../unblocked/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <Unblocked params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'unblocked', '/unblocked')
}

export function generateStaticParams() {
  return staticLangParams()
}
