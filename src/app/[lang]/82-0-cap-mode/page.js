import CapMode from '../../82-0-cap-mode/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <CapMode params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'capMode', '/82-0-cap-mode')
}

export function generateStaticParams() {
  return staticLangParams()
}
