import SeventyTwo from '../../72-0/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <SeventyTwo params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'seventyTwo', '/72-0')
}

export function generateStaticParams() {
  return staticLangParams()
}
