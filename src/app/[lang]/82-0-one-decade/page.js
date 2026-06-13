import PageOneDecade from '../../82-0-one-decade/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <PageOneDecade params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'oneDecade', '/82-0-one-decade')
}

export function generateStaticParams() {
  return staticLangParams()
}
