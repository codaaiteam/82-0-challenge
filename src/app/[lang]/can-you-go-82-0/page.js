import CanYouGo from '../../can-you-go-82-0/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <CanYouGo params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'canYouGo', '/can-you-go-82-0')
}

export function generateStaticParams() {
  return staticLangParams()
}
