import BaseballAlias from '../../82-0-baseball/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <BaseballAlias params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'baseballAlias', '/82-0-baseball')
}

export function generateStaticParams() {
  return staticLangParams()
}
