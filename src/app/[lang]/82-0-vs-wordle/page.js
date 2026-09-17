import VsWordle from '../../82-0-vs-wordle/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <VsWordle params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'vsWordle', '/82-0-vs-wordle')
}

export function generateStaticParams() {
  return staticLangParams()
}
