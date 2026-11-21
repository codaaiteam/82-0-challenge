import SixteenZero from '../../16-0/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <SixteenZero params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'sixteenZero', '/16-0')
}

export function generateStaticParams() {
  return staticLangParams()
}
