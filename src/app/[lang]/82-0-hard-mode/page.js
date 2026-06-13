import PageHardMode from '../../82-0-hard-mode/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <PageHardMode params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'hardMode', '/82-0-hard-mode')
}

export function generateStaticParams() {
  return staticLangParams()
}
