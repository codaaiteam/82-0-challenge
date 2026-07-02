import SeventeenZero from '../../17-0/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <SeventeenZero params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'seventeenZero', '/17-0')
}

export function generateStaticParams() {
  return staticLangParams()
}
