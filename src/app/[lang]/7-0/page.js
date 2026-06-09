import SevenZero from '../../7-0/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <SevenZero params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'sevenZero', '/7-0')
}

export function generateStaticParams() {
  return staticLangParams()
}
