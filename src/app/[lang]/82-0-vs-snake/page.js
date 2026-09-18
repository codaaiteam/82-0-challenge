import VsSnake from '../../82-0-vs-snake/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <VsSnake params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'vsSnake', '/82-0-vs-snake')
}

export function generateStaticParams() {
  return staticLangParams()
}
