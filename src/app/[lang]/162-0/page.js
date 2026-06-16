import Baseball162 from '../../162-0/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <Baseball162 params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'baseball162', '/162-0')
}

export function generateStaticParams() {
  return staticLangParams()
}
