import BaseballMode2 from '../../82-0-baseball/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <BaseballMode2 params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'baseballMode2', '/82-0-baseball')
}

export function generateStaticParams() {
  return staticLangParams()
}
