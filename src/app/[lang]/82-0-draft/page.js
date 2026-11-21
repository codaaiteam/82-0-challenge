import DraftMode from '../../82-0-draft/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <DraftMode params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'draftMode', '/82-0-draft')
}

export function generateStaticParams() {
  return staticLangParams()
}
