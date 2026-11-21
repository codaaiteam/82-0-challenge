import BasketballMode from '../../82-0-basketball/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <BasketballMode params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'basketballMode', '/82-0-basketball')
}

export function generateStaticParams() {
  return staticLangParams()
}
