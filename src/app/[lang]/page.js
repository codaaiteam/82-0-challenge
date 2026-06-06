import Home from '../page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <Home params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, null, '')
}

export function generateStaticParams() {
  return staticLangParams()
}
