import TwentyZero from '../../20-0/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <TwentyZero params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'twentyZero', '/20-0')
}

export function generateStaticParams() {
  return staticLangParams()
}
